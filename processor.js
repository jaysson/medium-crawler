const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const links = {};
let root;
let q;

function pageProcessor(htmlString) {
    const $ = cheerio.load(htmlString);
    // Get only those links which point to same site
    $(`a[href^="${root}"]`).each((i, a) => {
        // Ignore query params. Those point to same URL
        const link = stripTrailingSlash(a.attribs.href.split('?')[0]);

        // Ignore URLs which are already there
        if (!links[link]) {
            links[link] = 'pending';
            q.push(link);
            fs.appendFile('links.csv', link + "\n");
        }
    });
}

function stripTrailingSlash(str) {
    if (str.substr(-1) === '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
}

module.exports = {
    fetchAndParser: function (url, callback) {
        console.log('started', url);
        request(url, function (error, response, body) {
            if (error) {
                callback(error, url);
            } else {
                pageProcessor(body);
                links[url] = 'completed';
                console.log('completed', url);
                callback(error, url);
            }
        });
    },
    start: function (rootValue, queueHandler) {
        root = rootValue;
        q = queueHandler;
        links[rootValue] = 'pending';
        fs.unlink('links.csv', () => q.push(stripTrailingSlash(root)));
    }
};
