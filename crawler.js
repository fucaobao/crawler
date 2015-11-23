var http = require("http");
var fs = require("fs");
var superagent = require('superagent');
var cheerio = require("cheerio");
var async = require('async'); //可控制并发数量
var iconv = require('iconv-lite');
var urls = [];
var concurrencyCount = 0;
// var eventproxy = require('eventproxy');
// var ep = new eventproxy();
var results = [];
for (var index = 100001, max = 100100; index <= max; index++) {
    urls.push('http://item.jd.com/' + index + '.html');
}
async.mapLimit(urls, 10, function(url, callback) {
    concurrencyCount++;
    // console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url);
    superagent.get(url).end(function(err, res) {
        var html = iconv.decode(res.text || '', 'gbk');
        var goods = filterGoods(url, html);
        results.push(goods);
        concurrencyCount--;
        callback();
    });
}, function(err, result) {
    if (err) {
        throw err;
    }
    console.log('done!');
    writeToFile();
});

function writeToFile() {
    var content = [];
    results.forEach(function(item, index) {
        content.push(item.index + ' url:' + item.url + '#name:' + item.name + '\n');
    });
    fs.appendFile('jd_good_name.txt', content.join(''), function(err) {
        if (err) {
            throw err;
        }
    });
}

function filterGoods(url, html) {
    var $ = cheerio.load(html);
    var name = $('#name').find('h1').text();
    return {
        'url': url,
        'index': +url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.')),
        'name': name
    };
}