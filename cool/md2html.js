var fs = require("fs");
var md = require('markdown-it')();

// input file name
var src = process.argv[2];
// output file name
var dst = process.argv[3];

fs.readFile(src, function (err, data) {
   if (err) {
       return console.error(err);
   }
   var mdStr = data.toString();
   console.log("读取文件成功");

   var html = md.render(mdStr);
   console.log("渲染html成");

    fs.writeFile(dst, html,  function(err) {
        if (err) {
            return console.error(err);
        }
        console.log("写入文件成功！");
    });

});

// usage: node ./md2htl.js src  dst
