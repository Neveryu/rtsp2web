const RTSP2web = require('../dist/rtsp2web.js')

// 服务端长连接占据的端口号
const port = 9999
new RTSP2web({
	port
})