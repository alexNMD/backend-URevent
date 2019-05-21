const fs = require('fs');

let filename = new Date();
let content = ' événements enregistrés !';

var logger = function(count) {
    fs.writeFile('crawler/EventsLogs/' + filename + '.txt', count+content, (err) => {
        if(err) {
            console.error(err);
            return
        }
    }
)
}
module.exports = logger;
