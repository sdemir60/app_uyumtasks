'use strict';

const path = require('path');

var config = {};
var nconf = require('nconf');

nconf.argv().env().file({file: path.join(__dirname, 'config.json')});

config.get = function (key) {
    return nconf.get(key);
};

exports.config = config;