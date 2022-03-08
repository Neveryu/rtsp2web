/**
 * 原理：
 * 使用node向前端发送数据帧（数据帧是以websocket的方式发送）
 * 前端页面引入jsmpeg.js视频播放器，将接收的数据帧，实时的在canvas中绘制成画面
 */

/**
 * 使用node-rtsp-stream来进行rtsp
 * @type {[type]}
 */
const http = require('http')
const Stream =  require('node-rtsp-stream')

// rtsp视频流源地址；可以先在VCL中测试摄像头是否播放正常
// const rtsp_url = 'rtsp://admin:123456aa@172.16.1.80/Streaming/Channels/101'
const rtsp_url = 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov'

const stream = new Stream({
  name: "socket",
  streamUrl: rtsp_url,
  wsPort : 9990, // ws的端口
  ffmpegOptions : {
    "-stats" : "", // 没有必要值的选项使用空字符串
    "-r" : 20,
    "-s" : "1920 1080",
    "-b:v": "2000k"
  }
})

const port = 3000
// app.set('port', port)

var server = http.createServer()

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port)

/**
 * 思考：需要解决几个问题
 * 1、如何实现动态的rtsp_url；（rtsp_url的值由前端传过来）
 * 2、如何支持同时播放多个rtsp视频流；（node-rtsp-stream可以支持吗？）
 * 3、作为一个视频转码工具，如何做成标准化输入输出？
 * * node-rtsp-stream的输入是一个rtsp视频流，输出是一个websocket服务。
 * * 在需要同时播放多个视频流的需求情形下，我们可以new多个node-rtsp-stream出来，
 * * 那么就要生成多个websocket，并占据多个端口，这不是一个好的解决办法。
 * *
 * 【ffmpeg是一个用来做数字音频、视频数据的处理和转换的应用程序】
 * *ffmpeg提供丰富的视频处理功能，可以将视频流转成每一帧数据
 * *利用这一点，我们可以借助ffmpeg这个应用程序并配合JSMpeg视频播放器来将rtsp视频在web中实时播放
 * *【那么这种方案就可以解决上面的几个问题吗？答案是可以的】
 * *1、服务端创建一个websocket长连接，前端每一个新的需要播放的rtsp视频流，
 * *就连接服务端的这个websocket长连接，rtsp的url通过连接websocket时参数传递给服务端，（解决了动态rtsp_url的问题）
 * *每一个新的websocket连接过来后，服务端就调用系统的`ffmpeg`应用程序来处理这个`rtsp`视频流，生成数据帧。（服务端代码如何调用系统的`ffmpeg`应用程序呢？）
 * *每一个新的websocket连接成功，就会有一个新的ws句柄，每一个ws句柄负责自己的这个rtsp视频流的推送（推送的是数据帧）。（服务端进行rtsp url的重复性校验）
 * （这就解决了支持同时播放多个rtsp视频流的问题）
 * （服务端创建一个websocket就行了，传入rtsp视频流的url，输出的是数据帧，也就解决了第3个问题）
 * 
 * 【服务端代码如何调用系统的`ffmpeg`应用程序呢？】（以nodejs为例来讲解）
 * Node 提供了 child_process 模块来创建子进程，每个子进程总是带有三个流对象：child.stdin、child.stdout和child.stderr。
 * 他们可能会共享父进程的 stdio 流，或者也可以是独立的被导流的流对象。
 *
 * child_process模块有三个方法：【child_process.exec、child_process.spawn、child_process.fork】
 * child_process.spawn：使用指定的命令行参数创建新进程。spawn() 方法返回流 (stdout & stderr)，在进程返回大量数据时使用。进程一旦开始执行时 spawn() 就开始接收响应。
 * 所以我们可以在代码中使用`child_process.spawn()`来执行`ffmpeg`命令行；来进行转码操作并以流的形式输出数据帧
 */

// OK，至此，所有的问题都有了解决方案，那就开始coding