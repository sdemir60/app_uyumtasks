'use strict';

//region Home >> Require

const {config} = require('../../config');
const {remote, ipcRenderer} = require('electron');
const customTitlebar = require('custom-electron-titlebar');
const path = require('path');
const fs = require('fs');

//endregion

//region Home >> Variable

var iFrameCaseM, headCaseM, formCaseM, formLatestElementCaseM, layoutUpButtonsCaseM, btnSearchCaseM, btnNewCaseM,
    btnUpdateCaseM, btnDeleteCaseM, btnAnalyzeCaseM, btnCopyCaseM, myListPageCaseM;
var iFrameCaseWork, headCaseWork, formCaseWork, formLatestElementCaseWork, layoutUpButtonsCaseWork, btnSearchCaseWork,
    btnNewCaseWork, btnUpdateCaseWork, btnDeleteCaseWork, btnAnalyzeCaseWork, btnCopyCaseWork, myListPageCaseWork;

//endregion

//region Home >> Initialize

(function init() {

    window.config = config;
    window.isElectron = true;
    window.remote = remote;
    window.ipcRenderer = ipcRenderer;

})();

//endregion

//region Home >> Listen

window.ipcRenderer.on('on-home', function (event, args) {

    switch (args.process) {

        case 'switch-page':
            switchPage();
            break;

        case 'focus-cell':
            focusCell();
            break;

        case 'auto-list':
            initList();
            break;

        case 'refresh-list':
            searchClick();
            break;

        case 'refresh-session':
            if (typeof refreshSession !== 'undefined') refreshSession(args.isVisible);
            break;

        case 'new-case':
            addNew(args.page, args.type);
            break;

        case 'quickreview-case':

            if (args.caseNumber) {

                AjaxStandartCall("GetCaseIdFromNumber", args.caseNumber, '', function (caseNumber) {

                    event.sender.send('on-main', {process: 'quickreview-case', caseNumber: caseNumber})

                });

            }

            break;

        case 'new-casework':
            addNew(args.page, args.type);
            break;

        case 'get-lastcasework':

            AjaxStandartCall("GetLastCaseWorkDateTime", '', '', function (data) {

                remote.getGlobal('message').reply({success: true, message: 'İşlem başarılı.', data: data})

            });

            break;

    }

});

//endregion

//region Home >> Function

function initList() {

    if (typeof createTab === "function") {

        openPage();
        initTitlebar();

    } else {

        setTimeout(function () {
            initList();
        }, 250);

    }

}

function openPage() {

    addHeader();
    addHomeCSS();
    addHomeMW();
    addHomeJS();

    eval(config.get("webERP").menuCase);
    eval(config.get("webERP").menuCaseWork);

    initHome()
        .done(function () {
            findElement();
        });

}

function initTitlebar() {

    var title, titlebar;

    titlebar = new customTitlebar.Titlebar({
        menu: null,
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAA4mAAAOJgGi7yX8AAAGymlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTEyLTA1VDE1OjQ3OjQ4KzAzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0xMi0wNVQxNjowODoxNiswMzowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0xMi0wNVQxNjowODoxNiswMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozODhkZTQxMC1lZTJhLWY3NGItODk5MC1lY2NjYTQzODliYzAiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo2OTI0ZThkMC1hN2RlLThmNDMtYWQxMC1iNzE5YTVlNmQwY2MiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo3NDA4ODkwNi03ZTUyLWNkNDQtOTIxMC1mM2U3NjYzYTViYjIiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjc0MDg4OTA2LTdlNTItY2Q0NC05MjEwLWYzZTc2NjNhNWJiMiIgc3RFdnQ6d2hlbj0iMjAyMC0xMi0wNVQxNTo0Nzo0OCswMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpkOWVjOTc2MC1lOTRmLTRiNGEtYmU1Ny1mZmE3ZjU1OTlmNjIiIHN0RXZ0OndoZW49IjIwMjAtMTItMDVUMTY6MDQ6NDUrMDM6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6Mzg4ZGU0MTAtZWUyYS1mNzRiLTg5OTAtZWNjY2E0Mzg5YmMwIiBzdEV2dDp3aGVuPSIyMDIwLTEyLTA1VDE2OjA4OjE2KzAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+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',
        titleHorizontalAlignment: 'left',
        backgroundColor: customTitlebar.Color.fromHex('#ececec')
    });

    title = config.get("webERP").title;
    title = title ? "UyumTASKS | " + title : "UyumTASKS";

    titlebar.updateTitle(title);

}

function initHome(deferred) {

    var dContainer, cwContainer, cContainer;

    deferred = deferred || $.Deferred();

    dContainer = document.querySelector(config.get("webERP").iframeDashboard);
    cContainer = document.querySelector(config.get("webERP").iframeCase);
    cwContainer = document.querySelector(config.get("webERP").iframeCaseWork);

    if (dContainer && cContainer && cwContainer) {

        dContainer.remove();

        cContainer.style.position = "absolute";
        cContainer.style.top = "0";
        cContainer.style.right = "0";
        cContainer.style.left = "0";
        cContainer.style.transition = "transform .5s ease";
        cContainer.style.transform = "translateX(0%)";
        cContainer.classList.remove("active");

        cwContainer.style.position = "absolute";
        cwContainer.style.top = "0";
        cwContainer.style.right = "0";
        cwContainer.style.left = "0";
        cwContainer.style.transition = "transform .5s ease";
        cwContainer.style.transform = "translateX(100%)";
        cwContainer.classList.remove("active");

        window.activePage = "Case";

        deferred.resolve();

    } else {

        setTimeout(function () {
            initHome(deferred);
        }, 250);

    }

    return deferred.promise();
}

function findElement() {

    iFrameCaseM = document.querySelector(config.get("webERP").iframeCase);
    iFrameCaseWork = document.querySelector(config.get("webERP").iframeCaseWork);

    if (iFrameCaseM && iFrameCaseWork) {

        var isFound = true;
        var documentCaseM = iFrameCaseM.contentWindow.document;
        var documentCaseWork = iFrameCaseWork.contentWindow.document;

        headCaseM = documentCaseM.getElementsByTagName('head')[0];
        formCaseM = documentCaseM.getElementById('frmList');
        formLatestElementCaseM = documentCaseM.querySelector('#frmList > input[name="DXCss"]');
        layoutUpButtonsCaseM = documentCaseM.getElementById('LayoutUpButtons');
        btnSearchCaseM = documentCaseM.getElementById('btnSearch');
        btnNewCaseM = documentCaseM.getElementById('btnNew');
        btnUpdateCaseM = documentCaseM.getElementById('btnUpdate');
        btnDeleteCaseM = documentCaseM.getElementById('btnDelete');
        btnAnalyzeCaseM = documentCaseM.getElementById('btnAnalyze');
        btnCopyCaseM = documentCaseM.getElementById('btnCopy');
        myListPageCaseM = documentCaseM.getElementById('myListPage');

        headCaseWork = documentCaseWork.getElementsByTagName('head')[0];
        formCaseWork = documentCaseWork.getElementById('frmList');
        formLatestElementCaseWork = documentCaseWork.querySelector('#frmList > input[name="DXCss"]');
        layoutUpButtonsCaseWork = documentCaseWork.getElementById('LayoutUpButtons');
        btnSearchCaseWork = documentCaseWork.getElementById('btnSearch');
        btnNewCaseWork = documentCaseWork.getElementById('btnNew');
        btnUpdateCaseWork = documentCaseWork.getElementById('btnUpdate');
        btnDeleteCaseWork = documentCaseWork.getElementById('btnDelete');
        btnAnalyzeCaseWork = documentCaseWork.getElementById('btnAnalyze');
        btnCopyCaseWork = documentCaseWork.getElementById('btnCopy');
        myListPageCaseWork = documentCaseWork.getElementById('myListPage');

        isFound = isFound && headCaseM && formCaseM && formLatestElementCaseM && layoutUpButtonsCaseM && btnSearchCaseM && btnNewCaseM && btnUpdateCaseM && btnDeleteCaseM && btnCopyCaseM && myListPageCaseM;
        isFound = isFound && headCaseWork && formCaseWork && formLatestElementCaseWork && layoutUpButtonsCaseWork && btnSearchCaseWork && btnNewCaseWork && btnUpdateCaseWork && btnDeleteCaseWork && btnCopyCaseWork && myListPageCaseWork;

        if (isFound) {

            window.iFrameCaseM = iFrameCaseM;
            window.headCaseM = headCaseM;
            window.layoutUpButtonsCaseM = layoutUpButtonsCaseM;
            window.btnSearchCaseM = btnSearchCaseM;
            window.btnNewCaseM = btnNewCaseM;
            window.btnUpdateCaseM = btnUpdateCaseM;
            window.btnDeleteCaseM = btnDeleteCaseM;
            window.btnAnalyzeCaseM = btnAnalyzeCaseM;
            window.btnCopyCaseM = btnCopyCaseM;
            window.myListPageCaseM = myListPageCaseM;

            window.iFrameCaseWork = iFrameCaseWork;
            window.headCaseWork = headCaseWork;
            window.layoutUpButtonsCaseWork = layoutUpButtonsCaseWork;
            window.btnSearchCaseWork = btnSearchCaseWork;
            window.btnNewCaseWork = btnNewCaseWork;
            window.btnUpdateCaseWork = btnUpdateCaseWork;
            window.btnDeleteCaseWork = btnDeleteCaseWork;
            window.btnAnalyzeCaseWork = btnAnalyzeCaseWork;
            window.btnCopyCaseWork = btnCopyCaseWork;
            window.myListPageCaseWork = myListPageCaseWork;

            autoList();

        } else {

            setTimeout(function () {
                findElement();
            }, 250);

        }

    } else {

        setTimeout(function () {
            findElement();
        }, 250);

    }

}

function autoList() {

    addIFrameCSS();
    addIFrameJS();

}

function addHeader() {

    var header, headerStr;
    var caseConfig, caseWorkConfig;
    var caseDefaultValues, caseWorkDefaultValues;
    var caseSubButtons, caseWorkSubButtons;

    header = document.createElement('div');
    headerStr = fs.readFileSync(path.join(__dirname, 'home-header.html'), 'utf8');

    caseConfig = config.get("case");
    caseWorkConfig = config.get("caseWork");

    caseDefaultValues = caseConfig ? caseConfig.defaultValues : null;
    caseWorkDefaultValues = caseWorkConfig ? caseWorkConfig.defaultValues : null;

    caseSubButtons = "";
    caseWorkSubButtons = "";

    if (caseDefaultValues) {

        caseDefaultValues.forEach(function (defaultValue) {

            caseSubButtons += '<div class="sub-button">\n' +
                '   <button class="button button-ml button-ml-p button--winona" data-text="' + (defaultValue.shortcut || defaultValue.name) + '" onclick="addNew(\'case\',\'' + defaultValue.name + '\')">\n' +
                '       <span>' + defaultValue.name + '</span>\n' +
                '   </button>\n' +
                '</div>\n'

        });

    }

    if (caseWorkDefaultValues) {

        caseWorkDefaultValues.forEach(function (defaultValue) {

            caseWorkSubButtons += '<div class="sub-button">\n' +
                '   <button class="button button-ml button-ml-p button--winona" data-text="' + (defaultValue.shortcut || defaultValue.name) + '" onclick="addNew(\'caseWork\',\'' + defaultValue.name + '\')">\n' +
                '       <span>' + defaultValue.name + '</span>\n' +
                '   </button>\n' +
                '</div>\n'

        });

    }

    headerStr = headerStr.replace("SubButtonsCaseReplace", caseSubButtons);
    headerStr = headerStr.replace("SubButtonsCaseWorkReplace", caseWorkSubButtons);

    header.className = 'home-header';
    header.innerHTML = headerStr;

    document.body.insertBefore(header, document.body.firstChild);

}

function addHomeCSS() {

    var style = document.createElement('style');
    var head = document.getElementsByTagName('head')[0];

    var styleType = 'text/css';
    var styleInnerHTML = "";

    styleInnerHTML = fs.readFileSync(path.join(__dirname, 'home.css'), 'utf8');
    styleInnerHTML = styleInnerHTML + "\n\n" + fs.readFileSync(path.join(__dirname, '../../css/inspiration-buttons.css'), 'utf8');

    style.type = styleType;
    style.innerHTML = styleInnerHTML;
    head.appendChild(style);

}

function addHomeMW() {

    var script, scriptType, scriptInnerHTML;
    var head = document.getElementsByTagName('head')[0];

    script = document.createElement('script');
    scriptType = 'text/javascript';
    scriptInnerHTML = fs.readFileSync(path.join(__dirname, '../core/jquery.mousewheel.js'), 'utf8');

    script.type = scriptType;
    script.innerHTML = scriptInnerHTML;
    head.appendChild(script);

}

function addHomeJS() {

    var script = document.createElement('script');
    var head = document.getElementsByTagName('head')[0];

    var scriptType = 'text/javascript';
    var scriptInnerHTML = fs.readFileSync(path.join(__dirname, 'home.js'), 'utf8');

    script.type = scriptType;
    script.innerHTML = scriptInnerHTML;
    head.appendChild(script);

}

function addIFrameCSS() {

    var styleCaseM = document.createElement('style');
    var styleCaseWork = document.createElement('style');

    var styleType = 'text/css';
    var styleInnerHTML = "";

    styleInnerHTML = fs.readFileSync(path.join(__dirname, 'home-iframe.css'), 'utf8');

    styleCaseM.type = styleType;
    styleCaseM.innerHTML = styleInnerHTML;
    headCaseM.appendChild(styleCaseM);

    styleCaseWork.type = styleType;
    styleCaseWork.innerHTML = styleInnerHTML;
    headCaseWork.appendChild(styleCaseWork);

    layoutUpButtonsCaseM.style.marginTop = (-1 * layoutUpButtonsCaseM.offsetHeight).toString() + "px";
    layoutUpButtonsCaseWork.style.marginTop = (-1 * layoutUpButtonsCaseWork.offsetHeight).toString() + "px";

}

function addIFrameJS() {

    var scriptCaseM = document.createElement('script');
    var scriptCaseWork = document.createElement('script');

    var scriptType = 'text/javascript';
    var scriptInnerHTML = fs.readFileSync(path.join(__dirname, 'home-iframe.js'), 'utf8');

    scriptCaseM.type = scriptType;
    scriptCaseM.innerHTML = scriptInnerHTML;
    formLatestElementCaseM.parentNode.insertBefore(scriptCaseM, formLatestElementCaseM.nextSibling);

    scriptCaseWork.type = scriptType;
    scriptCaseWork.innerHTML = scriptInnerHTML;
    formLatestElementCaseWork.parentNode.insertBefore(scriptCaseWork, formLatestElementCaseWork.nextSibling);

}

window.homeLoaded = function () {
    window.ipcRenderer.send('on-main', {process: 'home-loaded'})
}

window.newCaseWork = function (caseNumber) {
    window.ipcRenderer.send('on-main', {process: 'new-casework', caseNumber: caseNumber})
}

//endregion