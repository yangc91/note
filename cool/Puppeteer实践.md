> Puppeteer 是一个node库，提供控制 Chrome 和 Chromium 的高级API，可以用来自动填充表单、提交、生成页面图片快照或PDF等等。

## puppeteer 安装

```
npm i puppeteer
```
> 此时会默认下载最新版本的Chromium （~170MB Mac，~282MB Linux，~280MB Win）。

在国内的环境，Chromium基本都是下载不下来的
，可以添加参数跳过下载并进行离线安装

```
npm install puppeteer --ignore-scripts 
```

## puppeteer-core 安装
puppeteer-core 是一个的轻量级的 Puppeteer 版本, 它默认不会下载 Chromium。


## 下载 Chromium

```
// 查看对应的 Chromium 版本
vim puppeteer/package.json

...
"puppeteer": {
    "chromium_revision": "641577"
  }
...
```

访问[https://chromium.woolyss.com/download/#mac](https://chromium.woolyss.com/download/#mac)下载相同版本安装即可

## 生成截图

```
vim example.js


const puppeteer = require('puppeteer');

(async () => {
   const browser = await puppeteer.launch({
  // 这里注意路径指向可执行的浏览器。
  // 各平台路径可以在 node_modules/puppeteer-core/lib/BrowserFetcher.js 中找到
  // Mac 为 '下载文件解压路径/Chromium.app/Contents/MacOS/Chromium'
  // Linux 为 '下载文件解压路径/chrome'
  // Windows 为 '下载文件解压路径/chrome.exe'
  executablePath: path.resolve('./chrome/Chromium.app/Contents/MacOS/Chromium')
 });
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({path: 'example.png'});

  await browser.close();
})();
```

运行
```
node example.js
```

## 生成PDF

```
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://news.ycombinator.com', {waitUntil: 'networkidle2'});
  await page.pdf({path: 'hn.pdf', format: 'A4'});

  await browser.close();
})();
```
> launch 中指定 Chromium 执行路径

## 添加延时
```
// 等待页面加载完毕
let timeout = function (delay) {
     return new Promise((resolve, reject) => {
           setTimeout(() => {
                  try {
                      resolve(1)
                  } catch (e) {
                      reject(0)
                   }
           }, delay);
     })
 };

...
await timeout(5000); // ms
...
```

## 页面自动滚动
```
async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
};

...
autoScroll(page);
...
```

## Linux环境Chromium踩坑记

* Chromium依赖
```
# 检测依赖
ldd chrome | grep not

# 安装依赖
yum install pango.x86_64 libXcomposite.x86_64 libXcursor.x86_64 libXdamage.x86_64 libXext.x86_64 libXi.x86_64 libXtst.x86_64 cups-libs.x86_64 libXScrnSaver.x86_64 libXrandr.x86_64 GConf2.x86_64 alsa-lib.x86_64 atk.x86_64 gtk3.x86_64 nss.x86_64 -y

```

* root用户需添加沙盒
```
const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
```

* 安装中文字体

[Linux CentOS 7 安装字体库 & 中文字体](https://blog.csdn.net/wlwlwlwl015/article/details/51482065)

## 参考资料

[https://github.com/GoogleChrome/puppeteer](https://github.com/GoogleChrome/puppeteer)

[puppeteer官方中文文档](https://zhaoqize.github.io/puppeteer-api-zh_CN/#/)

[手动下载Chrome并解决puppeteer无法使用问题](https://www.jb51.net/article/150592.htm)

[centos安装puppeteer爬坑](https://luodao.me/post/puppeteer-pakeng.html)

[Linux CentOS 7 安装字体库 & 中文字体](https://blog.csdn.net/wlwlwlwl015/article/details/51482065)


[Failed to launch chrome #807](https://github.com/GoogleChrome/puppeteer/issues/807)

[nodejs Downloads](https://nodejs.org/en/download/)