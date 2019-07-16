require('dotenv').config({ path: 'config/local.env' });
var Crawler = require("crawler");
var request = require('request');
var Event = require('./models/Event');
var EventsLogger = require('./EventsLogger');
let eventCount = 0;
var urlTest = "https://www.parisbouge.com/search?type=event&category=soiree&date_start=2019-05-04&date_end=2019-05-04&page=23";
var cron = require('node-cron');

// var currentDate = dateFormat(new Date(), 0);
// var futurDate = dateFormat(new Date(), 0);
// var homeURL =
//     "https://www.parisbouge.com/search?type=event&category=soiree&date_start="
//     + currentDate
//     + "&date_end="
//     + futurDate;

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

function formatTags (tags) {
    let sortedTags = [];
    if (tags.length > 0) {
        tags.forEach(function (tag, i) {
                sortedTags[i] = new Object({ name: tag });
        });
            return sortedTags;
    }
}

function APIinsert (collection, object) {
    const userToken = process.env.userToken;
    const devStatus = process.env.NODE_ENV;
    let baseURL;
    if (devStatus === 'test' || devStatus === 'PRE_PROD') {
        baseURL = 'http://localhost:8080/api/';
    } else {
        baseURL = 'https://api-urevent.herokuapp.com/api/';
    }
    request.post({
            url: baseURL + collection,
            headers: {
                'Authorization': 'Bearer ' + userToken
            },
            json: object
        },
        function (error, response) {
            if (!error) {
                console.log(response.statusCode);
            } else {
                console.log(error);
            }
        }
    );
}



var scrapper = function(launchValues, callback) {

    var homeURL =
        "https://www.parisbouge.com/search?type=event&category=soiree&date_start="
        + launchValues.start
        + "&date_end="
        + launchValues.end;


    var paginationParsing = new Crawler({
        maxConnections: 10,
        callback: function (error, res, done) {
            if (error) {
                console.log(error);
            } else {
                var $ = res.$;

                let pageItem;
                let pageCount;
                if ($('.page').length !== 0) {
                    pageItem = $('.page').length - 2;
                    pageCount = parseInt($('.page')[pageItem].children[0].children[0].data);
                } else {
                    pageCount = 1;
                }


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
                EventsLogger(eventCount, launchValues.start, launchValues.end);
            }
            done();
            return callback(eventCount);
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


                let sortedTags = formatTags(tags);
                APIinsert('tags', sortedTags);
                var evenement = new Event(name, address, description, price, img, baseURL, tags, start, end);
                APIinsert('events', evenement);

            }
            done();
        }
    });

    // Fonctionnement normal ->
    console.log(homeURL);
    paginationParsing.queue(homeURL);

};

module.exports = scrapper;





// console.log('Scrapper en attente...');
// cron.schedule('0 0 0 * * *', () => {
//     console.log('Lancement... DATE de démarrage : ' + new Date());
//     paginationParsing.queue(homeURL);
// });


// test unitaire ->
// eventParsing.queue("https://www.parisbouge.com/event/212370");

// TODO : Reformater les tags pour une récupération plus efficace (suppression des accents, des espaces...)
// TODO : Monter l'interface Admin (BO)
// TODO : Ajout de cron quotidien pour le scrapper (node-cron)
