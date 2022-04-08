/*!
 * name: main.js
 * desc: 为了将rtsp2web发布为一个 npm 包；
 * 由于resource.js中require了一些第三方node包，在使用rollup打包时，
 * 不符合模块打包的规范（import是符合模块打包规范的）
 * main.js就是将resource.js进行轻微的改动；以及精简（为了打包产物最小化）
 * 这样可以使用rollup进行打包处理，以及做一些压缩和babel的处理
 * 打包后的产物直接看dist目录里面的吧，使用方法参考example目录
 * (c) begin with 2022 by NeverYu
 * Released under the ISC License.
 */
const child = require('child_process')
const events = require('events')
const url = require('url')
import { decode } from 'base-64'
import { Server } from 'ws'
const WebSocketServer = Server

/**
 * 用于创建一个新的视频转码流类
 */
class Mpeg2Muxer extends events.EventEmitter {
  exitCode = undefined
  additionalFlags = []
  stream = null
  inputStreamStarted = false
  constructor(options) {
    super()
    this.options = options
    this.ffmpegPath = options.ffmpegPath
    this.url = options.url
    this.ffmpegOptions = options.ffmpegOptions
    this.initMpeg2Muxer()
  }
  initMpeg2Muxer() {
    // ffmpeg参数解析
    if (this.ffmpegOptions) {
      for (let key in this.ffmpegOptions) {
        this.additionalFlags.push(key)
        if (String(this.ffmpegOptions[key]) !== '') {
          this.additionalFlags.push(String(this.ffmpegOptions[key]))
        }
      }
    }
    // 参数整合拼接
    this.spawnOptions = [
      "-rtsp_transport", "tcp", "-thread_queue_size", "512",
      "-i",
      this.url,
      '-f',
      'mpegts',
      '-codec:v',
      'mpeg1video',
      // additional ffmpeg options go here
      ...this.additionalFlags,
      '-'
    ]
    // 创建一个命令行子进程
    this.stream = child.spawn(this.ffmpegPath, this.spawnOptions, {
      detached: false
    })
    this.inputStreamStarted = true
    this.stream.stdout.on('data', (data) => {
      return this.emit('mpeg2data', data)
    })
    this.stream.stderr.on('data', (data) => {
      return this.emit('ffmpegStderr', data)
    })
    this.stream.on('exit', (code, signal) => {
      if (code === 1) {
        console.error('RTSP stream exited with error')
        this.exitCode = 1
        return this.emit('exitWithError')
      }
    })
  }
}

/**
 * 一个视频通道可能对应多个客户端（也就是多个ws句柄）
 * 为什么呢
 * 因为一个rtsp视频流可能有多个客户端在同时播放的情况，视频转码是需要消耗电脑cpu的
 * 为了避免资源的浪费，同一个rtsp视频流只开启一个转码程序，也就是一个视频通道
 * 多个ws句柄可以共用一个视频通道
 */
class Channel {
  /**
   * 视频通道空闲的时间，如果这个视频通道的空闲时间超过一个设定值
   * 我们就可以关闭这个视频通道了，停掉转码服务，释放电脑资源
   * @type {Number}
   */
  freeTime = 0
	/* 视频通道是否正在封装码流 */
  isStreamWrap = false
  clients = []
  mpeg2Muxer = {
    instance: null,
    stream: null,
    data: null
  }

	constructor(config, client) {
    // 前端传过来的参数
		this.config = config
    // 当前视频通道的ws句柄
    this.client = client
	}
  // 创建一个rtsp的视频转码
  createStream() {
		if(this.isStreamWrap) {
			return
		}
		this.isStreamWrap = true
		this.mpeg2Muxer.instance = new Mpeg2Muxer({
      ffmpegOptions : {
        "-stats": "", // 没有必要值的选项使用空字符串
        "-r": 20,
        "-s": "1920x1080",
        "-b:v": "2000k"
      },
      url: this.config.url,
      ffmpegPath: "ffmpeg"
		})
    this.mpeg2Muxer.stream = this.mpeg2Muxer.instance.stream
    this.mpeg2Muxer.instance.on('mpeg2data', (data) => {
      this.broadcast(data)
      // this.mpeg2Muxer.data = data
    })
	}
  /**
   * 结束视频转码推流，销毁一个视频通道
   */
  stopStreamWrap() {
    this.mpeg2Muxer.stream.kill()
    this.mpeg2Muxer.stream = null
  }
  broadcast(data) {
    for(let client of this.clients) {
      if(client.isSegment) {
        client.send(data)
      }
    }
  }
  // client就是每个ws连接成功后的句柄
	addClient(client) {
    client.once('close', () => {
      this.dropClient(client)
    })
    this.clients.push(client)
		if(!this.isStreamWrap) {
			this.createStream()
		}
    // isSegment是一个标志位，标识这个ws句柄正在使用中
    client.isSegment = true
	}
  // ws句柄向客户端发送数据帧
  sendData(client) {
    client.send(this.mpeg1Muxer.data)
    // isSegment是一个标志位，标识这个ws句柄正在使用中
    client.isSegment = true
  }
  dropClient(client) {
    let index = this.clients.indexOf(client)
    if(index > -1) {
      this.clients.splice(index, 1)
    }
  }
}

import { version } from './package.json'

/**
 * 入口类
 */
class RTSP2web {
  static version = version
	// 视频实例列表(以rtsp_url作为唯一区分)
	channels = []
	/**
   * 实例化一个流媒体服务器对象
   * @param http HTTP服务
   */
  constructor(config) {
    // RTSP2web是入口类，在入口类中对视频通道进行空闲检测
    setInterval(() => this.checkFree(), 10000)

  	// 创建websocket服务器，监听在${port}端口
  	this.wss = new WebSocketServer({
  		port: config ? config.port || 9999 : 9999
  	})

  	/**
  	 * Event: 'connection'成功握手连接时触发
  	 * [socket] {WebSocket} socket连接句柄（解释：每一个成功连接到这个websocket服务器的链接就是一个句柄，句柄之间是独立的）
  	 * [request] {http.IncomingMessage}
  	 */
  	this.wss.on('connection', (ws, request) => {
  		// 通过 ws 对象，就可以获取到客户端发送过来的信息和主动推送信息给客户端
  		// 1、解析url
  		const params = url.parse(request.url, true)
  		// console.log(params.query.url)

  		// 2、每一个新的长连接连接成功以后，给它注册一下（其实就是记录一下）
  		if (params.query.url) {
        // 因为我定义的是，前端的rtsp_url用btoa处理后以参数的形式传入，所有这里需要解析一下
        const url = decode(params.query.url.toString())
        // console.log(url)
        this.registeClient(ws, {
        	url
        })
    	}
      console.log('ws连接成功')
  	})
  }

  /**
   * 注册一个视频播放流(注册一个ws句柄)
   */
  registeClient(ws, data) {
  	let channel = this.getChannel(data.url)
  	if(!channel) {
  		channel = this.createChannel(data, ws)
  	}
  	channel.addClient(ws)
  }

  getChannel(url) {
  	for(let channel of this.channels) {
  		if(channel.config.url === url) {
  			return channel
  		}
  	}
  	return null
  }

  createChannel(data, ws) {
    // 一个channel就是一个视频通道
  	const channel = new Channel(data, ws)
  	this.channels.push(channel)
  	return channel
  }

  /**
   * 空闲检测，视频通道空间超过1分钟，则移除对应的视频通道
   * @Author   Author
   * @DateTime 2022-02-15T14:25:47+0800
   * @return   {[type]}                 [description]
   */
  checkFree() {
    for(let channel of this.channels) {
      if(channel.clients.length > 0) {
        channel.freeTime = 0
      } else {
        channel.freeTime += 10
      }
      if(channel.freeTime >= 60) {
        this.destroyedChannel(channel)
      }
    }
  }

  /**
   * 销毁/停掉一个视频通道
   * @Author   Author
   * @DateTime 2022-02-15T14:29:35+0800
   * @param    {[type]}                 channel [description]
   * @return   {[type]}                         [description]
   */
  destroyedChannel(channel) {
    let index = this.channels.indexOf(channel)
    if(index > -1) {
      this.channels.splice(index, 1)
      channel.stopStreamWrap()
    }
  }
}

module.exports = RTSP2web
