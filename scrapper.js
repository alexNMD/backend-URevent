var Crawler = require("crawler");

urlTest = "https://www.parisbouge.com/search?type=event&category=soiree&date_start=2019-03-30&date_end=2019-03-30";

var c = new Crawler({
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
                console.log($(link).attr('href'));
            });
        }
        done();
    }
});

c.queue(urlTest);
// Queue URLs with custom callbacks & parameters
/*
c.queue([{
    uri: 'http://parishackers.org/',
    jQuery: false,

    // The global callback won't be called
    callback: function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            console.log('Grabbed', res.body.length, 'bytes');
        }
        done();
    }
}]);

// Queue some HTML code directly without grabbing (mostly for tests)
c.queue([{
    html: '<p>This is a <strong>test</strong></p>'
}]);*/
