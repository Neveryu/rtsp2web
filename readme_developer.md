# 安装依赖

```bash
npm i
```

# 【准备知识】FFMpeg 帮助说明

```bash
-L 展示许可证
-h, -?, -help, --help [arg] 帮助
-fromats 显示可用的格式（包括设备），编解码的，协议的。
-version 展示版本
-demuxers 展示可封装的格式
-muxers  展示可解封装的格式
-devices 展示可用的设备
-codecs  显示libavcodec已知的所有编解码器。
-decoders 显示可用的解码器。
-encoders 显示所有可用的编码器。
-bsfs 显示所有可用的比特流滤波器
-protocols 显示可用的协议。
-filters 显示可用的libavfilter过滤器（查看ffmpeg支持哪些滤镜）。
-pix_fmts 显示可用的像素格式。
-sample_fmts
-layouts 显示频道名称和标准频道布局。
-dispositions 显示流的disposition
-colors 显示识别的颜色名称
-sources device[,opt1=val1[,opt2=val2]...]
显示输入设备的自动检测源。一些设备可能提供无法自动检测的系统依赖的源名称。不能假设返回的列表总是完整的。
```

# 开发人员阅读手册

1、关于 `package script` 中脚本命令的说明：

```
node-test: 开发时使用的环境
start: 用pm2来启动开发环境
build: 使用rollup打包
```

2、关于 `Node.js` 中 `Buffer`(缓冲区) 的介绍说明：

JavaScript 语言自身只有字符串数据类型，没有二进制数据类型。

但在处理像 TCP 流或文件流时，必须使用到二进制数据。因此在 Node.js 中，定义了一个 Buffer 类，该类用来创建一个专门存放二进制数据的缓存区。

在 Node.js 中，Buffer 类是随 Node 内核一起发布的核心库。Buffer 库为 Node.js 带来了一种存储原始数据的方法，可以让 Node.js 处理二进制数据，每当需要在 Node.js 中处理 I/O 操作中移动的数据时，就有可能使用 Buffer 库。原始数据存储在 Buffer 类的实例中。一个 Buffer 类似于一个整数数组，但它对应于 V8 堆内存之外的一块原始内存。

> 在 v6.0 之前创建 Buffer 对象直接使用 `new Buffer()` 构造函数来创建对象实例，但是 Buffer 对内存的权限操作相比很大，可以直接捕获一些敏感信息，所以在 v6.0 以后，官方文档里面建议使用 Buffer.from() 接口去创建 Buffer 对象。

3、`npm cache verify`

when you run the command npm cache verify , you can see this path along with other details. ie; npm cache verify : Verifies the contents of the cache folder, garbage collecting any unneeded data, and verifying the integrity of the cache index and all cached data. npm cache clean --force delete the entire cache.

当你运行 `npm cache verify` 命令时，你可以看到这个路径和其他细节。即，`npm cache verify` : 验证 cache 文件夹的内容，垃圾收集任何不需要的数据，并验证 cache 索引和所有缓存数据的完整性。

# 开发人员须知

开发时，在 `resource.js` 上进行源码开发和本地测试；本地测试使用 `test` 目录，启动 `test` 目录中的 `index.js`，然后，打开 `test` 目录中的 `index.html` 页面即可。

# 预发布验证

准备发布时，在 `example` 中验证打包的产物。

# rtsp2web 进阶

一、创建 `jsmpeg` 自动识别方式：

`jsmpeg.js` 会自动识别 `docment` 中所有 `class` 包含 `jsmpeg` 的元素，并获取 `data-url` 属性后把该元素当做播放器容器，`html` 如下:

```html
<div class="jsmpeg" data-url="ws://xxxx"></div>
```

```js
ffmpeg -rtsp_transport tcp -i rtsp://[用户名]:[密码]@[ip]:554/h264/ch1/main/av_stream -q 0 -f mpegts -codec:v mpeg1video -s 1280x720 -b:v 1500k -codec:a mp2 -ar 44100 -ac 1 -b:a 128k http://127.0.0.1:8890/test
```

```js
ffmpeg -rtsp_transport tcp -i rtsp流地址 -q 0 -f mpegts -codec:v mpeg1video -s 1280x720 -b:v 1500k -codec:a mp2 -ar 44100 -ac 1 -b:a 128k http://127.0.0.1:8890/test
```

[jsmpeg.js 采用软解码方式，仅支持 mpeg1 格式视频、mp2 格式音频！！啊啊啊！！！](https://blog.csdn.net/a843334549/article/details/120697574)

[mux，demux 视频/音频封装 | 复用和解复用](https://segmentfault.com/a/1190000041612695)

# rtsp2web 高阶

- 1、水印[x]
- 2、开启 GPU
- 3、wss[x]
- 4、支持 flv 等其他播放插件

<!-- | vcodec | 视频编解码方式；（type：String）<br/>默认值：'mpeg1video'<br/>请确保你了解该参数的意义，默认可以不传 | -->

# Solution - 常见问题解决方案

## 1、method SETUP failed: 461 Client error

解决方法：
提示这个 RTSP 流不支持 TCP transport，修改程序参数设置 transport 为 udp 试试。

`rtsp_transport` 是 ffmpeg 中用来指定 RTSP 传输协议的参数。RTSP 是一种实时流传输协议，常用于音视频流的传输。

`rtsp_transport` 参数有以下几个可选值：

- `udp`：使用 UDP 传输。
- `tcp`：使用 TCP 传输。
- `udp_multicast`：使用 UDP 组播传输。
- `http`：使用 HTTP 传输。

默认情况下，ffmpeg 会自动选择合适的传输协议。但是在某些情况下，需要手动指定传输协议，比如在使用 RTSP 传输时，如果网络不稳定，可以选择使用 TCP 传输来保证数据的可靠性。

## 2、3221225477

- 错误 3221225477 代表 Windows 上的访问违规。你的脚本（或你的任何依赖）是否使用了任何从 C++源代码编译的本地模块（.node 文件）？如果你只使用了 JavaScript 文件，这可能是 V8 引擎的一个错误，也可能是堆栈溢出，如果你有太深的递归和 V8 计算错误的堆栈大小。

- 据我所知，这似乎是与 Windows 访问冲突相关的错误。

[npm ERR! errno 3221225477](https://blog.csdn.net/lychee_xiahua/article/details/109734527)

# SSL

## 生成 key 和 cert

1、生成私钥 key 文件：

```
$ openssl genrsa -out key.pem
```

2、通过私钥生成 CSR 证书签名（由于我们是自己的证书颁发机构，因此我们需要使用 CSR 来生成我们的证书。）

```
$ openssl req -new -key key.pem -out csr.pem
# Country Name -> CN
# Name(full name) -> .
# 其他全部都是 -> .
```

3、通过私钥和证书签名生成证书文件

```
$ openssl x509 -req -in csr.pem -signkey key.pem -out cert.pem
$ openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem
```

key.pem (私钥)
csr.pem (CSR 证书签名)(可以删除)
cert.pem (证书文件)

## 生成 pfx&pass

**如何创建 PFX 文件**
PFX 文件表示`PKCS#12`格式的证书；它包含证书、证书可信度所必需的中间授权证书以及证书的私钥。将其视为一个存档，其中存储了部署证书所需的一切。

**什么时候需要创建 PFX？最常见的场景**
您将在 Windows Server (IIS) 上安装证书，但未在 IIS 中创建 CSR 请求。
您需要 Windows Server 的证书，但没有 IIS 来生成 CSR。
您在 SSLmarket 中创建了 CSR 并保存了您的私钥。您现在需要将证书部署到 Windows Server。
你有一个代码签名证书，你需要 PFX 来签名。

## 使用 OpenSSL 创建 PFX

OpenSSL 是一个可在任何 Unix 操作系统上使用的库（程序）。如果您有 Linux 服务器或在 Linux 上工作，那么 OpenSSL 绝对是可用程序之一（在存储库中）。

在 OpenSSL 中，必须在单个 PFX (PKCS#12) 文件中使用单独存储的密钥。因此，将现有密钥加入 PFX：

# todolist

1、根据视频源宽高，来计算一些数值；

2、`jsmpeg` 启动 GPU 加速；

3、支持 `flv.js`；

4、支持 `wfs.js`、`ckplayer`；

# 关于代码格式

```json
# vscode settings.json
"[javascript]": {
  "editor.defaultFormatter": "esbenp.prettier-vscode"
},
"[html]": {
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

关于在代码编辑器中(以 VSCode 为例)使用 `prettier`

`prettier` 配置项/规则：

[https://prettier.io/docs/en/options.html](https://prettier.io/docs/en/options.html)

[https://prettier.io/docs/en/configuration.html](https://prettier.io/docs/en/configuration.html)

---

# flv.js

FLV 里所包含的视频编码必须是 H.264，音频编码必须是 AAC 或 MP3， IE11 和 Edge 浏览器不支持 MP3 音频编码，所以 FLV 里采用的编码最好是 H.264+AAC，这个让音视频服务兼容不是问题。

flv.js 只做了一件事，在获取到 FLV 格式的音视频数据后通过原生的 JS 去解码 FLV 数据，再通过 Media Source Extensions API 喂给原生 HTML5 Video 标签。(HTML5 原生仅支持播放 mp4/webm 格式，不支持 FLV)

flv.js 为什么要绕一圈，从服务器获取 FLV 再解码转换后再喂给 Video 标签呢？原因如下：

1.兼容目前的直播方案：目前大多数直播方案的音视频服务都是采用 FLV 容器格式传输音视频数据。
2.FLV 容器格式相比于 MP4 格式更加简单，解析起来更快更方便。

由于目前 flv.js 兼容性还不是很好，要用在产品中必要要兼顾到不支持 flv.js 的浏览器。兼容方案如下

# wfs.js
