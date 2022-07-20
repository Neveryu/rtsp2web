const RTSP2web = require('../resource.js')

// 服务端长连接占据的端口号
const port = 8888
const videoSize = '4000x2000'
new RTSP2web({
	port,
	videoSize
})