'use strict';

//region Main >> Require

const {config} = require('./config');
const path = require('path');
const {app, BrowserWindow, screen, ipcMain, ipcRenderer, Tray, Menu, globalShortcut, clipboard, dialog, shell} = require('electron');
const Store = require('electron-store');
const messenger = require('messenger');

//endregion

//region Main >> Variable

let retriesLogin;
let title, active;
let tray, contextMenu;
let loadingWindow;
let mainWindow, subWindow;
let caseWindow, caseWorkWindow;
let refreshSessionInterval;
let listener, broadcaster;

retriesLogin = 0;
active = !(config.get("passiveBoot") === true);

//endregion

//region Main >> Listen

app.whenReady().then(() => {

    Store.initRenderer();

    main();

    createAllShortcut();
    createMessenger();

    listenToDownloads();

});

app.on('window-all-closed', function () {

    if (process.platform !== 'darwin') {
        clearInterval(refreshSessionInterval);
        app.quit()
    }

});

function listenToOtherERP() {

    listener.on('OtherERP', function (message, args) {

        args = args || {};

        switch (args.process) {

            case 'unregisterall':

                globalShortcut.unregisterAll();

                closeAllWindow();
                createActivateShortcut();

                tray.setImage(path.join(__dirname, "img/uts128b.png"));

                message.reply({success: true, message: 'İşlem başarılı.'})

                active = false;

                break;

            case 'get-lastcasework':

                global.message = message;

                mainWindow.webContents.send('on-home', {process: 'get-lastcasework'});

                break;

            case 'closeall':

                exit();

                message.reply({success: true, message: 'İşlem başarılı.'})

                break;

        }

    });

}

function listenToDownloads() {

    mainWindow.webContents.session.on('will-download', (event, item, webContents) => {

        item.once('done', (event, state) => {

            if (state === 'completed')
                shell.openPath(item.getSavePath());

        })

    })

}

//region Debug : Değişiklik olduğunda ekranı yenile.
//require('electron-reload')(__dirname);
//endregion

//endregion

//region Main >> Interval

refreshSessionInterval = setInterval(function () {

    var args = {
        process: "refresh-session",
        isVisible: mainWindow.isVisible()
    };

    mainWindow.webContents.send('on-home', args);

}, config.get("webERP").refreshTimeout || 180000);

//endregion

//region Main >> Function

function main() {

    createMainWindow();

}

function exit() {
    clearInterval(refreshSessionInterval);
    mainWindow.destroy();
}


function createMainWindow() {

    //region BrowserWindow >> Variable

    title = config.get("webERP").title;

    title = title ? "UyumTASKS | " + title : "UyumTASKS";

    //endregion

    //region BrowserWindow >> Create

    mainWindow = new BrowserWindow({
        title: title,
        show: false,
        opacity: 0,
        frame: false,
        titleBarStyle: 'hidden',
        icon: path.join(__dirname, 'img/uts128.png'),
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'injection/preload_main.js')
        }
    });

    loadingWindow = new BrowserWindow({
        show: false,
        parent: mainWindow,
        modal: true,
        frame: false,
        movable: false,
        resizable: false,
        fullscreen: true,
        transparent: true,
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'page/loading-preload.js')
        }
    });

    //endregion

    //region BrowserWindow >> Initialize

    if (config.get("hiddenBoot")) {

        mainWindow.setMenu(null);
        mainWindow.setOpacity(1);
        mainWindow.firstBoot = true;
        mainWindow.loadURL(config.get("webERP").login);

        loadingWindow.isQuiting = true;
        loadingWindow.setMenu(null);

    } else {

        mainWindow.maximize();
        mainWindow.setMenu(null);
        mainWindow.loadURL(config.get("webERP").login);

        loadingWindow.isQuiting = true;
        loadingWindow.setMenu(null);
        loadingWindow.loadFile('page/loading.html');

        loadingWindow.show();

        //region Debug : DevTools aç/kapat.
        // loadingWindow.webContents.openDevTools();
        //endregion

        setTimeout(function () {

            mainWindow.show();
            mainWindow.setOpacity(1);

            //region Debug : DevTools aç/kapat.
            // mainWindow.webContents.openDevTools();
            //endregion

        }, 500);

    }

    //endregion

    //region BrowserWindow >> Listen

    /// Oluşturulan pencerelerden gönderilen mesajları yakalar.
    /// Gelen mesajlara cevap verilir. event.reply veya farklı yöntemler ile.
    ipcMain.on('on-main', (event, args) => {

        var process = args.process;

        switch (process) {

            case 'home-loaded':

                if (loadingWindow.isQuiting)
                    loadingWindow.isQuiting = false;

                loadingWindow.close();

                createTray();

                break;

            case 'quickreview-case':

                if (args.caseNumber)
                    createCase(config.get("webERP").analyzeCase + args.caseNumber);

                break;

            case 'new-casework':

                var url, parent;

                url = config.get("webERP").newCaseWork + '&caseNumber=' + args.caseNumber;
                parent = args.parent === "case" ? subWindow : mainWindow;

                createCaseWork(url, parent);

                break;

            case 'get-lastcasework':

                broadcaster.request('OtherERP', {process: 'get-lastcasework'}, function (reply) {

                    if (reply.success) {

                        event.returnValue = reply.data;

                    }

                });

                break;

        }

    });

    mainWindow.on('close', function (event) {

        event.preventDefault();

        mainWindow.hide();

        createTray();

        return false;
    });

    mainWindow.webContents.on('did-finish-load', function () {

        var args = {};
        var username = config.get("username");
        var password = config.get("password");

        if (username && password && retriesLogin < 3) {

            args = {
                process: "auto-login",
                username: username,
                password: password
            };

            mainWindow.webContents.send('on-login', args);

            retriesLogin++;

        } else {

            args = {
                process: "logon-failed",
                message: "GİRİŞ YAPILAMADI"
            };

            loadingWindow.webContents.send('on-loading', args);

        }

    });

    mainWindow.webContents.on('did-navigate', function (event, url) {

        var args = {
            process: "auto-list",
            username: config.get("username"),
            password: config.get("password"),
            message: "HAZIRLANIYOR"
        };

        if (url === config.get("webERP").home) {

            mainWindow.webContents.send('on-home', args);
            loadingWindow.webContents.send('on-loading', args);

        }

    });

    mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures, referrer, postBody) => {

        createSubWindow(url);

        event.preventDefault();

    });


    loadingWindow.on('close', function (event) {

        if (loadingWindow.isQuiting) {

            event.preventDefault();

            mainWindow.destroy();

        }

        return false;
    });

    //endregion

}

function createSubWindow(url) {

    //region BrowserWindow >> Create

    if (url.includes("CommandName=CaseMCollection")) {

        subWindow = new BrowserWindow({
            show: false,
            opacity: 1,
            resizable: true,
            movable: true,
            modal: true,
            frame: true,
            icon: path.join(__dirname, 'img/uts48.png'),
            webPreferences: {
                contextIsolation: false,
                enableRemoteModule: true,
                preload: path.join(__dirname, 'injection/case/case-preload.js')
            }
        });

    } else if (url.includes("CommandName=CaseWorkCollection")) {

        subWindow = new BrowserWindow({
            show: false,
            opacity: 1,
            resizable: true,
            movable: true,
            modal: true,
            frame: true,
            icon: path.join(__dirname, 'img/uts48.png'),
            webPreferences: {
                contextIsolation: false,
                enableRemoteModule: true,
                preload: path.join(__dirname, 'injection/casework/casework-preload.js')
            }
        });

    } else {

        subWindow = new BrowserWindow({
            show: false,
            opacity: 1,
            resizable: true,
            movable: true,
            modal: true,
            frame: true,
            icon: path.join(__dirname, 'img/uts48.png'),
            webPreferences: {
                contextIsolation: false,
                enableRemoteModule: true
            }
        });

    }

    //endregion

    //region BrowserWindow >> Initialize

    subWindow.maximize();
    subWindow.setMenu(null);
    subWindow.loadURL(url);
    subWindow.show();

    //region Debug : DevTools aç/kapat.
    // subWindow.webContents.openDevTools();
    //endregion

    //endregion

    //region BrowserWindow >> Listen

    subWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures, referrer, postBody) => {

        var browserWindow = new BrowserWindow({
            parent: subWindow,
            show: false,
            opacity: 1,
            width: 1024,
            height: 768,
            resizable: true,
            modal: true,
            frame: true,
            alwaysOnTop: true,
            icon: path.join(__dirname, 'img/uts48.png'),
            webPreferences: {
                contextIsolation: false,
                enableRemoteModule: true
            }
        });

        browserWindow.setMenu(null);
        browserWindow.loadURL(url);
        browserWindow.show();

        //region Debug : DevTools aç/kapat.
        // browserWindow.webContents.openDevTools();
        //endregion

        event.preventDefault();

    });

    subWindow.on('close', function (event) {

        var args = {
            process: "refresh-list"
        };

        if (mainWindow.isVisible())
            mainWindow.focus();

        mainWindow.webContents.send('on-home', args);

    });

    //endregion

}

function createCase(url) {

    //region BrowserWindow >> Create

    caseWindow = new BrowserWindow({
        parent: mainWindow,
        show: false,
        opacity: 1,
        resizable: true,
        movable: true,
        modal: true,
        frame: true,
        icon: path.join(__dirname, 'img/uts48.png'),
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'injection/case/case-preload.js')
        }
    });

    //endregion

    //region BrowserWindow >> Initialize

    caseWindow.maximize();
    caseWindow.setMenu(null);
    caseWindow.loadURL(url);
    caseWindow.show();

    //region Debug : DevTools aç/kapat.
    // caseWindow.webContents.openDevTools();
    //endregion

    //endregion

    //region BrowserWindow >> Listen

    caseWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures, referrer, postBody) => {

        var browserWindow = new BrowserWindow({
            parent: caseWindow,
            show: false,
            opacity: 1,
            width: 1024,
            height: 768,
            resizable: true,
            modal: true,
            frame: true,
            alwaysOnTop: true,
            icon: path.join(__dirname, 'img/uts48.png'),
            webPreferences: {
                contextIsolation: false,
                enableRemoteModule: true
            }
        });

        browserWindow.setMenu(null);
        browserWindow.loadURL(url);
        browserWindow.show();

        //region Debug : DevTools aç/kapat.
        // browserWindow.webContents.openDevTools();
        //endregion

        event.preventDefault();

    });

    caseWindow.on('close', function (event) {

        var args = {
            process: "refresh-list"
        };

        if (mainWindow.isVisible())
            mainWindow.focus();

        mainWindow.webContents.send('on-home', args);

    });

    //endregion

}

function createCaseWork(url, parent) {

    //region BrowserWindow >> Create

    caseWorkWindow = new BrowserWindow({
        parent: parent,
        show: false,
        opacity: 1,
        resizable: true,
        movable: true,
        modal: true,
        width: 1024,
        height: 768,
        frame: true,
        icon: path.join(__dirname, 'img/uts48.png'),
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'injection/casework/casework-preload.js')
        }
    });

    //endregion

    //region BrowserWindow >> Initialize

    caseWorkWindow.setMenu(null);
    caseWorkWindow.loadURL(url);
    caseWorkWindow.show();

    //region Debug : DevTools aç/kapat.
    // caseWorkWindow.webContents.openDevTools();
    //endregion

    //endregion

    //region BrowserWindow >> Listen

    caseWorkWindow.on('close', function (event) {

        if (parent === mainWindow) {

            var args = {
                process: "refresh-list"
            };

            if (mainWindow.isVisible())
                mainWindow.focus();

            mainWindow.webContents.send('on-home', args);

        }

    });

    //endregion

}

function createTray() {

    if (!tray || tray.isDestroyed()) {

        tray = active ? new Tray(path.join(__dirname, "img/uts128.png")) : new Tray(path.join(__dirname, "img/uts128b.png"));

        contextMenu = Menu.buildFromTemplate([
            {
                icon: path.join(__dirname, "img/show.png"),
                label: "UyumTASKS'ı Aç", click: function () {

                    if (active) {
                        mainWindow.show();
                    } else {
                        changeERP();
                    }

                }
            },
            {
                icon: path.join(__dirname, "img/exit.png"),
                label: "UyumTASKS'tan Çık", click: function () {

                    broadcaster.request('OtherERP', {process: 'closeall'}, function (reply) {

                        if (reply.success) {

                            exit();

                        }

                    });

                }
            }
        ]);

        tray.setToolTip('UyumTASKS');
        tray.setContextMenu(contextMenu);

        tray.on('click', function (event) {

            if (active) {

                if (mainWindow.isVisible()) {

                    mainWindow.hide();

                } else {

                    if (mainWindow.firstBoot) {
                        mainWindow.firstBoot = false;
                        mainWindow.maximize();
                    }

                    mainWindow.show();

                }

            } else {

                changeERP();

            }

        });

    }

}

function createAllShortcut() {

    var shortcuts = config.get("shortcuts");
    var cases = config.get("case");
    var caseworks = config.get("caseWork");

    createActivateShortcut();

    if (active) {

        if (shortcuts && shortcuts.uyumtasks) {

            globalShortcut.register(shortcuts.uyumtasks, () => {

                if (mainWindow.isVisible() && mainWindow.isFocused()) {

                    var args = {
                        process: "switch-page",
                    };

                    mainWindow.show();
                    mainWindow.maximize();
                    mainWindow.webContents.send('on-home', args);

                } else {

                    mainWindow.show();
                    mainWindow.maximize();

                }

            });

        }

        if (cases && cases.newShortcut) {

            globalShortcut.register(cases.newShortcut, () => {

                var args = {
                    process: "new-case",
                    page: "case"
                };

                mainWindow.webContents.send('on-home', args);

            });

        }

        if (cases && cases.quickReviewShortcut) {

            globalShortcut.register(cases.quickReviewShortcut, () => {

                var args = {
                    process: 'quickreview-case',
                    caseNumber: clipboard.readText() ? clipboard.readText().trim() : ''
                };

                if (args.caseNumber && args.caseNumber.indexOf(' ') <= 0) {

                    mainWindow.webContents.send('on-home', args);

                }

            });

        }

        if (caseworks && caseworks.newShortcut) {

            globalShortcut.register(caseworks.newShortcut, () => {

                var args = {
                    process: "new-casework",
                    page: "caseWork",
                };

                mainWindow.webContents.send('on-home', args);

            });

        }

    }
}

function createActivateShortcut() {

    var shortcuts = config.get("shortcuts");

    if (shortcuts && shortcuts.activate) {

        globalShortcut.register(shortcuts.activate, () => {

            changeERP();

        });

    }

}

function createMessenger() {

    var webERP = config.get("webERP");

    if (webERP.listen) {

        listener = messenger.createListener(webERP.listen);

        listenToOtherERP();

    }

    if (webERP.broadcast) {

        broadcaster = messenger.createSpeaker(webERP.broadcast);

    }

}


function closeAllWindow() {

    if (caseWindow && !caseWindow.isDestroyed()) caseWindow.close();

    if (caseWorkWindow && !caseWorkWindow.isDestroyed()) caseWorkWindow.close();

    if (subWindow && !subWindow.isDestroyed()) subWindow.close();

    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.close();

    if (loadingWindow && !loadingWindow.isDestroyed()) loadingWindow.close();

}


function changeERP() {

    if (!active) {

        broadcaster.request('OtherERP', {process: 'unregisterall'}, function (reply) {

            if (reply.success) {

                active = true;

                createAllShortcut();

                tray.setImage(path.join(__dirname, "img/uts128.png"));

                mainWindow.hide()

                setTimeout(() => {

                    mainWindow.show();
                    mainWindow.maximize();
                    mainWindow.webContents.send('on-home', {process: "focus-cell"});

                }, 250)


            }

        });

    } else {

        mainWindow.show();
        mainWindow.maximize();
        mainWindow.webContents.send('on-home', {process: "focus-cell"});

    }

}

//endregion
