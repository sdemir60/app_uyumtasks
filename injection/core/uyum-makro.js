/*
Tüm dosyalara eklendiği için orjinal kodların tümü var.
Yalnızca SetMakro metodunda eklemeler vardır.
*/

var glbCurrentCommandLine = 0;
var glbExcelMemory = null;
var glbCodeScripts = null;
var glbMakroSaving = false;
var glbMakroRun = false;
var glbTestScenarioStartNumber = 0;

function ResultTestSenarioEnd(result) {
    document.title = "Senaryo tamamlanmıştır................................................................................................";
}

function TestScenarioError(msg) {
    glbCurrentCommandLine = 0;
    glbMakroRun = false;
    msg = encodeURIComponent(msg);
    AjaxStandartCall("TestSenarioJavascriptError", glbTestScenarioStartNumber, msg, ResultTestSenarioEnd);
    glbTestScenarioStartNumber = 0;
}

function MakroEnd() {
    glbCurrentCommandLine = 0;
    glbMakroRun = false;

    if (glbTestScenarioStartNumber != 0) {
        AjaxStandartCall("TestSenarioEnd", glbTestScenarioStartNumber, 'SenarioEnd', ResultTestSenarioEnd);
        glbTestScenarioStartNumber = 0;
    } else {
        alert('makro tamamlandı...');
    }
}

var oldstr = '';

function Makropush(str) {
    if (oldstr != str) {
        Makro.push(str);
        document.title = "Save:" + str;
    }
    oldstr = str;
}

function MakroAddEnd() {
    var makroPop = Makro.pop();
    Makro.push(makroPop + 'MakroWait();');
}

function MakroFirstLoad(strMakro) {
    var strMakros = strMakro.split(String.fromCharCode(10));
    Makro = Makro.concat(strMakros);
    Makro.pop();
}

function SetMakro(strMakro) {

    //region UyumTASKS >> Makro

    var makro = "";
    var config = window.config;
    var page, caseSubject, type, defaultValues;

    page = getParameterByName("Page");
    caseSubject = getParameterByName("CaseSubject");
    type = getParameterByName("Type");

    if (page && type) {

        defaultValues = config.get(page).defaultValues || {};

        defaultValues.forEach(function (defaultValue) {

            if (defaultValue.name === type) {

                if (caseSubject)
                    defaultValue.values.CaseSubjectName = caseSubject;

                for (const property in defaultValue.values) {
                    makro += " var ctrlDef = GetControl('" + property + "') ; if ( ctrlDef!= null && ctrlDef.GetEnabled() == true) { SetControlValueFire('" + property + "', '" + defaultValue.values[property] + "'); } " + "\r\n";
                }

                makro += "DefaultFormValuEnd()";

            }

        });

        strMakro = makro;

    }

    //endregion

    glbCurrentCommandLine = 0;
    glbCodeScripts = new Array();
    var strMakros = strMakro.split(String.fromCharCode(10));
    glbCodeScripts = glbCodeScripts.concat(strMakros);

    return glbCodeScripts.join(String.fromCharCode(10));
}

function CopyClipboard(excelValue) {
    if (excelValue == null)
        return;
    var excelValues = excelValue.split(String.fromCharCode(10));

    glbExcelMemory = new Array(excelValues.length)

    for (i = 0; i < excelValues.length; i++) {
        var itemExcelValues = excelValues[i].split(String.fromCharCode(9));
        glbExcelMemory[i] = new Array(itemExcelValues.length);

        for (j = 0; j < itemExcelValues.length; j++) {
            glbExcelMemory[i][j] = itemExcelValues[j];
        }
    }
}

function BeginMakro(win, display) {
    glbCurrentCommandLine++;

    if (glbCodeScripts.length + 1 == glbCurrentCommandLine) {
        glbCurrentCommandLine = 0;
        glbMakroRun = false;

        if (display) {
            win.alert('Makro tamamlandı');
        }
        return;
    }

    var cmdName = glbCodeScripts[glbCurrentCommandLine - 1];

    if (cmdName == "MakroEnd") {
        MakroEnd();
    } else {
        win.CommandRun(cmdName);
    }
}

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}