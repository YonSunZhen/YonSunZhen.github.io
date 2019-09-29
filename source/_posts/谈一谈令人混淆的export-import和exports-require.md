---
title: '谈一谈令人混淆的export,import和exports,require'
date: 2019-09-29 15:55:23
tags:
categories: JavaScript
---
## exports与require
<font size=3>
exports与require使用的模块导入导出规则遵循的是CommonJS规范, 一般在NodeJS(express,koa)中使用，是相对比较先出现的规范,也是目前大多数浏览器支持的模块导入导出规范。
</font>

## export与import
<font size=3>
export与import是后面才出现的一套标准,一般在typescript和三大框架(Angular, Vue, React)中比较常见,但目前支持这套规范的客户端浏览器比较少,所以通常情况下代码都要经过Babel转换成目前浏览器能支持的,也就是exports和require那一套。
</font>


