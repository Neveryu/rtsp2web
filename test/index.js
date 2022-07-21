const RTSP2web = require('../resource.js')

// 服务端长连接占据的端口号
const port = 8888

/**
 * 关于videoSize参数的说明
 * @type {String} eg: 1920x1080
 * 不传这个参数时，默认是1920x1080
 * 具体传哪个值比较好，应该根据您的摄像头分辨率来设置
 * 例如：720x360；1080x720；等等之类的值
 */
const videoSize = '720x360'

new RTSP2web({
	port,
	videoSize
})