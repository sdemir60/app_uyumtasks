window.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        window.close();
        event.preventDefault();

    } else if (event.altKey && event.key === "F4") {

        window.close();
        event.preventDefault();

    } else if (event.ctrlKey && event.key === "Enter") {

        window.ipcRenderer.send('on-main', {
            process: 'new-casework',
            caseNumber: GetControlValue('CaseNumber'),
            customerId: GetControlValue('CustomerId'),
            parent: 'case'
        })
        event.preventDefault();

    }

});