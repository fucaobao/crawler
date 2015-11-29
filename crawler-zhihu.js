var http = require("http");
var fs = require("fs");
var superagent = require('superagent');
var cheerio = require("cheerio");
var async = require('async'); //可控制并发数量
// var iconv = require('iconv-lite');//字符编码转换
var filename = './zhihu/contents-zhihu';
var urls = []; //话题数量
for (var index = 19621319, max = 19631319; index <= max; index++) {
    urls.push('http://www.zhihu.com/topic/' + index + '/questions');
}
async.mapLimit(urls, 50, function(url, callback) {
    superagent.get(url).end(function(err, res) {
        getPages(res && res.text || '', url);;
        callback();
    });
}, function(err, result) {
    if (err) {
        throw err;
    }
});

function getPages(html, url) {
    if (!html) {
        return;
    }
    var $ = cheerio.load(html);
    if ($('.header').text().replace(/\D/g, '') == '404') {
        return;
    }
    var $selector = $('.zm-invite-pager').find('span'),
        pages = $($selector[$selector.length - 2]).text(),
        urlList = [];
    if (!pages) {
        urlList.push(url);
    } else {
        for (var i = 1; i <= pages; i++) {
            urlList.push(url + '?page=' + i);
        }
    }
    getContens(urlList, url.replace(/\D/g, ''));
}

function getContens(urlList, index) {
    async.mapLimit(urlList, Math.min(urlList.length, 10), function(url, callback) {
        superagent.get(url).end(function(err, res) {
            filterContents(res && res.text || '', index);
            callback();
        });
    }, function(err, result) {
        if (err) {
            throw err;
        }
    });
}

function filterContents(html, index) {
    if (!html) {
        return;
    }
    var $ = cheerio.load(html);
    var titles = $('.question-item-title')
    var contents = [];
    for (var i = 0, len = titles.length; i < len; i++) {
        var $selector = $(titles[i]);
        var time = $selector.find('span').text();
        var title = $selector.find('a').text();
        var href = $selector.find('a').attr('href');
        contents.push(JSON.stringify({
            'time': time,
            'title': title,
            'href': href
        }) + ',');
    }
    fs.appendFile(filename + '-' + index + '.json', contents.join(''), function(err) {
        if (err) {
            throw err;
        }
    });
}