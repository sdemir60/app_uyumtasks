//region CaseWork >> Variable

var config, webERP, workHours;
var processType;
var startDateControl, startTimeControl;
var timeSpanCalcDayControl, timeSpanCalcHourControl, timeSpanCalcMinuteControl;
var noteControl;

//endregion

//region CaseWork >> Initialize

function init() {

    config = window.config;
    webERP = config.get("webERP");
    workHours = config.get("workHours");

    processType = GetControlValue('hdnProcessType');

    startDateControl = GetControl("StartDate");
    startTimeControl = GetControl("StartTime");
    timeSpanCalcDayControl = GetControl("CaseWorkTimeSpanCalcDay");
    timeSpanCalcHourControl = GetControl("CaseWorkTimeSpanCalcHour");
    timeSpanCalcMinuteControl = GetControl("CaseWorkTimeSpanCalcMinute");
    noteControl = GetControl("Note");

    if (processType === "1" || processType === "4") {

        if (startDateControl && startTimeControl && noteControl) {

            setTimeout(function () {

                setCaseWorkDateTime();

                noteControl.Focus();

                startDateControl.ValueChanged.AddHandler(startDateChange);
                startTimeControl.ValueChanged.AddHandler(startTimeChange);

            }, 250);

        } else {

            setTimeout(function () {
                init();
            }, 250);

        }

    }
}

//endregion

//region CaseWork >> Event

window.addEventListener("load", event => {

    init();

});

window.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        window.close();
        event.preventDefault();

    } else if (event.altKey && event.key === "F4") {

        window.close();
        event.preventDefault();

    } else if (event.ctrlKey && event.key === "Enter") {

        btnSaveClose.DoClick();
        event.preventDefault();

    }

});

//endregion

//region CaseWork >> Function

function startDateChange(control, event) {

    setCaseWorkDateTime();

}

function startTimeChange(control, event) {
}

function setCaseWorkDateTime() {

    var nowDate, nowDateTime;
    var workStart, breakStart, breakEnd;
    var lastCaseWork, lastWorkStart, lastWorkEnd;
    var startDateArray, startDate, startDateTime, startDateDay, startDateMonth, startDateYear;
    var startTimeArray, startTime, startTimeHour, startTimeMinute;
    var timeSpanArray, timeSpan, timeSpanDay, timeSpanHour, timeSpanMinute, timeSpanSum;
    var diffMillisecond, diffDay, diffHour, diffMinute;

    AjaxStandartCall("GetLastCaseWorkDateTime", '', '', function (data) {

        if (data) {

            nowDate = new Date(startDateControl.GetValue());
            nowDateTime = new Date(startDateControl.GetValue());
            lastCaseWork = getLastCaseWorkDateTime(data).split('|');

            startDateArray = lastCaseWork[0].split('.');
            startDateDay = parseInt(startDateArray[0]);
            startDateMonth = parseInt(startDateArray[1]) - 1;
            startDateYear = parseInt(startDateArray[2]);

            startTime = lastCaseWork[1];
            startTimeArray = startTime.split(':');
            startTimeHour = parseInt(startTimeArray[0]);
            startTimeMinute = parseInt(startTimeArray[1]);

            timeSpan = lastCaseWork[2];
            timeSpanArray = timeSpan.split(':');
            timeSpanDay = parseInt(timeSpanArray[0]);
            timeSpanHour = parseInt(timeSpanArray[1]);
            timeSpanMinute = parseInt(timeSpanArray[2]);
            timeSpanSum = (timeSpanDay * workHours.workTime * 60) + (timeSpanHour * 60) + (timeSpanMinute);

            nowDate.setHours(0, 0, 0, 0);
            nowDateTime.setHours((new Date()).getHours(), (new Date()).getMinutes(), 0, 0);

            startDate = new Date(startDateYear, startDateMonth, startDateDay, 0, 0, 0, 0)
            startDateTime = new Date(startDateYear, startDateMonth, startDateDay, startTimeHour, startTimeMinute, 0, 0);

            if (startDate.toDateString() === nowDate.toDateString()) {

                lastWorkStart = new Date(startDateYear, startDateMonth, startDateDay, startTimeHour, startTimeMinute, 0, 0);
                lastWorkEnd = new Date(startDateYear, startDateMonth, startDateDay, startTimeHour, startTimeMinute + timeSpanSum, 0, 0);

                breakStart = new Date(startDateYear, startDateMonth, startDateDay, workHours.breakStart, 0, 0, 0);
                breakEnd = new Date(startDateYear, startDateMonth, startDateDay, workHours.breakStart + workHours.breakTime, 0, 0, 0);

                if (lastWorkStart < breakStart && breakStart <= lastWorkEnd) {

                    startDateTime.setMinutes(startDateTime.getMinutes() + timeSpanSum + (workHours.breakTime * 60));

                } else if (breakStart <= lastWorkStart && lastWorkEnd <= breakEnd && breakEnd <= nowDateTime) {

                    startDateTime = new Date(breakEnd);

                } else {

                    startDateTime.setMinutes(startDateTime.getMinutes() + timeSpanSum);

                }

                if (lastWorkEnd < breakStart && breakStart <= nowDateTime && nowDateTime <= breakEnd) {

                    nowDateTime = new Date(breakStart);

                } else if (lastWorkEnd < breakStart && breakEnd < nowDateTime) {

                    nowDateTime.setMinutes(nowDateTime.getMinutes() - (workHours.breakTime * 60));

                }

            } else {

                workStart = new Date(nowDateTime.getFullYear(), nowDateTime.getMonth(), nowDateTime.getDate(), workHours.workStart, 0, 0, 0);

                breakStart = new Date(nowDateTime.getFullYear(), nowDateTime.getMonth(), nowDateTime.getDate(), workHours.breakStart, 0, 0, 0);
                breakEnd = new Date(nowDateTime.getFullYear(), nowDateTime.getMonth(), nowDateTime.getDate(), workHours.breakStart + workHours.breakTime, 0, 0, 0);

                if (workStart <= nowDateTime) {

                    startDateTime = new Date(workStart)

                } else {

                    startDateTime = new Date(nowDateTime)

                }

                if (breakStart <= nowDateTime && nowDateTime <= breakEnd) {

                    nowDateTime = new Date(breakStart);

                } else if (breakEnd <= nowDateTime) {

                    nowDateTime.setMinutes(nowDateTime.getMinutes() - (workHours.breakTime * 60));

                }
            }

            diffMillisecond = (nowDateTime - startDateTime);

            if (diffMillisecond >= 0) {

                diffDay = Math.floor(diffMillisecond / 27000000);
                diffHour = Math.floor((diffMillisecond % 27000000) / 3600000);
                diffMinute = Math.round(((diffMillisecond % 27000000) % 3600000) / 60000);

            } else {

                diffDay = 0;
                diffHour = 0;
                diffMinute = 0;

            }

            startTimeControl.SetValue(String("00" + startDateTime.getHours()).slice(-2) + ':' + String("00" + startDateTime.getMinutes()).slice(-2));

            timeSpanCalcDayControl.SetValue(diffDay);
            timeSpanCalcHourControl.SetValue(diffHour);
            timeSpanCalcMinuteControl.SetValue(diffMinute);
        }

    });
}

function getLastCaseWorkDateTime(lastCaseWorkData) {

    var isUseOtherERP, nowDate;

    var otherERPLastCaseWorkData, otherERPLastCaseWorkArray, otherERPLastStartDate, otherERPLastStartDateTime;
    var otherERPStartDateArray, otherERPStartDateDay, otherERPStartDateMonth, otherERPStartDateYear;
    var otherERPStartTimeArray, otherERPStartTimeHour, otherERPStartTimeMinute;

    var lastCaseWorkArray, lastStartDate, lastStartDateTime;
    var startDateArray, startDateDay, startDateMonth, startDateYear;
    var startTimeArray, startTimeHour, startTimeMinute;

    if (webERP.listen) {

        otherERPLastCaseWorkData = window.ipcRenderer.sendSync('on-main', {process: 'get-lastcasework'});

        if (otherERPLastCaseWorkData) {

            nowDate = (new Date()).toDateString();


            otherERPLastCaseWorkArray = otherERPLastCaseWorkData.split('|');

            otherERPStartDateArray = otherERPLastCaseWorkArray[0].split('.');
            otherERPStartDateDay = parseInt(otherERPStartDateArray[0]);
            otherERPStartDateMonth = parseInt(otherERPStartDateArray[1]) - 1;
            otherERPStartDateYear = parseInt(otherERPStartDateArray[2]);

            otherERPStartTimeArray = otherERPLastCaseWorkArray[1].split(':');
            otherERPStartTimeHour = parseInt(otherERPStartTimeArray[0]);
            otherERPStartTimeMinute = parseInt(otherERPStartTimeArray[1]);

            otherERPLastStartDate = new Date(otherERPStartDateYear, otherERPStartDateMonth, otherERPStartDateDay, 0, 0, 0, 0).toDateString();
            otherERPLastStartDateTime = new Date(otherERPStartDateYear, otherERPStartDateMonth, otherERPStartDateDay, otherERPStartTimeHour, otherERPStartTimeMinute, 0, 0);


            lastCaseWorkArray = lastCaseWorkData.split('|');

            startDateArray = lastCaseWorkArray[0].split('.');
            startDateDay = parseInt(startDateArray[0]);
            startDateMonth = parseInt(startDateArray[1]) - 1;
            startDateYear = parseInt(startDateArray[2]);

            startTimeArray = lastCaseWorkArray[1].split(':');
            startTimeHour = parseInt(startTimeArray[0]);
            startTimeMinute = parseInt(startTimeArray[1]);

            lastStartDate = new Date(startDateYear, startDateMonth, startDateDay, 0, 0, 0, 0).toDateString();
            lastStartDateTime = new Date(startDateYear, startDateMonth, startDateDay, startTimeHour, startTimeMinute, 0, 0);

            isUseOtherERP = true;
            isUseOtherERP = isUseOtherERP && nowDate === otherERPLastStartDate && otherERPLastStartDateTime > lastStartDateTime;
            isUseOtherERP = isUseOtherERP || (nowDate === otherERPLastStartDate && nowDate !== lastStartDate)


            if (isUseOtherERP)
                return otherERPLastCaseWorkData


        }

    }

    return lastCaseWorkData;
}

//endregion