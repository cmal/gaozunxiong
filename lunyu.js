var async = require('async');
var cheerio = require('cheerio');
var fs = require('fs');
var http = require('http');
var _ = require('lodash');
var BufferList = require('bl');

var ws = fs.createWriteStream('lunyu_cont.txt');

fs.readFile('lunyu.txt', function(err, data) {
    var body = data.toString();
    var arr = _.reverse(body.trim().split('\n'));
    async.series(
        _.map(arr, function(url) {
            return function(done) {
                var bl = new BufferList();
                var req = http.get(url, function(res) {
                    res.on('data', function(chunk) {
                        bl.append(chunk);
                    });
                    res.on('end', function() {
                        var $ = cheerio.load(bl.toString());
                        var title = $('#articlebody .BNE_title h1.h1_tit').text();
                        var content = $('#articlebody .BNE_cont').children('p').text();
                        done(null, {title: title, content: content})
                    });
                });
                req.on('error', function(err) {
                    console.log('error on url:', url);
                });
            };
        }),
        function(err, results) {
            _.map(results, function(article) {
                ws.write(article.title);
                ws.write('\n');
                ws.write(article.content);
                ws.write('\n\n------------------------\n')
            });
            ws.end();
        }
    )
});
