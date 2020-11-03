---
title: isNaN()与Number.isNaN()的使用
date: 2019-11-07 12:13:37
tags:
categories: JavaScript
---
## 目的
1、<font size=3>后台验证参数。</font>  
2、<font size=3>如果传进来的参数是非数值字符串，类似“haha”，“Hello World”这种就不通过。</font>  
3、<font size=3>如果传进来的值为NaN报不通过。</font>  
4、 <font size=3>如果传进来的值为'true'报不通过。</font>  
5、<font size=3>方法：isNaN(param) 为true表示不通过。</font>

## isNaN()
- <font size=3>流程：（非number型为true，因为会先进行类型转换）</font>
> isNaN()在接受到一个值之后，**会尝试将这个值转换为数值**，例如字符串‘10’或Boolean值。而任何不能被转换为数值的值都会导致这个函数返回true。--《你不知道的JavaScript》

## Number.isNaN()
- <font size=3>内部实现：（非numberxing为false，因为直接检测是否为number型）</font>  
`typeof n === 'number' && isNaN(n)` 

## 总结&&区别
1、<font size=3>isNaN()为false的话，Number.isNaN()一定是false。</font>  
2、<font size=3>isNaN()为true的话，Number.isNaN()不一定为true，例如检测字符串的情况。</font>  
3、<font size=3>Number.isNaN()：前提一定得是number，不然肯定为false。</font>  
4、<font size=3>例如：对于所有的字符串都一样</font>  
- `Number.isNaN(‘bbbb’) // false`  
- `isNaN(‘bbbb’) // true` 
- **NaN字面意思是非法数值（但还是属于数值型）**。
- <font size=3>首先，NaN是一个number类型。</font>
- `typeof NaN === “number” // true`
- `Number('true') // NaN`      
- `Number(true) // 1` 
- <font size=3> NaN: 任何数值除以非数值都为NaN。</font>
-  `typeof 2/'abc' // NaN`


