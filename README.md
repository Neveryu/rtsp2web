# rtsp2web

`rtsp2web` 是一个提供在`web`页面中直接播放`rtsp`视频流的解决方案。

**【写在前面】**
`refer` 是一个小的独立的 `demo` 程序，学习它对你有很大的帮助。


# how to use
```js
// main.js
const RTSP2web = require('rtsp2web')

// 服务端长连接占据的端口号
const port = 9999
new RTSP2web({
  port
})
```
Run: `node main.js`

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
  var rtsp1 = 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov'
  var rtsp2 = 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov'
  window.onload = () => {
    // 将rtsp视频流地址进行btoa处理一下
    new JSMpeg.Player("ws://localhost:9999/flv?url="+btoa(rtsp1), {
       canvas : document.getElementById("canvas_1")
    })
    new JSMpeg.Player("ws://localhost:9999/flv?url="+btoa(rtsp2), {
       canvas : document.getElementById("canvas_2")
    })
  }
</script>
</html>
```
打开 `index.html`。
