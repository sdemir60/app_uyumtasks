//region GeneralCard >> Variable

var latestCell, latestCellId;

//endregion

//region GeneralCard >> Function ( Overwrite | webERP )

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

        return;

    } else {

        latestCell = cell;
        latestCellId = cell.id;

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

//endregion
