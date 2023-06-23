const https = require('https')
const http = require('http')
const fs = require('fs')
const events = require('events')
const net = require('net')
const tls = require('tls')

/**
 * 【node create https】
 * 第一种方式
 */
const options1 = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
}
console.log(options1)

/**
 * 【node create https】
 * 第二种方式
 */
const options2 = {
  pfx: fs.readFileSync('./cert.pfx'),
  passphrase: fs.readFileSync('./passphrase.txt')
}
console.log(options2)

/**
 * https
 * http.createServer() return https.Server
 * https.Server Extends tls.Server
 * tls.Server Extends net.Server
 * net.Server Extends EventEmitter
 */
const httpServer = https
  .createServer(options2, (req, res) => {
    res.writeHead(200)
    res.end('hello world https\n')
  })
  .listen(8081)

/**
 * http
 * http.Server Extends net.Server
 * net.Server Extends EventEmitter
 */
// const httpServer = http
//   .createServer((req, res) => {
//     res.writeHead(200)
//     res.end('hello world http\n')
//   })
//   .listen(8081)

console.log(Object.getPrototypeOf(httpServer) instanceof tls.Server)

// curl -k https://localhost:8081/
// -k参数指定跳过 SSL 检测。
// $ curl -k https://www.example.com
// 上面命令不会检查服务器的 SSL 证书是否正确。

/**
 * How to Generate SSL Certificates
 * use key & cert
 */
// 1、先生成key.pem（生成一个私钥）
// 2、再生成csr.pem（使用私钥创建一个CSR（证书签署请求））
// 3、再生成cert.pem（从CSR中生成SSL证书，完了，现在你可以删除csr.pem文件，也可以保留它。）

/**
 * How to Generate SSL Certificates
 * use pfx & passphrase
 */
// 1、根据上面的key.pem和cert.pem文件来生成cert.pfx
// 2、它会要你输入密码
// 3、把你输入的密码手动写到passphrase.txt文件中
// 这样你就得到了cert.pfx和passphrase.txt
