---
title: koa服务端获取不到客户端请求的origin
date: 2019-09-27 11:41:56
tags:
categories: BUG
---
## 问题
<font size=3>用koa2作为服务端，在解决跨域问题时需要获取客户端请求的origin字段前端使用ajax访问服务端接口,客户端请求的request中origin为null</font>

``` js
module.exports = async function (ctx, next) {
  const origin = URL.parse(ctx.get('origin') || ctx.get('referer') || '');
  if (origin.protocol && origin.host) {
    ctx.set('Access-Control-Allow-Origin', `${origin.protocol}//${origin.host}`);
    ctx.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT');
    ctx.set('Access-Control-Allow-Headers', 'X-Requested-With, User-Agent, Referer, Content-Type, Cache-Control,accesstoken');
    ctx.set('Access-Control-Max-Age', '86400');
    ctx.set('Access-Control-Allow-Credentials', 'true');
  }
  if (ctx.method !== 'OPTIONS') {
    await next();
  } else {
    ctx.body = '';
    ctx.status = 204;
  }
}
```

## 原因
<font size=3>客户端请求服务端接口是在本地电脑环境(非服务器环境),然而origin字段记录的是我发起http请求的域名URL,由于我是在本地进行访问的,肯定也就不存在域名URL了。
</font>

## 解决

- <font size=3>全局安装http-server (搭建服务器环境)</font>

``` js
npm install http-server -g
```

- <font size=3>在当前文件目录下启动服务器</font>

``` js
D:\uidq2225\Desktop\test>http-server
Starting up http-server, serving ./
Available on:
  http://10.219.125.46:8080
  http://127.0.0.1:8080
Hit CTRL-C to stop the server
```

- <font size=3>浏览器访问 http://10.219.125.46:8080/index 重新发起请求即可</font>
