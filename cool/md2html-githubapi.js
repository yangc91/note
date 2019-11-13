var fs = require("fs");
var request = require('request');

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

    var requestData = {
        "text": mdStr,
        //"mode": "gfm",
        "context": "github/test"
    };
    request({
        url: 'https://api.github.com/markdown',
        method: "POST",
        headers: {
            "content-type": "application/json",
            "User-Agent": "test"
        },
        body: JSON.stringify(requestData)
    }, function (error, response, body) {
        
        if (!error && response.statusCode == 200) {
            var html = body;
            fs.writeFile(dst, html, function (err) {
                if (err) {
                    return console.error(err);
                }
                console.log("写入文件成功！");
            });
        }
    });

});

// usage: node ./md2htl.js src  dst
