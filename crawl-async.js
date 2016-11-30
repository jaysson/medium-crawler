const async = require('async');
const root = 'https://medium.com';
const {fetchAndParser, start} = require('./processor');
const q = async.queue(fetchAndParser, 5);
start(root, q);
