const https = require("https");

const API_ROOT = '/a/macros/jonnyreeves.co.uk/s/AKfycbw0L6ysbPjm-J1jv5siRukYXG57MuLnGkGWQHbZnWrb/dev/';

async function doGetRequest(endpoint) {
    var options = {
            host: 'script.google.com',
            path: API_ROOT + endpoint,
            method: 'GET',
            timeout: 2000,
        };
        
    console.log("Doing GET request");
    return new Promise((resolve, reject) => {
        var req = https.request(options, res => {
            res.setEncoding('utf8');
            var responseString = "";
            
            //accept incoming data asynchronously
            res.on('data', chunk => {
                console.log("GET request got data...");
                responseString = responseString + chunk;
            });
            
            //return the data when streaming is complete
            res.on('end', () => {
                console.log("GET request end...");
                resolve(responseString);
            });
            
            res.on('error', err => {
                reject(err);
            })
        });
        req.end();
    });
}

module.exports = {
    async getMeal(mealDay) {
        const data = await doGetRequest('show-plan/by-days/3');
        
        let idx = (mealDay === 'today') ? 0 : 1;
        
        const lunch = data[idx].lunch.name;
        const dinner = data[idx].dinner.name;
        const tomorrowsNote = data[idx+1].note;
        
        const result = {
            lunch,
            dinner,
            tomorrowsNote,
        };
    }
}