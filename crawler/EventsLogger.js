const fs = require('fs');

let filename = new Date();
let content = ' événements enregistrés !';

var logger = function(count, start_date, end_date) {
    fs.writeFile('crawler/EventsLogs/' 
    	+ filename 
    	+ '.txt', start_date 
    	+ ' - ' 
    	+ end_date 
    	+ '\n'
    	+ count
    	+ content, (err) => {
        if(err) {
            console.error(err);
            return
        }
    }
)
}
module.exports = logger;
