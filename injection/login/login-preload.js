'use strict';

//region Login >> Require

const {ipcRenderer} = require('electron');

//endregion

//region Login >> Variable

var txtUsrCode, txtUsrPassword, btnLogin;

//endregion

//region Login >> Initialize

(function init() {

    window.isElectron = true;
    window.ipcRenderer = ipcRenderer;

})();

//endregion

//region Login >> Listen

window.ipcRenderer.on('on-login', function (event, args) {

    var process = args.process;

    switch (process) {
        case "auto-login":
            initLogin(args);
            break;
    }

});

//endregion

//region Login >> Function

function initLogin(args) {

    txtUsrCode = document.querySelector('#tbxUsername');
    txtUsrPassword = document.querySelector('#tbxPassword');
    btnLogin = document.querySelector('#btnLogin');

    if (txtUsrCode && txtUsrPassword && btnLogin) {

        autoLogin(args);

    } else {

        setTimeout(function () {
            initLogin(args);
        }, 100);

    }

}

function autoLogin(args) {

    txtUsrCode.value = args.username;
    txtUsrPassword.value = args.password;

    btnLogin.click();

}

//endregion