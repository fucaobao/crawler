var http = require("https");
var cheerio = require("cheerio");
var fs = require("fs");
var url = "https://shop120569397.taobao.com/";

http.get(url, function(res) {
    var html = "";
    res.on("data", function(data) {
        html += data;
    }).on("end", function() {
        var goods = filterGoods(html);
        printGoodsInfo(goods);
    })
}).on("error", function() {
    console.log("get goods error!");
});

function filterGoods(html) {
    var $ = cheerio.load(html);
    var str = [],
        images = $('img');
    images.each(function(index, el) {
        var src = $(el).attr("src");
        if (src.indexOf(".gif") === -1) {
            if (src.indexOf("https:") === -1) {
                str.push("https:" + src);
            }
        }
    });
    return str;
}

function printGoodsInfo(goods) {
    var filename = "fyy-taobao.txt";
    fs.writeFile(filename, "");
    goods.forEach(function(item, index) {
        fs.appendFile(filename, item + "\n", function(err) {
            if (err) throw err;
        });
    });
}