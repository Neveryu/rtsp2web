/*!
 * name: resource.js
 * desc: resource.js是rtsp2web的源码；可以直接参考test目录中的用法直接使用
 * (c) begin with 2022 by NeverYu
 * Released under the ISC License.
 */
const child = require('child_process')
const util = require('util')
const events = require('events')
const url = require('url')
const { decode } = require('base-64')
const WebSocket = require('ws')
const WebSocketServer = WebSocket.Server

// 默认的ffmpeg路径（一般正常安装的ffmpeg，名称(路径)是：ffmpeg）
const FFmpegPath = 'ffmpeg'
// 默认的端口
const defaultPort = 9999
// 默认的视频视口框架大小
let videoSize = '1920x1080'

/**
 * 用于创建一个新的视频转码流类
 */
class Mpeg2Muxer extends events.EventEmitter {
  exitCode = undefined
  // 额外的 ffmpeg 参数
  additionalFlags = []
  stream = null
  inputStreamStarted = false
  constructor(options) {
    super()
    this.options = options
    this.ffmpegPath = options.ffmpegPath || FFmpegPath
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

    this.stream.on('error', (code, signal) => {
      console.error('启动ffmpeg时出错，请确保你安装了ffmpeg，然后检查路径或者命令参数')
    })
    this.stream.on('close', (code, signal) => {
      console.log('ffmpeg关闭，code：', code)
      return this.emit('exitWithError')
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
        "-s": videoSize,
        "-b:v": "2000k"
      },
      url: this.config.url,
      ffmpegPath: "ffmpeg"
		})
    this.mpeg2Muxer.stream = this.mpeg2Muxer.instance.stream
    this.mpeg2Muxer.instance.on('mpeg2data', (data) => {
      /**
       * 【广播数据】
       * rtsp视频流实时转帧之后，当前视频流通道实时进行广播
       * 将图像数据广播给它的所有client（也就是它的每个ws句柄）
       */
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

/**
 * 入口类
 */
class RTSP2web {
	// 视频实例列表(以rtsp_url作为唯一区分)
	channels = []
	/**
   * 实例化一个流媒体服务器对象
   * @param http HTTP服务
   */
  constructor(config) {
    // 用户可以自定义分辨率
    if(config && config.videoSize) {
      if(config.videoSize.includes('x')) {
        videoSize = config.videoSize
      }
    }

    // RTSP2web是入口类，在入口类中对视频通道进行空闲检测
    setInterval(() => this.checkFree(), 10000)

  	// 创建websocket服务器，监听在${port}端口
  	this.wss = new WebSocketServer({
  		port: config ? config.port || defaultPort : defaultPort
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
      console.log('一个新的client(ws句柄)连接成功')
  	})
  }

  /**
   * 注册一个视频播放流通道(注册一个ws句柄)
   * 一个视频流通道，可能有多个ws句柄(客户端)在同时使用
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

  /**
   * 创建一个视频通道
   * @Author   Author
   * @DateTime 2022-05-06T14:40:28+0800
   * @param    {[type]}                 data [description]
   * @param    {[type]}                 ws   [description]
   * @return   {[type]}                      [description]
   */
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
