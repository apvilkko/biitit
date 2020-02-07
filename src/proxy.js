const express = require('express');
const proxy = require('http-proxy-middleware');

const app = express();

app.use(
  '/shared',
  proxy({ target: 'http://aapee.kapsi.fi', changeOrigin: true })
);
app.listen(8081);