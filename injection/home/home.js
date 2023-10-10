//region Home >> Variable

var buttonCase, buttonCaseWork;

var iFrameCaseM, headCaseM, layoutUpButtonsCaseM, btnSearchCaseM, btnNewCaseM, btnUpdateCaseM, btnDeleteCaseM,
    btnAnalyzeCaseM, btnCopyCaseM;
var iFrameCaseWork, headCaseWork, layoutUpButtonsCaseWork, btnSearchCaseWork, btnNewCaseWork, btnUpdateCaseWork,
    btnDeleteCaseWork, btnAnalyzeCaseWork, btnCopyCaseWork;

var caseFocusTimeout, caseWorkFocusTimeout;

//endregion

//region Home >> Initialize

(function init() {

    iFrameCaseM = window.iFrameCaseM;
    headCaseM = window.headCaseM;
    layoutUpButtonsCaseM = window.layoutUpButtonsCaseM;
    btnSearchCaseM = window.btnSearchCaseM;
    btnNewCaseM = window.btnNewCaseM;
    btnUpdateCaseM = window.btnUpdateCaseM;
    btnDeleteCaseM = window.btnDeleteCaseM;
    btnAnalyzeCaseM = window.btnAnalyzeCaseM;
    btnCopyCaseM = window.btnCopyCaseM;

    iFrameCaseWork = window.iFrameCaseWork;
    headCaseWork = window.headCaseWork;
    layoutUpButtonsCaseWork = window.layoutUpButtonsCaseWork;
    btnSearchCaseWork = window.btnSearchCaseWork;
    btnNewCaseWork = window.btnNewCaseWork;
    btnUpdateCaseWork = window.btnUpdateCaseWork;
    btnDeleteCaseWork = window.btnDeleteCaseWork;
    btnAnalyzeCaseWork = window.btnAnalyzeCaseWork;
    btnCopyCaseWork = window.btnCopyCaseWork;

    initScroll();

})();

function initScroll() {

    const el = document.getElementById('sub-buttons');

    let pos = {top: 0, left: 0, x: 0, y: 0};

    el.style.cursor = 'grab';

    const mouseDownHandler = function (e) {

        el.style.cursor = 'grabbing';
        el.style.userSelect = 'none';

        pos = {
            left: el.scrollLeft,
            top: el.scrollTop,
            x: e.clientX,
            y: e.clientY,
        };

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    };

    const mouseMoveHandler = function (e) {

        const dx = e.clientX - pos.x;
        const dy = e.clientY - pos.y;

        el.scrollTop = pos.top - dy;
        el.scrollLeft = pos.left - dx;

    };

    const mouseUpHandler = function () {

        el.style.cursor = 'grab';
        el.style.removeProperty('user-select');

        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);

    };

    const mousewheel = function (event, delta) {

        this.scrollLeft -= (delta * 10);

        event.preventDefault();

    };

    $(el).mousewheel(mousewheel);
    el.addEventListener('mousedown', mouseDownHandler);

}

//endregion

//region Home >> Function

function switchPage() {

    if (window.activePage === 'Case') {
        openCaseWork();
    } else {
        openCase();
    }

}

function focusCell() {

    if (window.activePage === 'Case') {

        clearTimeout(caseWorkFocusTimeout);
        caseFocusTimeout = setTimeout(function () {
            iFrameCaseM.contentWindow.focusLatestCell();
        }, 1000);

    } else {

        clearTimeout(caseFocusTimeout);
        caseWorkFocusTimeout = setTimeout(function () {
            iFrameCaseWork.contentWindow.focusLatestCell();
        }, 1000);

    }

}

function openCase() {

    var cContainer = document.getElementById("iframe-1178");
    var cwContainer = document.getElementById("iframe-10783");
    var cSubButtons = document.getElementById("sub-buttons-case");
    var cwSubButtons = document.getElementById("sub-buttons-casework");

    iFrameCaseWork.contentWindow.blurLatestCell();

    buttonCase = buttonCase || document.getElementById("main-button-case");
    buttonCaseWork = buttonCaseWork || document.getElementById("main-button-casework");

    cContainer.style.transform = "translateX(0%)";
    cwContainer.style.transform = "translateX(100%)";

    cSubButtons.style.transform = "translateY(0%)";
    cwSubButtons.style.transform = "translateY(100%)";

    window.activePage = "Case";
    buttonCaseWork.classList.remove("hover");
    buttonCase.classList.add("hover");

    clearTimeout(caseWorkFocusTimeout);
    caseFocusTimeout = setTimeout(function () {
        iFrameCaseM.contentWindow.focusLatestCell();
    }, 500);

}

function openCaseWork() {

    var cContainer = document.getElementById("iframe-1178");
    var cwContainer = document.getElementById("iframe-10783");
    var cSubButtons = document.getElementById("sub-buttons-case");
    var cwSubButtons = document.getElementById("sub-buttons-casework");

    iFrameCaseM.contentWindow.blurLatestCell();

    buttonCase = buttonCase || document.getElementById("main-button-case");
    buttonCaseWork = buttonCaseWork || document.getElementById("main-button-casework");

    cContainer.style.transform = "translateX(-100%)";
    cwContainer.style.transform = "translateX(0%)";

    cSubButtons.style.transform = "translateY(-100%)";
    cwSubButtons.style.transform = "translateY(0%)";

    window.activePage = "CaseWork";
    buttonCase.classList.remove("hover");
    buttonCaseWork.classList.add("hover");

    clearTimeout(caseFocusTimeout);
    caseWorkFocusTimeout = setTimeout(function () {
        iFrameCaseWork.contentWindow.focusLatestCell();
    }, 500);

}

function searchClick() {

    if (window.activePage === 'Case') {
        btnSearchCaseM.click();
    } else {
        btnSearchCaseWork.click();
    }

    filterClick(true);

}

function filterClick(close) {

    var height = 0;
    var isActive = false;
    var layoutUpButtons;

    if (window.activePage === 'Case') {
        layoutUpButtons = layoutUpButtonsCaseM;
    } else {
        layoutUpButtons = layoutUpButtonsCaseWork;
    }

    isActive = layoutUpButtons.classList.contains("filter-active");

    if (isActive || close) {

        height = layoutUpButtons.offsetHeight;

        layoutUpButtons.style.marginTop = (-1 * height).toString() + "px";
        layoutUpButtons.classList.remove("filter-active");

    } else {

        layoutUpButtons.style.marginTop = "25px";
        layoutUpButtons.classList.add("filter-active");

    }

}

function switchStatus(switcherEl) {

    var iframe;

    if (window.activePage === 'Case') {

        iframe = document.querySelector(config.get("webERP").iframeCase).contentWindow;

        if (switcherEl.classList.contains("waiting")) {

            iframe.quickFilterStatusClick("active");
            switcherEl.classList.remove("waiting");
            switcherEl.classList.add("active");

        } else if (switcherEl.classList.contains("active")) {

            iframe.quickFilterStatusClick("completed");
            switcherEl.classList.remove("active");
            switcherEl.classList.add("completed");

        } else if (switcherEl.classList.contains("completed")) {

            iframe.quickFilterStatusClick("waiting");
            switcherEl.classList.remove("completed");
            switcherEl.classList.add("waiting");

        }

    } else {

        openCase();

    }

}

function newClick() {

    if (window.activePage === 'Case') {
        btnNewCaseM.click();
    } else {
        btnNewCaseWork.click();
    }

}

function updateClick() {

    if (window.activePage === 'Case') {
        btnUpdateCaseM.click();
    } else {
        btnUpdateCaseWork.click();
    }

}

function deleteClick() {

    if (window.activePage === 'Case') {
        btnDeleteCaseM.click();
    } else {
        btnDeleteCaseWork.click();
    }

}

function analyzeClick() {

    if (window.activePage === 'Case') {
        btnAnalyzeCaseM.click();
    } else {
        btnAnalyzeCaseWork.click();
    }

}

function copyClick() {

    if (window.activePage === 'Case') {
        btnCopyCaseM.click();
    } else {
        btnCopyCaseWork.click();
    }

}

function addNew(page, type) {

    var url, queryString;

    if (page === "case") {
        url = config.get("webERP").newCase;
    } else {
        url = config.get("webERP").newCaseWork;
    }

    if (type) {
        queryString = "&Page=" + page + "&Type=" + type;
        url = url + queryString;
    }

    window.open(url, '_blank');

}

function refreshSession(isVisible) {

    var myListPageCaseM, myListPageCaseWork;

    if (!iFrameCaseM && !iFrameCaseWork) return;

    myListPageCaseM = iFrameCaseM.contentWindow.myListPage;
    myListPageCaseWork = iFrameCaseWork.contentWindow.myListPage;

    if (isVisible) {

        if (window.activePage === 'Case') {

            if (!myListPageCaseWork.InCallback())
                myListPageCaseWork.PerformCallback();

        } else {

            if (!myListPageCaseM.InCallback())
                myListPageCaseM.PerformCallback();

        }

    } else {

        if (!myListPageCaseM.InCallback())
            myListPageCaseM.PerformCallback();

        if (!myListPageCaseWork.InCallback())
            myListPageCaseWork.PerformCallback();

    }

}

//endregion
