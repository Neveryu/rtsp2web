# rtsp2web

`rtsp2web` 是一个提供在 `web` 页面中可以直接播放 `rtsp` 视频流解决方案的工具；简单、高效、快捷、安全。

> _PS: rtmp 格式的视频流也可以使用_

使用 `rtsp2web` 后，前端代码中可以使用 `jsmpeg.js` 或者 `flv.js` 来进行视频流的直接播放。

# 特点

- 上手简单，提供的示例代码完整可运行，无需繁琐复杂的技术负担，直接运行代码，快速解决视频流播放的问题；
- 延时非常低，视频流稳定，几乎是实时的，满足任何需求；不花钱，采用开源框架，无商业风险；
- 别的收费平台，需要暴露 RTSP 视频流链接给收费平台，rtsp2web 无需您提供 RTSP 视频流，您的保密和安全牢牢掌握在您手中；
- 高效兼容，大多数 nvr 或 ipc 或摄像头平台都支持输出 RTSP 视频流，rtsp2web 把 RTSP 视频流转换到页面可播放，减少对接工作，无论您是什么摄像头；
- 支持前端使用 `jsmpeg.js`、`flv.js` 等播放器，满足不同技术栈团队使用；
- 删繁就简，无需插件就可在浏览器显示视频画面，兼容各大浏览器厂商；
- 省时省力，同一页面可以播放不同厂家的视频，无需任何额外操作，轻松支持多路视频同时播放；
- 可以在公网上部署使用，但也可能因为你们公司网络的设置原因，你会面临一点小问题：还要学习网络穿透打洞，服务器部署能力，流量消耗，wss 等。

# 支持的视频厂商

海康、海康 NVR、大华平台、萤石、宇视、中天信科达、东方网力、天地伟业等。

# How to use（如何在你的项目中使用这个工具）

## 准备工作

FFmpeg 是一套可以用来记录、转换数字音频、视频，并能将其转化为流的开源计算机程序。可以轻易地实现多种视频格式之间的相互转换。

**确保在你要运行 rtsp2web 的机器上已经安装了 FFmpeg。**

> _新打开一个命令行窗口，输入：ffmpeg -version ，如果有相关信息输出，则证明 FFmpeg 的安装是 OK 的。_

<br>

## rtsp2web 介绍

`rtsp2web` 是一个 `node.js` 包，你可以创建一个新的项目引入它，这样很简单，然后运行它即可；也可以把 `rtps2web` 集成到已有的项目中，随项目运行（如果你知道怎么做的话）；

**这里以创建一个新项目运行它为例：（_这是最简单的做法_）**

1、**创建一个新的文件夹（假如文件夹名叫：`rtsp_server`）**，_注意 ⚠️：文件夹名称不能是 `rtsp2web`，这是 `npm` 的规则_。

2、进入项目文件夹： `cd rtsp_server`

3、然后安装 `rtsp2web` 包

```
npm i rtsp2web
```

4、在 `rtsp_server` 文件夹中创建入口 `js` 文件（例如：`main.js`）

```js
// main.js
const RTSP2web = require('rtsp2web')

// 服务端长连接占据的端口号；你也可以不传，默认是：9999
let port = 9999

// 创建一个RTSP2web服务实例出来
new RTSP2web({
  port
})
```

4.1、参数说明（在 `new RTSP2web` 时，可配置的参数如下：）

|     参数      |                                                                                                                                                                            解释说明                                                                                                                                                                            |
| :-----------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|     port      |                                                                                                                                             转码推流服务占用的端口号；（type：Number）<br/>可以不传；默认值：9999                                                                                                                                              |
|     path      |                                                                                                                                     FFmpeg 命令在你机器上的启动名称，(type: String) <br/> 一般情况下不传；默认值：'ffmpeg'                                                                                                                                     |
|     audio     |                                                                                                                                  默认不传，有声音；默认值：true；即：输出音频。<br/>如果想禁止输出音频，可以配置 audio: false                                                                                                                                  |
|   freeTime    |                                                                                                           任一视频流空闲(未被使用)时间超过这个值，就会停止该视频流的转码，释放机器资源（type: Number；单位：秒） <br/> 一般情况下可不传；默认值：20                                                                                                            |
|   checkTime   |                                                                                                                                      检测视频空闲的时间间隔（type: Number；单位：秒） <br/> 一般情况下可不传；默认值：10                                                                                                                                       |
|       q       |                                                                                                                                        视频质量；取值范围：0-1000；数字越小，视频越清晰，带宽消耗越大<br/> 默认值：8；                                                                                                                                         |
| transportType | 设置 RTSP 传输协议，默认值：无<br/>可选值：['tcp', 'udp', 'udp_multicast', 'http', 'https']<br/>ps: 这里默认值是无，也就是 rtsp2web 会自动选择一种传输协议；但是，并不能保证一定成功，这个时候，rtsp2web 日志会打印错误信息或者长时间的等待，这个时候就需要你手动来配置这个参数了，`'tcp'`、`'udp'` 是最常见的选择；详情可以参阅文档最后的【常见问题解决办法】 |
|   webplayer   |                                                                                 设置前端播放器（视频流转码器），默认不传，默认值：'jsmpeg'<br/>可选值：['jsmpeg', 'flv']；如果设置为 `flv`，那么前端页面请使用 `flv.js` 播放器，详情请参考下面 `flv.js` 小节了解详细的使用方法                                                                                 |
|      wss      |                                                         配置 wss；配置格式如下：<br/> `wss: {key: 'keyPath', cert: 'certPath'}` <br/>如果你是 pfx 的证书，那么配置格式如下：<br/>`wss: {pfx: 'pfxPath', passphrase: 'passphrasePath'}`<br/>如果你想使用`wss`的话请配置这个选项，否则不要使用这个配置。                                                         |

---

5、 运行 `node main.js`，即可启动视频流转码服务

> 当然，你也可以选择你习惯的进程管理工具来启动它。如：`pm2` 之类的工具。

**6、 在页面中播放视频**

6.1、 在你的页面中需要引入 `jsmpeg.js`。

6.2、 一个完整的前端页面例子代码如下：

> 1、需要 canvas 视频播放容器；2、rtsp 源地址；3、new 一个播放实例。

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no,viewport-fit=cover"
    />
    <script src="https://jsmpeg.com/jsmpeg.min.js" charset="utf-8"></script>
    <title>播放rtsp</title>
  </head>
  <body>
    <!-- 方式一：不给定宽度和高度，视频将会和视频源大小保持一致-->
    <canvas id="canvas-1"></canvas>

    <!-- 方式二: 只给定宽度或者高度，另外一个值将会自适应；整体比例与原视频一致 -->
    <canvas id="canvas-2" style="width: 400px"></canvas>

    <!-- 方式三: 可以自定义视频播放窗口的宽度和高度，会铺满，比例可能与原视频不一致了-->
    <canvas id="canvas-3" style="width: 400px; height: 400px"></canvas>

    <!-- 方式四：使用div + class="jsmpeg" + data-url的方式 -->
    <!-- 这种方式虽然设置了固定的宽高，但是视频还是会选择安宽度来自适应，比例与原视频保持一致 -->
    <div
      class="jsmpeg"
      id="canvas-4"
      style="width: 400px; height: 400px; border: 1px solid red"
      data-url="ws://localhost:9999/rtsp?url=cnRzcDovL3dvd3phZWMyZGVtby5zdHJlYW1sb2NrLm5ldC92b2QvbXA0OkJpZ0J1Y2tCdW5ueV8xMTVrLm1wNA=="
    ></div>
  </body>
  <script>
    var rtsp1 =
      'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4'
    window.onload = () => {
      // 将rtsp视频流地址进行btoa处理一下
      new JSMpeg.Player('ws://localhost:9999/rtsp?url=' + btoa(rtsp1), {
        canvas: document.getElementById('canvas-1')
      })
      // 将rtsp视频流地址进行btoa处理一下，还可以加一点参数
      new JSMpeg.Player(
        'ws://localhost:9999/rtsp?url=' +
          btoa(rtsp1) +
          '&brightness=0.2&saturation=1.8',
        {
          canvas: document.getElementById('canvas-2')
        }
      )
    }
  </script>
</html>
```

> PS： 默认情况下，在页面中播放视频，需要依赖 `jsmpeg.js` 工具包，请记得引入 `jsmpeg.js`；

详细参考例子：[https://github.com/Neveryu/rtsp2web/tree/master/example](https://github.com/Neveryu/rtsp2web/tree/master/example)

6.3、参数说明

> 如上面的例子所示：在调用 `new JSMpeg.Player()` 时，第一个参数是接口地址拼接上 `rtsp` 地址，我们还可以使用 `url` 传参的方式传递更多的高阶参数。

|    参数    |                                                                                                             解释说明                                                                                                              |
| :--------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|     -s     |                                                        视频分辨率大小，不传即表示与源视频大小一致<br> 传值示例： 1920x1080、1280x720、640x360 <br> 降低分辨率会降低清晰度                                                         |
|    -b:v    |                                          释义：码率，默认可以不设置，那就是使用源码率<br>传值示例：2000k、100k、1k<br>码率调小，这样其实也间接让文件变小了<br>码率调小，画质有可能会降低                                          |
|   scale    | 缩放；间接的，也能调整视频的分辨率；<br> 默认值： -1:-1；即与视频源大小保持一致；<br>功能与 -s 参数相似；但是可以只传一个宽度或者高度，另一个参数用 -1 表示<br>如： 1280:-1、-1:360，视频将会自适应显示<br>降低分辨率会降低清晰度 |
|   vcodec   |                                                                                 释义：视频编解码方式；<br>请确保你了解该参数的意义，默认可以不传                                                                                  |
|  contrast  |                                                释义：对比度，亮的地方更亮，暗的地方更暗。<br>取值范围[-100.0, 100.0]，默认值为 0。建议不调整，或者在[-2.0, 2.0]范围内进行小的调整                                                 |
| brightness |                                                                    释义：亮度，如果觉得视频有点暗，可以进行小的调整。<br>取值范围： [-1.0, 1.0]，默认值为 0。                                                                     |
| saturation |                                                                   释义：饱和度，也就是说色彩更鲜艳，绿色更绿，蓝色更蓝...；<br>取值范围：[0, 3.0]，默认值为 1。                                                                   |
|   gamma    |                                                          释义：关于显示器/视频的一个专业参数；<br>取值范围：0.1-10.0，默认值为 1。<br>这个参数很专业，建议不传，不修改。                                                          |

一个传了很多参数的例子如下：

```js
new JSMpeg.Player(
  'ws://localhost:9999/rtsp?url=' +
    btoa(rtsp1) +
    '&scale=640:-1&-b:v=1k&brightness=0.2&saturation=1.8',
  {
    canvas: document.getElementById('canvas-2')
  }
)
```

详细参考例子：[https://github.com/Neveryu/rtsp2web/tree/master/example](https://github.com/Neveryu/rtsp2web/tree/master/example)

<br>

> _ps: 目前使用 rtsp2web 的用户中，大多数情况下都正常使用；极少数用户会遇到一点问题，所以文档最后面有【常见问题解决办法】，必要时可以看看_

<br>

# 去水印

正确的去除水印能减小 `FFmpeg` 性能开销，有效提高 `FFMpeg` 运行效率，提升视频播放质量，可支撑更多的视频；

如何去除水印，[联系我](https://neveryu.blog.csdn.net/article/details/124124137)；wechat： miracle421354532

# 声音

`rtsp2web` 默认自动转码音频并输出，你也可以根据配置设置，选择禁止音频输出。

> _在浏览器中，自动播放声音是突兀的；根据浏览器规则，需要用户在页面任意地方进行任意的点击操作，就有声音了；如果配置了输出音频，为了播放声音，可以点击页面任意地方。_

# WSS

`rtsp2web` 已经支持直接开启 `wss` 协议了；

# 支持 flv.js

~~`flv.js` 比 `jsmpeg.js` 的播放性能和效果更好。（这个也不好说，根据个人喜好来，治愈性能方面谁更优，待验证）~~

`flv.js` 也是现在主流的播放器之一，而且 `flv.js` 播放器，默认就有进度条、在线回放、全屏、画中画、倍速播放等功能，有需要的可以选择 `flv.js`。

如果你的前端代码中使用的是 `flv.js` 或者你想在前端代码中使用 `flv.js` 来播放视频的话，你可以按如下操作：

1、在创建 `rtsp2web` 时，增加配置项 `webplayer: 'flv'`

```js
// index.js
const RTSP2web = require('rtsp2web')
// 服务端长连接占据的端口号
let port = 9999
new RTSP2web({
  port,
  q: 20,
  webplayer: 'flv'
})
```

2、在前端代码中引入 `flv.js`，并创建一个 `video` 标签节点，然后在 `js` 中初始化 `flv` 并播放。

```html
...
<script src="./flv.min.js" charset="utf-8"></script>
...
<video
  id="flv-1"
  height="500"
  muted
  style="border: thin solid green"
  controls
  loop
></video>
...
<script>
  console.log('flvjs 是否支持：', flvjs.isSupported())
  if (flvjs.isSupported()) {
    var videoElement = document.getElementById('flv-1')
    var flvPlayer = flvjs.createPlayer({
      isLive: true,
      type: 'flv',
      url: 'ws://localhost:8098/rtsp?url=' + btoa(rtsp1),
      enableWorker: true,
      enableStashBuffer: false,
      stashInitialSize: 128 // 减少首桢显示等待时长
    })
    flvPlayer.attachMediaElement(videoElement)
    try {
      flvPlayer.load()
      flvPlayer.play()
      // flvPlayer.pause()
    } catch (err) {
      // not do something
    }
  }
</script>
```

详细参考例子：[https://github.com/Neveryu/rtsp2web/tree/master/example/index-flv.html](https://github.com/Neveryu/rtsp2web/tree/master/example/index-flv.html)

有任何不明白的，及时与我联系：[联系我](https://neveryu.blog.csdn.net/article/details/124124137)；wechat： miracle421354532

## 👉 [Change Log [更新日志]](https://github.com/Neveryu/rtsp2web/blob/master/CHANGELOG.md)

<br/>

# 常见问题解决办法

### 一、某某模式转换失败 [或者] 进程退出，请检查 ffmpeg 参数... [或者] 长时间等待画面... [或者] 其他等等问题

如果出现了这之类的提示，大多数情况下，你可能需要尝试配置 `transportType` 为其他值试试，`'tcp'`, `'udp'`是最常见的选择。

> PS: 在正常的操作下遇到视频流无法播放，或者 `rtsp2web` 提示错误信息的情况下，优先选择使用这条解决办法来尝试解决问题。

### 二、ffmpeg 进程关闭了，code：3221225477

> 如果出现了 `3221225477`；这是 NodeJS 内核反馈的[违反了访问规定]的问题，一般这个问题只发生在 `windows` 平台上。据我所知，这似乎是与 Windows 访问冲突相关的错误。可以尝试的操作有：

- 1、执行 `npm cache verify`，然后再试试；
- 2、清除 `npm` 缓存：`npm cache clean --force`，再试试；
- 3、升级更新 `nodejs`，安装稳定版，再试试；
- 4、`rm -rf node_modules`，`delete package-lock.json`，重新安装，再试试；
- 5、切换合适的 `node` 版本可解决；切换当前 `node` 版本可解决这个问题。
- 6、也可以参考【办法一】来尝试解决这类问题；

### 三、转换失败，请尝试改变 transportType 的值，然后重试。

> 你可以尝试配置 `transportType` 为其他值试试，`'tcp'`, `'udp'`是最常见的选择。

### 四、有问题随时沟通，wechat： miracle421354532

<br/>

# 以下客户使用了 rtsp2web

广州天河区智慧交通、江苏石油化工油罐工厂、江苏镇江石化、武汉丽岛物业、武汉恒阳化工厂、苏州工业园区等

还有一些个人、企业用户等。

# donate

If you think rtsp2web help you. maybe you can donate a litter. :beers::beers:

如果你觉得这个项目帮助到了你，你可以帮作者买一杯果汁表示鼓励。 :beers::beers:

[donate link](https://neveryu.github.io/reward/index.html)

![](https://neveryu.github.io/reward/wechat-alipay.png)
