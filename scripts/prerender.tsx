#!/usr/bin/bun
// @ts-nocheck

import { renderToString } from 'react-dom/server'

import { minify } from 'html-minifier'
import Provider from '../src/provider'
import App from '../src/app'

const template = await Bun.file('dist/index.html').text()
const [start, end] = minify(template, {
    collapseWhitespace: true
}).split('<div id="root"></div>')

const html = renderToString(
    <Provider>
        <App />
    </Provider>
).replace(/<template\b[^>]*>(.*?)<\/template>/g, '')

Bun.write(
    Bun.file('dist/index.html'),
    start + '<div id="root">' + html + '</div>' + end
)
