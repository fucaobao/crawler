var http = require("http");
var fs = require("fs");
var superagent = require('superagent');
var cheerio = require("cheerio");
var async = require('async'); //可控制并发数量
// var iconv = require('iconv-lite');//字符编码转换
var eventproxy = require('eventproxy');
// var ep = new eventproxy();
var contents = [];
var filename = 'contents.json';
var urls = [];
var concurrencyCount = 0;
for (var index = 0, max = 10; index < max; index++) {
    urls.push('http://movie.douban.com/top250?start=' + 25 * index);
}
async.mapLimit(urls, 4, function(url, callback) {
    concurrencyCount++;
    console.log('现在的并发数是', concurrencyCount, ',正在抓取的是', url);
    superagent.get(url).end(function(err, res) {
        filterContents(res && res.text || '');
        concurrencyCount--;
        callback();
    });
}, function(err, result) {
    if (err) {
        throw err;
    }
    writeToFile();
});

function writeToFile() {
    contents.forEach(function(item, index) {
        item.index = index + 1;
    });
    fs.appendFile(filename, JSON.stringify(contents, null, 4), function(err) {
        if (err) {
            throw err;
        }
        console.log('done!');
    });
}

function filterContents(html) {
    if (!html) {
        return;
    }
    var $ = cheerio.load(html);
    var hd = $('.hd'),
        bd = $('.bd');
    for (var i = 0, len = hd.length; i < len; i++) {
        var select = $(hd[i]).find('a');
        var url = select.attr('href'),
            cName = $(select.find('span')[0]).text().trim(),
            eName = $(select.find('span')[1]).text().trim(),
            other = $(select.find('span')[2]).text().trim(),
            playable = $(hd[i]).find('.playable').text().trim(),
            person = $($(bd[i]).find('p')[0]).text().trim(),
            ratingNum = $(bd[i]).find('.star').find('.rating_num').text().trim(),
            ratingStar = ($($(bd[i]).find('.star').find('span')[0]).attr('class') || '').replace(/\D/g, ''),
            remarkNum = ($($(bd[i]).find('.star').find('span')[3]).text() || '').replace(/\D/g, '');
        if (ratingStar > 10) {
            ratingStar = (ratingStar / 10).toFixed(1);
        } else {
            ratingStar = (+ratingStar).toFixed(1);
        }
        contents.push({
            'url': url,
            'cName': cName,
            'eName': eName,
            'other': other,
            'playable': playable,
            'person': person,
            'ratingNum': ratingNum,
            'ratingStar': ratingStar,
            'remarkNum': remarkNum
        });
    }
}