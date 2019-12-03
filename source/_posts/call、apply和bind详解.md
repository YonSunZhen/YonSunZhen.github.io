---
title: call、apply和bind详解
date: 2019-12-03 20:46:55
tags:
categories: JavaScript
---
## call和apply
### **call**
<font size=3>1、用法：`foo.call(obj, arg1, arg2, ...)` -> **主要用于改变this的指向**；</font> 

``` js
function foo(year, place) {
  console.log(this.name+" is "+year+" born from "+place);
}
window.name = 'syz';
const obj = {
  name: 'syc'
}
foo(1995, 'china'); // syz is 1995 born from china
foo.call(obj, 1995, 'china'); // syc is 1995 born from china
```
<font size=3> 首先我们要知道，每个函数中的this是在调用时绑定的，this指向哪里，完全取决于函数的调用位置。比如上面，我们先执行了`foo()` ，基于我们调用这个函数的位置,如果我们在浏览器中运行的话（一般都是），此时this指向的是window，所以这时候this.name = syz;  
那如果我们想要让 this.a = obj.name 的话，就可以使用call来显式绑定this的指向。</font>  

### **apply**
<font size=3>1、用法：`obj.apply(thisObj, [arg1, arg2, ...])` -> **主要用于改变this的指向**；</font>  

``` js
function foo(year, place) {
  console.log(this.name+" is "+year+" born from "+place);
}
window.name = 'syz';
const obj = {
  name: 'syc'
}
foo(1995, 'china'); // syz is 1995 born from china
foo.apply(obj, [1995, 'china']); // syc is 1995 born from china
```
<font size=3> apply方法和call方法的区别就是apply中第二个参数接受的是一个数组。</font> 

## bind
<font size=3>1、用法：`foo.bind(obj, arg1, arg2, ...)`  -> **返回一个函数，该函数永久地改变this的指向；** </font>   

``` js
function foo(year, place) {
  console.log(this.name+" is "+year+" born from "+place);
}
window.name = 'syz';
const obj = {
  name: 'syc'
}
foo(1995, 'china'); // syz is 1995 born from china
let haha = foo.bind(obj, 1995, 'china'); 
haha(); // syc is 1995 born from china
```
<font size=3> bind类似于call，但是call和apply会立即执行，而bind是返回绑定this之后的函数(永久地改变this的指向，原函数不变)。</font>   

## apply、call、bind三者的区别
- <font size=3>三者都可以改变函数的this的指向；</font>
- <font size=3>三者第一个参数都是this要指向的对象，如果没有这个参数或参数为undefined或null，则默认指向全局window。</font>  
- <font size=3>三者都可以传参，但是call和bind是参数列表，apply是数组。</font>
- <font size=3>bind是返回绑定this之后的函数，便于稍后调用；apply和call则是立即执行。</font>
