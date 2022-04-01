import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import camelCase from 'lodash.camelcase'
import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'

const pkg = require('./package.json')

// 最小化版本文件头注释信息
const banner =
  `/*!
 * ${pkg.name} v${pkg.version}
 * (c) 2020-${new Date().getFullYear()} ${pkg.author.name}
 * Released under the ${pkg.license} License.
 */
`

function miniName(name) {
	return name.slice(0, name.lastIndexOf('.js')) + '.min.js'
}

export default {
  input: `./main.js`,
  output: [
    { file: pkg.main, name: camelCase(pkg.name), format: 'cjs', sourcemap: true },
    { file: miniName(pkg.main),
    	name: camelCase(pkg.name),
    	format: 'cjs',
    	sourcemap: true,
    	plugins: terser({ compress: { drop_console: false } }),
    	banner: banner
    },
    // { file: pkg.module, format: 'cjs', sourcemap: true },
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  plugins: [
    // Allow json resolution | 它允许 Rollup 从 JSON 文件中导入数据
    json(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    // rollup-plugin-commonjs 插件就是用来将 CommonJS 转换成 ES2015 模块的。
    // 请注意，rollup-plugin-commonjs应该用在其他插件转换你的模块之前 - 这是为了防止其他插件的改变破坏CommonJS的检测。
    commonjs(),
    
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    // Resolve source maps to the original source
    sourceMaps(),
  ],
}

/**
 * 【打包引入的依赖库】
 * 到现在为止，无论是我们手动 import 引入的，还是 babel 帮我们引入的 polyfill ，转为 cjs 后都只是 require 的形式，没有真正进入文件内，需要插件将其依赖的文件也真正打包进来：
 * 其中 @rollup/plugin-node-resolve 可以帮我们将引入的依赖真正打包进来
 */
