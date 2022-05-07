# rtsp2web

`rtsp2web` 是一个提供在 `web` 页面中直接播放 `rtsp` 视频流解决方案的工具。

**【前言】**
[refer](./refer) 是一个小的独立的 `demo` 程序，学习它对你有很大的帮助（都有注释的）。

# how to use
1、 安装依赖
```
npm i rtsp2web
```

2、 创建一个新建 `js` 文件（例如：`main.js`）
```js
// main.js
const RTSP2web = require('rtsp2web')

// 服务端长连接占据的端口号
const port = 9999
new RTSP2web({
  port
})
```

3、 运行 `node main.js`，启动视频流转码服务

4、 在页面中播放视频
```html
// index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no,viewport-fit=cover">
  <script src="https://jsmpeg.com/jsmpeg.min.js" charset="utf-8"></script>
  <title>播放rtsp</title>
</head>
<body>
<canvas id="canvas_1" style="width: 600px; height: 600px;"></canvas>
<canvas id="canvas_2" style="width: 600px; height: 600px;"></canvas>
</body>
<script>
  var rtsp1 = 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4'
  var rtsp2 = 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4'
  window.onload = () => {
    // 将rtsp视频流地址进行btoa处理一下
    new JSMpeg.Player("ws://localhost:9999/rtsp?url="+btoa(rtsp1), {
       canvas : document.getElementById("canvas_1")
    })
    new JSMpeg.Player("ws://localhost:9999/rtsp?url="+btoa(rtsp2), {
       canvas : document.getElementById("canvas_2")
    })
  }
</script>
</html>
```

> PS： 在页面中播放视频，需要依赖 `jsmpeg.js` 工具包

详细参考例子：[https://github.com/Neveryu/rtsp2web/tree/master/example](https://github.com/Neveryu/rtsp2web/tree/master/example)

# donate
If you think rtsp2web help you. maybe you can donate a litter. :beers::beers:

[donate link](https://neveryu.github.io/reward/index.html)
