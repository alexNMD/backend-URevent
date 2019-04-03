var Crawler = require("crawler");
var request = require('request');

var urlTest = "https://www.parisbouge.com/search?type=event&category=soiree&date_start=2019-03-30&date_end=2019-03-30";
/*var type = "event";
var category = "soiree";
var date_start = "2019-03-30";
var date_end = "2019-03-30"*/

var home = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            links = $('a.text-title');
            $(links).each(function(i, link){
                url = "https://www.parisbouge.com"+link.attribs.href;
                event.queue(url);
            });
        }
        done();
    }
});

/*home.queue(urlTest);*/


// API POST
/*request.post(
    'http://localhost:8080/api/test',
    { json: { url: link.attribs.href }},
    function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log(body);
        }
    }
);*/


var event = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            var evenement = {};
            evenement.name = $('h1.text-title').text();
            evenement.address = $('.address-container').text();
            evenement.description = $('#event-detail-infos-content').text();
            price = $('p');
            evenement.price = price[8].children[0].data;
            request.post(
                'http://localhost:8080/api/test',
                {json: evenement},
                function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        console.log(body);
                    }
                }
            );
        }
        done();
    }
});

event.queue("https://www.parisbouge.com/event/209301");
