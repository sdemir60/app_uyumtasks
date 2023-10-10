'use strict';

//region CaseWork >> Require

const {config} = require('../../config');
const {remote, ipcRenderer} = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

//endregion

//region CaseWork >> Variable

var head, script;

//endregion

//region CaseWork >> Initialize

(function init() {

    window.config = config;
    window.isElectron = true;
    window.remote = remote;
    window.ipcRenderer = ipcRenderer;
    window.store = new Store();

    initCaseWork();

})();

//endregion

//region CaseWork >> Listen

// window.ipcRenderer.on('on-casework', function (event, args) {

// var process = args.process;

// switch (process) {
//     casework '???':
//         console.log(args.data);
//         break;
// }

// });

//endregion

//region CaseWork >> Function

function initCaseWork() {

    head = document.getElementsByTagName('head')[0];
    script = document.querySelector("script[src*='js/Form/Common/Common.js']");

    if (head && script) {

        // addLangL();
        addMakroC();
        addGeneralCardJS(250);
        addGeneralCardCSS();

        addCaseWorkCSS();
        addCaseWorkJS();

    } else {

        setTimeout(function () {
            initCaseWork();
        });

    }

}

/// webERP de maninlist sayfalarında yeni vs dediğimizde yan sekmede açar ve birçok kodu window.parent diyerek parent dan yani mainlist lerin olduğu ekrandan alır.
/// Electron da ise açılan ekranların birbirleri arasında ilişki olmuyor. Birçok yöntem denendi. Sayfalar arasında window objesini transfer etmek istediğimizde büyük bir data olduğu için uygulama kitleniyor.
/// Hata aldığımızda window.parent diyerek erişilen metotlar yerine direk mainlist lerde tanımlı dosyalar erp den okunarak link olarak eklenir.
/// Burada sıra önemli. LangInf gibi dil hataları aldık ve önce dil dosyalarını sonra common.js tekrar eklendi.
/// Aslında commonjs yeni açılan ekranlarda tanımlı tekrar yüklemesi ve hata veren değişkenlerin dolması için tekrar tanımladı.
/// Versiyon numaraları webERP de ne tanımlı ise yeniden yüklemesi için daha yüksek bir değer verdik. Bu numara önemli.
///
/// *****
///
/// ERP4 geçişi sonrası iş/faaliyet ekranlarından yeni pencere açılamıyordu.
/// Sorun burada eklenen scriptlerden kaynaklı. Yeni versiyonda bunlara gerek yok gibi.
/// Kaldırıldı, test edildi, sorun tespit edilmedi. Kullanılırken bir sorun tespit edilirse tekrar gözden geçirilecek.
function addLangL() {

    var scriptInfCodes, scriptErrCodes, scriptCommon;

    scriptInfCodes = document.createElement('script');
    scriptInfCodes.type = "text/javascript";
    scriptInfCodes.src = "js/Form/MultiLanguage/InfCodes-tr.js?v=9999";

    scriptErrCodes = document.createElement('script');
    scriptErrCodes.type = "text/javascript";
    scriptErrCodes.src = "js/Form/MultiLanguage/ErrCodes-tr.js?v=9999";

    scriptCommon = document.createElement('script');
    scriptCommon.type = "text/javascript";
    scriptCommon.src = "js/Form/Common/Common.js?v=9999";

    head.appendChild(scriptInfCodes);
    head.appendChild(scriptErrCodes);
    head.appendChild(scriptCommon);

}

function addMakroC() {

    var script, scriptType, scriptInnerHTML;

    script = document.createElement('script');
    scriptType = 'text/javascript';
    scriptInnerHTML = fs.readFileSync(path.join(__dirname, '../core/uyum-makro.js'), 'utf8');

    script.type = scriptType;
    script.innerHTML = scriptInnerHTML;
    head.appendChild(script);

}

/*
Timeout kullanıldı çünkü addLangL içerisinde Common.js yükleniyor ve içerisinde general-card.js de bulunan metotlar var.
Aynı anda yüklendiği için general-card.js içerisindeki OnCellClick metodu aktif olmuyor.
*/
function addGeneralCardJS(timeout) {
    setTimeout(function () {

        var script, scriptType, scriptInnerHTML;

        script = document.createElement('script');
        scriptType = 'text/javascript';
        scriptInnerHTML = fs.readFileSync(path.join(__dirname, '../core/general-card.js'), 'utf8');

        script.type = scriptType;
        script.innerHTML = scriptInnerHTML;
        head.appendChild(script);

    }, timeout || 0)
}

function addGeneralCardCSS() {

    var style, styleType, styleInnerHTML;

    style = document.createElement('style');
    styleType = 'text/css';
    styleInnerHTML = fs.readFileSync(path.join(__dirname, '../core/general-card.css'), 'utf8');

    style.type = styleType;
    style.innerHTML = styleInnerHTML;
    head.appendChild(style);

}

function addCaseWorkCSS() {

    var style, styleType, styleInnerHTML;

    style = document.createElement('style');
    styleType = 'text/css';
    styleInnerHTML = fs.readFileSync(path.join(__dirname, 'casework.css'), 'utf8');

    style.type = styleType;
    style.innerHTML = styleInnerHTML;
    head.appendChild(style);

}

function addCaseWorkJS() {

    var script, scriptType, scriptInnerHTML;

    script = document.createElement('script');
    scriptType = 'text/javascript';
    scriptInnerHTML = fs.readFileSync(path.join(__dirname, 'casework.js'), 'utf8');

    script.type = scriptType;
    script.innerHTML = scriptInnerHTML;
    head.appendChild(script);

}

//endregion