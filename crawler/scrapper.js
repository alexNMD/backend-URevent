var Crawler = require("crawler");
var request = require('request');
var Event = require('./models/Event');
var Geocoding = require('./geocoding');
var EventsLogger = require('./EventsLogger')

let eventCount = 0;

var urlTest = "https://www.parisbouge.com/search?type=event&category=soiree&date_start=2019-05-04&date_end=2019-05-04&page=23";

var currentDate = dateFormat(new Date(), 0);
var futurDate = dateFormat(new Date(), 30);


var homeURL =
    "https://www.parisbouge.com/search?type=event&category=soiree&date_start="
    + currentDate
    + "&date_end="
    + futurDate;

function dateFormat(date, nbj)
{
    dateYear = date.getFullYear();
    dateMois = date.getMonth();
    dateFormate="";
    dateJour=date.getDate();
    for(i = 0; i < nbj; i++)
    {
        dateJour+=1;
        bisextile = false;
        if(dateYear % 400 == 0|| (dateYear % 4 == 0 && dateYear % 100 !=0 ))
            bisextile = true;
        if(dateMois == 1)
        {
            if(dateJour > 28 && bisextile)
            {
                dateMois = dateMois + 1;
                dateJour = dateJour - 28;
            }
            else if(dateJour > 29)
            {
                dateMois = dateMois + 1;
                dateJour = dateJour - 29;
            }
        }

        else if(dateMois % 2 == 0)
        {
            if(dateJour > 31)
            {
                dateMois = dateMois + 1;
                dateJour = dateJour - 31;
            }
        }

        else
        {
            if(dateJour > 30)
            {
                dateMois = dateMois + 1;
                dateJour = dateJour - 30;
            }
        }
        if(dateMois > 11)
        {
            dateYear = dateYear + 1;
            dateMois = 0;
        }
    }
    dateFormate += dateYear;
    dateMois = dateMois+1;
    if(dateMois < 10)
        dateFormate += "-0" +dateMois;
    else
        dateFormate+="-"+dateMois;
    if(dateJour < 10)
        dateFormate += "-0" + dateJour;
    else
        dateFormate += "-"+dateJour;
    return dateFormate;
}


var paginationParsing = new Crawler({
    maxConnections: 10,
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            var $ = res.$;
            var pageItem = $('.page').length - 2;
            var pageCount = parseInt($('.page')[pageItem].children[0].children[0].data);

            for (i = 1; i <= pageCount; i++) {
                homeParsing.queue(homeURL + '&page=' + i);
            }     
            
        }
        done();
    }
});

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
            EventsLogger(eventCount, currentDate, futurDate);
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
            var address = $('.event-place-address').text();
            var description = $('#event-detail-infos-content').text();

            const regexp = RegExp('^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$');
            var stringP = $('p').toString();
            indexStart = stringP.indexOf('&#xE0;');
            if (stringP.substring(indexStart+7, indexStart+12).match(regexp)) {
                hours_start = stringP.substring(indexStart+7, indexStart+12);
            } else {
                hours_start = 'Aucune infos';
            }
            stringP = stringP.replace('&#xE0;', '');
            indexEnd = stringP.indexOf('&#xE0;');
            if (stringP.substring(indexEnd+7, indexEnd+12).match(regexp)) {
                hours_end = stringP.substring(indexEnd+7, indexEnd+12);
            } else {
                hours_end = 'Aucune infos';
            }
            
            var start = { date_start, hours_start };
            var end = { date_end, hours_end };

            if ($('p')[8].children[0].data === 'tarif') {
                price = $('p')[9].children[0].data
            } else {
                price = $('p')[8].children[0].data
            }
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
                var evenement = new Event(name, address, description, price, img, baseURL, tags, start, end, location);
                // console.log(evenement);
                request.post(
                'https://api-urevent.herokuapp.com/api/events',
                { json: evenement },
                function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        console.log(body);
                    }
                    }
                );
            })             
                
            

        }
        done();
    }
});

// console.log(homeURL);
paginationParsing.queue(homeURL);
// test unitaire ->
// eventParsing.queue("https://www.parisbouge.com/event/212370");

// TODO : Récupérer les heures (start & end)
// TODO : mieux récupérer les tarifs des soirées

