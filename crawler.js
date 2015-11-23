var http = require("http");
var fs = require("fs");
var superagent = require('superagent');
var cheerio = require("cheerio");
var async = require('async'); //可控制并发数量
var iconv = require('iconv-lite');
var urls = [];
// var eventproxy = require('eventproxy');
// var ep = new eventproxy();
var results = [];
for (var i = 100001, max = 100001; i <= max; i++) {
    urls.push('http://item.jd.com/' + i + '.html');
}
async.mapLimit(urls, 10, function(url, callback) {
    superagent.get(url).end(function(err, res) {
        var html = iconv.decode(res.text || '', 'gbk');
        console.log(html)
        var goods = filterGoods(url, html);
        results.push(goods);
        callback();
    });
}, function(err, result) {
    if (err) {
        throw err;
    }
    results.forEach(function(item, index) {
        var content = (index + 1) + ' url:' + item.url + '#name:' + item.name + '\n';
        fs.appendFile('jd_good_name.txt', content, function(err) {
            if (err) {
                throw err;
            }
        });
    });
});

function filterGoods(url, html) {
    var $ = cheerio.load(html);
    var name = $('#name').find('h1').text();
    return {
        'url': url,
        'name': name
    };
}