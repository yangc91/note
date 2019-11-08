
# markdown转html

## node.js
[markdown-it](https://github.com/markdown-it/markdown-it#simple)

### install
``` bash
npm install markdown-it --save
# or
bower install markdown-it --save
```


### demo
```
vim test.js

....

var md = require('markdown-it')();

var test = '# Junit 测试运行器\n' +
    '\n' +
    '## Parameterized.class\n' +
    '\n' +
    '> 使用不同的参数多次运行同一个测试';
var result = md.render(test);
console.log(result);
....


node test.js


```

## java
[https://github.com/vsch/flexmark-java](https://github.com/vsch/flexmark-java)

### 参考

[https://github.com/b3log/solo](https://github.com/b3log/solo/blob/master/src/main/java/org/b3log/solo/util/Markdowns.java)

[https://my.oschina.net/u/566591/blog/1535380](https://my.oschina.net/u/566591/blog/1535380)
