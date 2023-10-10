'use strict';

//region Loading >> Require

const {config} = require('../config');
const {remote, ipcRenderer} = require('electron');

//endregion

//region Loading >> Variable


//endregion

//region Loading >> Initialize

(function init() {

    window.config = config;
    window.isElectron = true;
    window.remote = remote;
    window.ipcRenderer = ipcRenderer;

})();

//endregion

//region Loading >> Listen

window.ipcRenderer.on('on-loading', function (event, args) {

    switch (args.process) {

        case 'logon-failed':
            logonFailed(args.message);
            break;

        case 'auto-list':
            prepare(args.message);
            break;

    }

});

//endregion

//region Loading >> Function

function logonFailed(message) {

    var messageEl;

    messageEl = document.getElementById("initial-loading-message");
    messageEl.innerHTML = message;
    messageEl.classList.add("logon-failed");

}

function prepare(message) {

    var messageEl;

    messageEl = document.getElementById("initial-loading-message");
    messageEl.innerHTML = message;

}

//endregion