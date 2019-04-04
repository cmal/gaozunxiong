var async = require('async');
var cheerio = require('cheerio');
var fs = require('fs');
var http = require('http');
var _ = require('lodash')

fs.readFile('index.txt', function(err, data) {
    var body = data.toString();
    var arr = body.trim().split('\n');

    async.series(
        _.map(arr, function(url) {
            return function(done) {
                var body = '';
                http.get(url, function(res) {
                    res.on('data', function(chunk) {
                        body += chunk.toString();
                    });
                    res.on('end', function() {
                        var $ = cheerio.load(body);
                        var pages = [];
                        $('.articleList .atc_title a').each(function(index, item) {
                            var page = {
                                title: $(this).text(),
                                href: $(this).attr('href')
                            };
                            if (page.title.indexOf('论语') > -1 ||
                                page.title.indexOf('老子') > -1 &&
                                page.title.indexOf('史记') == -1)
                                pages.push(page);
                        });
                        done(null, pages);
                    });
                })
            }
        }),

        function(err, results) {
            var lunyu = [];
            var laozi = [];
            _.map(results, function(pages) {
                lunyu = _.concat(lunyu, _.filter(pages, function(page) {
                    return _.includes(page.title, '论语');
                }));
                laozi = _.concat(laozi, _.filter(pages, function(page) {
                    return _.includes(page.title, '老子');
                }));
            });
            var lunyu_urls = _.map(lunyu, function(page) {
                return page.href;
            }).join('\n');
            var laozi_urls = _.map(laozi, function(page) {
                return page.href;
            }).join('\n');
            fs.writeFile('laozi.txt', laozi_urls);
            fs.writeFile('lunyu.txt', lunyu_urls);
        }
    );
});
