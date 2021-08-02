---
title: json-go-ts VS Code插件开发
date: 2021-08-02 14:16:10
tags:
categories: 其他
---

## 背景
项目中需要一份json配置文件，这份配置文件的某些字段是依据另外的一个typescrip文件`export`出来的字段，为了降低编码过程中造成的字段名出错的机率。     

因此，考虑开发一个插件用于：  

- json文件中自动补全function name
- jaon文件到typescript文件的自定义跳转
- json文件中错误波浪线智能提示（当typescript文件没有export该字段时显示波浪线）

插件效果：

![IDE](https://itc.desaysv.com/dfs/wxapp-assets/other/hello.gif)

## 实现

思路：定义两个插件变量（可根据实际情况自己在插件设置里面配置）
- fileName：用于识别文件名关键字 -- 默认为`index`
- filePath：以json文件为参照，index typescript文件的相对路径，用于获取ts文件 -- 默认为`./src/index`
- 关键实现：使用`@babel/parser`、`@babel/traverse`将ts文件转化AST，这样才能获取到ts文件中export出来的function name


[项目源码](https://github.com/YonSunZhen/vscode-plugin-json-go-ts)


### 自动补全

思路：
- 获取ts文件中export出来的function列表
- 监听VS Code中光标处输入的字符，当输入`index.`时，弹出自动补全面板，此时自动补全面板中的内容就是ts文件中export出来的所有function列表

关键代码实现：

```js
export function provideCompletionItems(document, position, token, context) {
  const _filePath = getFilePath(document, filePath);
  const _fnData = getFnFromTsFile(`${_filePath}.ts`);
  const linePrefix = document.lineAt(position).text.substr(0, position.character);
  if (!linePrefix.endsWith(`"${fileName}.`)) {
    return undefined;
  }
  let myitem = (text: string) => {
    let item = new vscode.CompletionItem(text, vscode.CompletionItemKind.Function);
    item.range = new vscode.Range(position, position);
    return item;
  };
  return _fnData.map(_fnItem => myitem(_fnItem.fnName));
}
```

### 跳转到定义

思路：  

- 获取ts文件中export出来的function列表，包括每个function对应的loc（即function在编辑器中所处的位置信息），**这就是前面我们为什么要将ts文件转化为AST的重要原因**，后面实现代码跳转需要用到这些位置信息
- 获取光标处所在的function并跳转到对应ts文件中的对应位置

关键代码实现：

```js
export function provideDefinition(document: vscode.TextDocument, position: vscode.Position, token) {
  const _filePath = getFilePath(document, filePath);
  const _fnData = getFnFromTsFile(`${_filePath}.ts`);  
  const _wordRangePosition = document.getWordRangeAtPosition(position);
  const word = document.getText(_wordRangePosition); // 获取当前光标输入字符
  const _reg = new RegExp(`"${fileName}\..*"`);  
  if (_reg.test(word)) {
    // const _fnName = word.replace(/"index\.|"/g, '');
    const _fnName = word.replace(new RegExp(`"${fileName}\.|"`, 'g'), '');
    if(_fnData.map(_fnItem => _fnItem.fnName).includes(_fnName)) {
      const filePath = `${_filePath}.ts`;
      for(const _fnItem of _fnData) {
        if(_fnItem.fnName === _fnName) {
          const tmpPath = `file:///${filePath}`; // TODO: 踩坑记录 必须 ///
          if (fs.existsSync(filePath)) {
            const _targetUri = vscode.Uri.parse(tmpPath); // TODO: 踩坑记录 使用parse
            const _targetPosition = new vscode.Position(_fnItem.loc.start.line, _fnItem.loc.start.column);
            const _targetRange = new vscode.Range(_targetPosition, _targetPosition);
            const _fileNameLen = (fileName as string).length || 0;
             // 当按住ctrl时，编辑器默认会将连在一块的字符都显示出来下划线 这时候如果想指定哪些字符需要显示下划线需要配置以下的originSelectionRange
            const _orgSelectionStartPosition = new vscode.Position(_wordRangePosition.start.line, _wordRangePosition.start.character + _fileNameLen + 2);
            const _orgSelectionEndPosition = new vscode.Position(_wordRangePosition.end.line, _wordRangePosition.end.character - 1);
            const _originSelectionRange = new vscode.Range(_orgSelectionStartPosition, _orgSelectionEndPosition);
            const _locationLink: vscode.LocationLink = {
              originSelectionRange: _originSelectionRange,
              targetUri: _targetUri,
              targetRange: _targetRange
            };
            return [_locationLink];
            // return new vscode.Location(vscode.Uri.parse(tmpPath), new vscode.Position(_fnItem.loc.start.line, _fnItem.loc.start.column));
          }
        }
      }
    }
  }
}
```

### 智能诊断&提示

这个功能的主要对象是json文件，因此我们需要获取到json文件中所有的字段，包括每个字段所处的位置信息（为了后面显示波浪线），这时候我们可能会想到说，将json文件转化为AST，思路是正确的，但是前面说的`@babel/traverse`只能用来转化js或ts文件，并不支持json文件的转化  

幸好别人已经有写过类似的轮子了，[json-to-ast](https://www.npmjs.com/package/json-to-ast)出场，`json-to-ast`可以将json文件转化为AST，感谢开源。

另外：在VS Code中智能诊断使用`createDiagnosticCollection`这个API来实现的，切记。

关键代码实现：

```js
// 智能诊断 波浪线提示
const collection = vscode.languages.createDiagnosticCollection('testFnName');
if (vscode.window.activeTextEditor) {
  collection.clear();
  updateDiagnostics(vscode.window.activeTextEditor.document, collection);
}
// 使用onDidChangeTextDocument监听编辑文档事件
context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(editor => {
  if (editor) {
    collection.clear();
    updateDiagnostics(editor.document, collection);
  }
}));
```

```js
export function updateDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection): void {
  const _text = document.getText();
  const _jsonAst = jsonToAst(_text) as jsonToAst.ObjectNode;
  const _errorText: JsonTextInfo[] = [];
  const _filePath = getFilePath(document, filePath);
  const _fnData = getFnFromTsFile(`${_filePath}.ts`);  
  const recursiveJsonAst = (astArr: any[]) => {
    astArr.forEach((jsonAstItem) => {
      const _value = jsonAstItem?.value || jsonAstItem?.children;
      if(_value.children) {
        recursiveJsonAst(_value.children);
      } else if(Array.isArray(_value)) {
        recursiveJsonAst(_value);
      } else {
        const _textValue = _value.value;
        const _reg = new RegExp(`${fileName}\..*`, 'g');
        if(_reg.test(_textValue)) {
          const _fnVal = _textValue.replace(new RegExp(`${fileName}\.`, 'g'), '');
          if(!_fnData.map((_fnItem => _fnItem.fnName)).includes(_fnVal)) {
            _errorText.push({
              value: _fnVal,
              loc: _value.loc
            });
          }
        }
      }  
    });
  };
  recursiveJsonAst(_jsonAst.children);
  const _diagCollection = [];
  _errorText.forEach(_errTextItem => {
    const _start = _errTextItem.loc.start;
    const _end = _errTextItem.loc.end;
    const _fileNameLen = (fileName as string).length || 0;
    const _startPosition = new vscode.Position(_start.line - 1, _start.column + _fileNameLen + 1);
    const _endPosition = new vscode.Position(_end.line - 1, _end.column - 2);
    _diagCollection.push({
      message: `Function ${_errTextItem.value} does not exist`,
      range: new vscode.Range(_startPosition, _endPosition),
      severity: vscode.DiagnosticSeverity.Error,
    });
  });
  collection.set(document.uri, _diagCollection);
}
```


## 一些踩坑
1. 发布插件时执行`vsce publish`时报错`ERROR Failed request: (401)`，生成的personal access token权限弄错了，应该选`Full access`

![](http://122.51.184.238/storage/files/1_5_杂烩/2_25_json-go-ts1.jpeg)

2. 发布插件时报错：`ERROR Make sure to edit the README.md file before you package or publish your extension` -- 修改一下工程里面的`README.md`文件（原来的文件删除&重写）

3. 使用[地址](https://marketplace.visualstudio.com/manage/createpublisher?managePageRedirect=true)创建publisher账号一直不成功 -- 网络被限制了（科学上网真香）  

4. 插件在本地开发环境下可以运行，发布到线上没有响应（也没有报错）

    经过排查，项目中使用了一些npm库，但是发布插件时使用了`tsc`来编译，这种情况下`node_modules`里面一些npm库的代码是没有被编译进去的。需要引入`webpack`来进行打包&编译



## 参考
- [json文件中自动补全面板不弹出](https://stackoverflow.com/questions/64584850/get-vscode-registercompletionitemprovider-to-work-in-a-json-file-with-a-word)
- [VS Code插件开发全攻略](https://www.cnblogs.com/liuxianan/p/vscode-plugin-overview.html)
- [VS Code Document](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Some demo](https://github.com/Microsoft/vscode-extension-samples/)
