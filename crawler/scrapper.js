var Crawler = require("crawler");
var request = require('request');
var Event = require('./models/Event');
var Geocoding = require('./geocoding');
var EventsLogger = require('./EventsLogger')

var urlTest = "https://www.parisbouge.com/search?type=event&category=soiree&date_start=2019-05-04&date_end=2019-05-04";
let eventCount = 0;
/*var type = "event";
var category = "soiree";*/
var date_start = "2019-05-04";
var date_end = "2019-05-20";
var homeURL =
    "https://www.parisbouge.com/search?type=event&category=soiree&date_start="
    + date_start
    + "&date_end="
    + date_end;

var paginationParsing = new Crawler({
    maxConnections: 10,
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            var $ = res.$;
            var pages = $('.page').length - 1;
            for (i = 1; i <= pages; i++) {
                homeParsing.queue(homeURL + '&page=' + i);
            }
        }
        done();
    }
});

console.log(homeURL);
paginationParsing.queue(homeURL);

var homeParsing = new Crawler({
    maxConnections: 10,
    // This will be called for each crawled page
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            // Initilisation pour le compteur
            var $ = res.$;
            links = $('a.text-title');
            var z = 0;
            $(links).each(function (i, link) {
                url = "https://www.parisbouge.com" + link.attribs.href;

                if (url.length < 40) {
                    eventParsing.queue({uri: url, parameter1: url});
                    eventCount++;
                }
            });
            EventsLogger(eventCount);
        }
        done();
    }
});


var eventParsing = new Crawler({
    maxConnections: 10,
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            var $ = res.$;

            var name = $('h1.text-title').text();


            var date_start = $('a.text-default')[0].children[0].children[0].data;
            var date_end = $('a.text-default')[1].children[0].data;
            /*            var hour_start = $('a.text-default')[0].next.data;*/
/*            date_start = new Date(date_start);*/
            /*console.log(date_start);
            console.log(date_end);*/
            /*console.log(hour_start);*/

            var address = $('.event-place-address').text();
            var description = $('#event-detail-infos-content').text();
            var price = $('p')[8].children[0].data;
            if (typeof $('.event-cover-picture')[0] !== 'undefined') {
                var img = $('.event-cover-picture')[0].attribs.src;
            } else {
                var img = '';
            }
            var baseURL = res.options.parameter1;
            var tags = [];
            var styles = $('.label-event-style');
            styles.each(function (i, style) {
                if (style.children.length !== 0) {
                    tags[i] = style.children[0].data;
                }
            });

            Geocoding(address, function(response){
                var location = response;
                var evenement = new Event(name, address, description, price, img, baseURL, tags, date_start, date_end, location);
                console.log(evenement);
            })             
                
            // request.post(
            //     'http://localhost:8080/api/test',
            //     {json: evenement},
            //     function (error, response, body) {
            //         if (!error && response.statusCode === 200) {
            //             console.log(body);
            //         }
            //     }
            // );

        }
        done();
    }
});

// test unitaire ->
// eventParsing.queue("https://www.parisbouge.com/event/211278");

//TODO : améliorer le scrapper d'url afin d'obtenir les liens sur les différentes pages (gestion de la pagination)
//TODO : -> bien vérifier l'intégrité des données récupérées ainsi que leur nombre
//TODO : Rendre paramétrable le type de recherche (evenement, soirée, bar..) ainsi que la date de recherche
//TODO : rendre plus propre la récupération de date_start & date_end