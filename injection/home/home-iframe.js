//region Home >> Variable

var homeLoaded;
var href, config, page, pageName, pageConfig;
var latestCell, latestCellId, latestFocusedCell;
var defaultFilters = [], defaultFiltersTimeout;
var returnSelectedRowValues, generalOnKeyDown;
var isBindDetailGridViewCellClickEvent;

//endregion

//region Home >> Initialize

(function init() {

    href = window.location.href;
    config = window.parent.window.config;

    returnSelectedRowValues = ReturnSelectedRowValues;
    generalOnKeyDown = window.onkeydown;

    if (href.includes("CommandName=CaseMCollection")) {
        page = window.parent.window.myListPageCaseM;
        pageName = "Case";
        pageConfig = config.get("caseList");
    } else {
        page = window.parent.window.myListPageCaseWork;
        pageName = "CaseWork";
        pageConfig = config.get("caseWorkList");
    }

    addDefaultFilters();
    setDefaultFilters(25);

})();

//endregion

//region Home >> Function

function addDefaultFilters() {

    var qfParent, qfContainer, qfLine, qfSpan;

    if (pageConfig && pageConfig.filterList && pageConfig.filterList.length > 0) {

        qfParent = page.parentNode;

        qfContainer = document.createElement('div');
        qfContainer.className = "quick-filter-container";

        pageConfig.filterList.forEach(function (filters) {

            if (filters && filters.length > 0) {

                qfSpan = "";
                qfLine = document.createElement('div');
                qfLine.className = "quick-filter-line";

                filters.forEach(function (filter) {

                    qfSpan = qfSpan + '<span class="quick-filter-span' + (filter.default ? " active" : "") + '" onclick="quickFilterClick(this,\'' + filter.column + '\',\'' + filter.value + '\')">' + filter.key + '</span>';

                    if (filter.default) {
                        defaultFilters.push(filter);
                    }

                });

                qfLine.innerHTML = qfSpan;
                qfContainer.append(qfLine);

            }

        });

        qfParent.prepend(qfContainer);

        if (pageConfig.filterStatus) {
            defaultFilters.push({
                column: pageConfig.filterStatus.column,
                value: pageConfig.filterStatus.activeTasks
            });
        }

    }
}

function setDefaultFilters(interval) {

    var table, latestElement;
    var filter, filterEditor, filterInput, filterValue;

    clearTimeout(defaultFiltersTimeout);

    if (defaultFilters && defaultFilters.length > 0 && interval > 0) {

        filter = defaultFilters[0];
        filterEditor = myListPage.GetAutoFilterEditor(filter.column);
        filterInput = filterEditor.inputElement;
        table = page.querySelector("table");
        latestElement = page ? page.querySelector("#myListPage_PagerBarB_cmb_GridRowCount input") : null;

        if (filterEditor && filterInput && table && latestElement && !myListPage.InCallback()) {

            filterValue = filterEditor.initializeInputValue;

            if (filterValue === filter.value) {

                defaultFilters.shift();

                if (defaultFilters && defaultFilters.length > 0) {

                    filter = defaultFilters[0];
                    filterInput.value = filter.value;
                    myListPage.AutoFilterByColumn(filter.column, filter.value);

                } else {

                    if (!myListPage.InCallback())
                        myListPage.PerformCallback();

                }

            } else {

                filterInput.value = filter.value;
                myListPage.AutoFilterByColumn(filter.column, filter.value);

            }

        } else {

            setTimeout(function () {
                setDefaultFilters(--interval)
            }, 500);

        }

    } else {

        if (!homeLoaded && pageName === 'Case') {
            homeLoaded = true;
            window.parent.homeLoaded();
        }

        focusLatestCell();

    }
}

function quickFilterClick(element, column, value) {

    var filterEditor, filterInput, filterValue;

    filterEditor = myListPage.GetAutoFilterEditor(column);
    filterInput = filterEditor.inputElement;
    filterValue = filterEditor.initializeInputValue;

    element.parentElement.childNodes.forEach(function (filterEl) {
        filterEl.classList.remove("active");
    });

    if (value === filterValue) {

        filterInput.value = null;
        myListPage.AutoFilterByColumn(column, null);
        element.classList.remove("active");

    } else {

        filterInput.value = value;
        myListPage.AutoFilterByColumn(column, value);
        element.classList.add("active");

    }

}

function quickFilterStatusClick(status) {

    var column, filterEditor, filterInput;
    var waitingTasks, activeTasks, completedTask;

    if (pageConfig.filterStatus) {

        column = pageConfig.filterStatus.column;
        waitingTasks = pageConfig.filterStatus.waitingTasks;
        activeTasks = pageConfig.filterStatus.activeTasks;
        completedTask = pageConfig.filterStatus.completedTask;

        filterEditor = myListPage.GetAutoFilterEditor(column);
        filterInput = filterEditor.inputElement;

        switch (status) {

            case 'waiting':
                filterInput.value = waitingTasks;
                myListPage.AutoFilterByColumn(column, waitingTasks);
                break;

            case 'active':
                filterInput.value = activeTasks;
                myListPage.AutoFilterByColumn(column, activeTasks);
                break;

            case 'completed':
                filterInput.value = completedTask;
                myListPage.AutoFilterByColumn(column, completedTask);
                break;

        }

    }
}

function focusLatestCell() {

    var cellElement;

    if (pageName !== window.parent.activePage) return;

    if (latestCell)
        cellElement = document.getElementById(latestCellId);

    if (!cellElement || cellElement.length <= 0)
        cellElement = document.getElementById("myListPage|0|0");

    if (cellElement) {
        cellElement.focus();
        cellElement.click();
    }

}

function blurLatestCell() {

    var cellElement;

    if (latestCell) {
        cellElement = document.getElementById(latestCellId);
    } else {
        cellElement = document.getElementById("myListPage|0|0");
    }

    if (cellElement) {
        cellElement.blur();
    }

}

//endregion

//region Home >> Function ( Overwrite | webERP )

/// Grid üzerinde enter dediğimizde hata veriyordu. Kontrol eklendi ve metot ezildi.
/// Enter için kısayol ekledik. Kaydı incele modunda açabilmek için.
function ReturnSelectedRowValues(grid) {

    var values;

    values = GetGridAttributeValue(grid, 'ReturnValues');

    if (values && values !== -1) {
        returnSelectedRowValues(grid);
    }
}

/// Satır renklendirme ve aktif tablo hücresi border tasarımını değiştirebilmek için ezildi.
function CellClear(grid) {

    var topCell, topCellId
    var leftCell, leftCellId
    var activeCell, activeCellId

    topCellId = grid.GetMainElement().getAttribute("TopCell");
    leftCellId = grid.GetMainElement().getAttribute("LeftCell");
    activeCellId = grid.GetMainElement().getAttribute("ActiveCell");

    if (activeCellId != null) {

        topCell = Uyum$(topCellId);
        leftCell = Uyum$(leftCellId);
        activeCell = Uyum$(activeCellId);

        if (topCell) topCell.style.borderBottom = '';
        if (leftCell) leftCell.style.borderRight = '';

        if (activeCell != null) {

            if (activeCell.getAttribute('HasBorder')) {
                activeCell.classList.remove('active')
                activeCell.style.borderBottom = "";
                activeCell.style.borderRight = "";
                activeCell.setAttribute('HasBorder', false)
            }

        }

    }
}

/// latestCell, latestCellId doldurmak için ezildi.
/// Ekran açıldığında gride focus olmak en son aktif olan cell tekrar aktif edilecek şekilde geliştirmeler yapıldı.
/// Liste üzerinde kalvye ile rahat işlemler yapabilmek için hep gridde kalındı.
/// Satır renklendirme ve aktif tablo hücresi border tasarımı değiştirildi.
function OnCellClick(cell) {

    var ids, grid, gridName;
    var separator, colNumber, rowNumber;
    var topCellId, leftCellId, topCell, leftCell;

    if (cell == null) {

        latestCell = null;
        latestCellId = null;
        latestFocusedCell = null;

        return;

    } else {

        latestCell = cell;
        latestCellId = cell.id;
        latestFocusedCell = cell;

    }

    cell.setAttribute('HasBorder', true);

    if (cell.id.includes('|')) {

        ids = cell.id.split('|');

        separator = '|';
        gridName = ids[0];
        colNumber = parseFloat(ids[1]);
        rowNumber = parseFloat(ids[2]);

    } else if (cell.id.includes('_')) {

        ids = cell.id.split('_');

        separator = '_';
        gridName = ids[0];
        colNumber = parseFloat(ids[1]);
        rowNumber = parseFloat(ids[2]);

    }

    topCellId = gridName + separator + colNumber + separator + (rowNumber - 1);
    leftCellId = gridName + separator + (colNumber - 1) + separator + rowNumber;

    topCell = Uyum$(topCellId);
    leftCell = Uyum$(leftCellId);

    grid = eval(gridName);

    CellClear(grid);

    if (topCell) topCell.style.borderBottom = "1px dashed #a0a0a0";
    if (leftCell) leftCell.style.borderRight = "1px dashed #a0a0a0";

    cell.classList.add('active')
    cell.style.borderBottom = "1px dashed #a0a0a0";
    cell.style.borderRight = "1px dashed #a0a0a0";

    grid.GetMainElement().setAttribute("TopCell", topCellId);
    grid.GetMainElement().setAttribute("LeftCell", leftCellId);
    grid.GetMainElement().setAttribute("ActiveCell", cell.id);

}

/// Detay grid de kopyalama işlemi için eklendi.
/// Detayda cell değerini almak için web tarafında bir çalışma bulunamadı. Bu nedenle eklendi.
function OnDetailGridViewCellClick(rowIndex, columnIndex) {

    latestFocusedCell = myListDetail.GetRow(rowIndex).cells[columnIndex];

}

function BindDetailGridViewCellClickEvent() {

    if (typeof myListDetail !== 'undefined' && !isBindDetailGridViewCellClickEvent) {

        myListDetail.GetMainElement().addEventListener('click', function (event) {

            var target = event.target;

            while (target && target.tagName !== 'TD') {
                target = target.parentNode;
            }

            if (target) {

                var rowIndex = target.parentNode.rowIndex - 2;
                var columnIndex = target.cellIndex;

                OnDetailGridViewCellClick(rowIndex, columnIndex);

            }

        });

        isBindDetailGridViewCellClickEvent = true;
    }
}

/// Orjinal GlbEndCallback fonksiyonuna ek olarak focusLatestCell metodu çağrıldı.
/// Liste üzerinde klavye ile hızlı ve kolay işlem yapabilmek için ekran her aktif olduğunda son kalınan cell aktif edildi.
function GlbEndCallback(s, e) {

    try {

        if (page.onEndCallback != null) {
            page.onEndCallback(s, e);
            return;
        }

        if (window.CallbackShowDialog) {
            HideDialog();
        }

    } finally {

        if (window.unlockUyumGrids)
            window.unlockUyumGrids({cmd: 'GlbEndCallback', params: {s: s, e: e}});

        if (e.control.uniqueID === "myListPage") {

            clearTimeout(defaultFiltersTimeout);

            defaultFiltersTimeout = setTimeout(function () {
                setDefaultFilters(25);
            }, 500);

        }

        BindDetailGridViewCellClickEvent();
    }

}

/// Kısayol metodu ezildi.
/// Eski kısayollar desteklendi ve daha mantıklı yeni kısayollar eklendi.
window.onkeydown = function (event) {

    var isOverwrite;

    if (event.target.tagName.toLowerCase() === "input") return;

    if (event.key === "Escape") {

        isOverwrite = true;
        CancelEventAll(event);
        window.parent.close();

    } else if (event.altKey && event.key === "F4") {

        isOverwrite = true;
        CancelEventAll(event);
        window.parent.close();

    } else if (event.key === "F3" || event.key === "F5") {

        isOverwrite = true;
        CancelEventAll(event);
        window.parent.searchClick();

    } else if (event.shiftKey && event.key === "+") {

        isOverwrite = true;
        CancelEventAll(event);
        window.parent.copyClick();

    } else if (event.key === "+" || event.key === "F4") {

        isOverwrite = true;
        CancelEventAll(event);
        window.parent.newClick();

    } else if ((event.shiftKey && event.key === "Enter") || event.key === "F6") {

        isOverwrite = true;
        CancelEventAll(event);
        window.parent.updateClick();

    } else if (event.ctrlKey && event.key === "Enter" && pageName === 'Case') {

        isOverwrite = true;
        CancelEventAll(event);

        myListPage.GetRowValues(myListPage.focusedRowIndex, pageConfig.caseNumber.column, function (caseNumber) {

            myListPage.GetRowValues(myListPage.focusedRowIndex, pageConfig.customerId.column, function (customerId) {

                if (caseNumber)
                    window.parent.newCaseWork(caseNumber, customerId || 0);

            });

        });

    } else if (event.key === "Enter" || event.key === "F7") {

        isOverwrite = true;
        CancelEventAll(event);
        window.parent.analyzeClick();

    } else if (event.key === "-" || event.key === "Delete" || event.key === "Backspace" || event.key === "F8") {

        isOverwrite = true;
        CancelEventAll(event);
        window.parent.deleteClick();

    } else if (event.ctrlKey && event.code === "KeyC") {

        isOverwrite = true;
        CancelEventAll(event);

        if (latestFocusedCell)
            navigator.clipboard.writeText(latestFocusedCell.innerText);

    }

    if (!isOverwrite)
        generalOnKeyDown(event);
}

//endregion
