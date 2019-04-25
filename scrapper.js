var Crawler = require("crawler");
var request = require('request');

class Event
{
    constructor (name, address, description, price, img, baseURL, tag)
    {
        this.name = name;
        this.address = address;
        this.description = description;
        this.price = price;
        this.img = img;
        this.baseURL = baseURL;
        this.tag = tag;
    }
}

var urlTest = "https://www.parisbouge.com/search?type=event&category=soiree&date_start=2019-04-06&date_end=2019-04-06";


/*var type = "event";
var category = "soiree";*/
var date_start = "2019-04-20";
var date_end = "2019-04-20";
var homeURL = "https://www.parisbouge.com/search?type=event&category=soiree&date_start=" + date_start + "&date_end=" + date_end;

var paginationParsing = new Crawler({
    maxConnections : 10,
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            var pages = $('.page').length - 1;
            for (i = 1; i<=pages; i++)
            {
                homeParsing.queue(homeURL + '&page=' + i);
            }
        }
        done();
    }
});

console.log(homeURL);
paginationParsing.queue(homeURL);

var homeParsing = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            links = $('a.text-title');
            var z = 0;
            $(links).each(function(i, link){
                url = "https://www.parisbouge.com"+link.attribs.href;

                if (url.length < 40) {
                    eventParsing.queue({uri:url, parameter1: url});
                }

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



var eventParsing = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;

            var name = $('h1.text-title').text();
            var address = $('.address-container').text()
            var description = $('#event-detail-infos-content').text();
            var price = $('p')[8].children[0].data;
            if (typeof $('.event-cover-picture')[0] !== 'undefined')
            {
                var img = $('.event-cover-picture')[0].attribs.src;
            } else {
                var img = '';
            }
            var baseURL = res.options.parameter1;
            var evenement = new Event(name, address, description, price, img, baseURL);
            console.log(evenement);
            /*request.post(
                'http://localhost:8080/api/test',
                {json: evenement},
                function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        console.log(body);
                    }
                }
            );*/
        }
        done();
    }
});

/*event.queue("https://www.parisbouge.com/event/209301");*/

//TODO : améliorer le scrapper d'url afin d'obtenir les liens sur les différentes pages (gestion de la pagination)
//TODO : Rendre paramétrable le type de recherche (evenement, soirée, bar..) ainsi que la date de recherche