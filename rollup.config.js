import resolve from 'rollup-plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs' // 这里之前有试过使用rollup-plugin-commonjs，发现不行
import sourceMaps from 'rollup-plugin-sourcemaps'
import camelCase from 'lodash.camelcase'
import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'

const pkg = require('./package.json')
// 最小化版本文件头注释信息
const banner = `/*!
   * ${pkg.name} v${pkg.version}
   * (c) 2020-${new Date().getFullYear()} ${pkg.author.name}
   * My home page：https://neveryu.github.io/neveryu/
   * 微信(wechat)：miracle421354532
   * Released under the ${pkg.license} License.
   */
`

function miniName(name) {
  return name.slice(0, name.lastIndexOf('.js')) + '.min.js'
}

export default {
  input: `./main.js`,
  output: [
    // {
    //   file: pkg.main,
    //   name: camelCase(pkg.name),
    //   format: 'cjs',
    //   sourcemap: true
    // },
    {
      file: pkg.main,
      name: camelCase(pkg.name),
      format: 'cjs',
      sourcemap: false,
      plugins: terser({ compress: { drop_console: false } }),
      banner: banner
    },
    {
      file: miniName(pkg.main),
      name: camelCase(pkg.name),
      format: 'cjs', // cjs；node使用的require规范，无treeshaking
      sourcemap: false,
      plugins: terser({ compress: { drop_console: false } }),
      banner: banner
    }
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  // Rollup 默认只解析相对路径的模块,对于以绝对路径引入的模块,不会作为bundle的一部分引入，
  // 这种模块会作为运行时的外部依赖，如果你就是想这样，你可以将模块id写入external数组。
  external: [],
  plugins: [
    // Allow json resolution | 它允许 Rollup 从 JSON 文件中导入数据
    json(),

    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({
      preferBuiltins: true,
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      }
    }),

    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    // rollup-plugin-commonjs 插件就是用来将 CommonJS 转换成 ES2015 模块的。
    // 请注意，rollup-plugin-commonjs应该用在其他插件转换你的模块之前
    // 这是为了防止其他插件的改变破坏CommonJS的检测。
    commonjs(),

    babel({
      exclude: 'node_modules/**'
    }),

    // Resolve source maps to the original source
    sourceMaps()
  ]
}

/**
 * 【打包引入的依赖库】
 * 到现在为止，无论是我们手动 import 引入的，还是 babel 帮我们引入的 polyfill ，转为 cjs 后都只是 require 的形式，没有真正进入文件内，需要插件将其依赖的文件也真正打包进来：
 * 其中 @rollup/plugin-node-resolve 可以帮我们将引入的依赖真正打包进来
 */

/**
 * 目前三种规范 esm 、cjs 、umd 占据主流，其中：
 * esm ：现代 ECMA 规范，摇树性能好，首推使用
 * cjs ：node 使用的 require 规范，无摇树
 * umd ：支持 cjs 和 amd 规范，自动挂载导出到 global ，一般用在浏览器中
 * 一般情况下他们在 package.json 中的对应字段如下：
 * 字段	规范
 * main	cjs
 * module	esm
 * browser	umd
 */
