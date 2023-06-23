const RTSP2web = require('rtsp2web')

// 服务端长连接占据的端口号
let port = 9999

new RTSP2web({
  port,
  q: 20
})
