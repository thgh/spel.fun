import resolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import svelte from 'rollup-plugin-svelte'
import alias from 'rollup-plugin-alias'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import config from 'sapper/config/rollup.js'
import pkg from './package.json'

const mode = process.env.NODE_ENV
const dev = mode === 'development'
const legacy = !!process.env.SAPPER_LEGACY_BUILD
const now = !!process.env.NOW_BUILD

if (now) {
	console.log('Building for NOW v2')
}

export default {
	client: {
		onwarn,
		input: config.client.input(),
		output: config.client.output(),
		plugins: [
			alias({
				resolve: ['.svelte', '.mjs', '.js', '.json'],
				src: __dirname + '/src'
			}),
			replace({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode),
				// ...env(['ANOTHER_ENV_VAR'])
			}),
			svelte({
				dev,
				hydratable: true,
				emitCss: true
			}),
			resolve(),
			commonjs(),

			legacy &&
				babel({
					extensions: ['.js', '.mjs', '.html', '.svelte'],
					runtimeHelpers: true,
					exclude: ['node_modules/@babel/**'],
					presets: [
						[
							'@babel/preset-env',
							{
								targets: '> 0.25%, not dead'
							}
						]
					],
					plugins: [
						'@babel/plugin-syntax-dynamic-import',
						[
							'@babel/plugin-transform-runtime',
							{
								useESModules: true
							}
						]
					]
				}),

			!dev &&
				terser({
					module: true
				})
		]
	},

	server: {
		onwarn,
		input: config.server.input(),
		output: config.server.output(),
		plugins: [
			alias({
				resolve: ['.svelte', '.mjs', '.js', '.json'],
				src: __dirname + '/src'
			}),
			replace({
				'process.browser': false,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
			now && replace(env(true)),
			svelte({
				generate: 'ssr',
				dev
			}),
			resolve(),
			commonjs()
		],
		external: Object.keys(now ? {} : pkg.dependencies).concat(
			require('module').builtinModules ||
				Object.keys(process.binding('natives'))
		)
	},

	serviceworker: {
		input: config.serviceworker.input(),
		output: config.serviceworker.output(),
		plugins: [
			resolve(),
			replace({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
			commonjs(),
			!dev && terser()
		]
	}
}

function env(keys) {
	require('dotenv/config')
	if (keys === true) {
		keys = Object.keys(process.env)
	}
	const out = {}
	keys.forEach(key => {
		if (typeof process.env[key] !== 'undefined') {
			out['process.env.' + key] = JSON.stringify(process.env[key])
		}
	})
	return out
}

function onwarn(warning, warn) {
	if (
		warning.code === 'CIRCULAR_DEPENDENCY' &&
		warning.importer.includes('src/node_modules/@sapper/')
	) {
		return
	}
	warn(warning)
}
