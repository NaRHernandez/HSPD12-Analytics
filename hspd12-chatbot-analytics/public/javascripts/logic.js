
let startDate;
let endDate;

let logs;

let uniqueSessions = [];
let orderedLogs = [];

let allEscalations = 0;

let isToday = false;


window.onload = function () {
    setPastWeek();
    getLogs();
}

function showDateString() {
    let today;
    let myToday = new Date();
    today = myToday;

    if(isToday) {
        endDate = today.toDateString() + " " + today.toLocaleTimeString();
    }else{
        endDate = endDate.toDateString();
    }
    let dateString = "Showing results from: " + startDate.toDateString() + " - " + endDate;
    console.log(dateString);
    document.getElementById("date-range-sub-line").classList.remove("invalid-sub-line");
    document.getElementById("date-range-sub-line").innerHTML = dateString;
}

function setPastWeek() {
    let today = new Date();
    // let dd = String(today.getDate()).padStart(2, '0');
    // let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    // let yyyy = today.getFullYear();

    let lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    // let ddLast = String(today.getDate()).padStart(2, '0');
    // let mmLast = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    // let yyyyLast = today.getFullYear();

    // today = yyyy + '-' + mm + '-' + dd;
    endDate = today;
    // lastWeek = yyyyLast + '-' + mmLast + '-' + ddLast;
    startDate = lastWeek;
    console.log(startDate + " to " + endDate);
    isToday = true;

    let dateString = "Please Wait. Calculating Results...";
    document.getElementById("date-range-sub-line").innerHTML = dateString;
}

function submitDates() {

    let dirtyStart = document.getElementById("startDate").value;
    let dirtyEnd = document.getElementById("endDate").value;

    let mm = dirtyStart.substring(0, 2);
    let dd = dirtyStart.substring(3, 5);
    let yyyy = dirtyStart.substring(6, 10);
    dirtyStart = yyyy + '-' + mm + '-' + dd;
    let submitedStartLessOne = new Date(dirtyStart);
    let submitedStart = new Date(submitedStartLessOne.getFullYear(), submitedStartLessOne.getMonth(), submitedStartLessOne.getDate() + 1);

    mm = dirtyEnd.substring(0, 2);
    dd = dirtyEnd.substring(3, 5);
    yyyy = dirtyEnd.substring(6, 10);

    dirtyEnd = yyyy + '-' + mm + '-' + dd;
    let submitedEndLessOne = new Date(dirtyEnd);
    let submitedEnd = new Date(submitedEndLessOne.getFullYear(), submitedEndLessOne.getMonth(), submitedEndLessOne.getDate() + 2);
    console.log("start: " + submitedStart + " end: " + submitedEnd);

    if ((submitedEnd - submitedStart) > 0) {
        startDate = submitedStart;
        endDate = submitedEnd;
        document.getElementById("startDate").classList.remove("invalid-form");
        document.getElementById("endDate").classList.remove("invalid-form");
        let shownEnd;
        let today;
        let myToday = new Date();
        today = myToday;

        if((endDate - today) > 0) {
            // shownEnd = today.toDateString() + " " + today.toLocaleTimeString();
            shownEnd = today;
            isToday = true;
        }else{
            isToday = false;
            shownEnd = (new Date(submitedEndLessOne.getFullYear(), submitedEndLessOne.getMonth(), submitedEndLessOne.getDate() + 1));
        }
        endDate = shownEnd;
        let dateString = "Please Wait. Calculating Results...";
        document.getElementById("date-range-sub-line").innerHTML = dateString;
        // shownEnd = new Date(submitedEndLessOne.getFullYear(), submitedEndLessOne.getMonth(), submitedEndLessOne.getDate() + 1);
        // let dateString = "Showing results from: " + startDate.toDateString() + " - " + shownEnd;
        // console.log(dateString);
        // document.getElementById("date-range-sub-line").classList.remove("invalid-sub-line");
        // document.getElementById("date-range-sub-line").innerHTML = dateString;
        getLogs();
    } else {
        document.getElementById("startDate").classList.add("invalid-form");
        document.getElementById("endDate").classList.add("invalid-form");
        console.log("invalid");
        document.getElementById("date-range-sub-line").innerHTML = "The start date must come before the end date";
        document.getElementById("date-range-sub-line").classList.add("invalid-sub-line");
    }

    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";
}

function searchIntent() {
    event.preventDefault()
    let searchTerm = document.getElementById("search-intent").value;
    let searchCount = 0;

    for (let i = 0; i < logs.length; i++) {
        if ((logs[i].textPayload).search('"TELEPHONY_WARMUP"') < 0) {
            if (logs[i].textPayload.search('intent_name: \"' + searchTerm + '\"') >= 0) {
                searchCount++;
            }
        }

    }

    document.getElementById("search-term").innerHTML = searchTerm + ": ";
    document.getElementById("search-result").innerHTML = searchCount + " hit(s)";
}

async function getLogs() {
    setTimeout(function () {
        fetch('http://localhost:3000/data/' + startDate + '/' + endDate)
        .then(res => res.json())
        .then(data => setDataToLogs(data))
        .catch(error => console.log(error));
        console.log("start get logs");
    }, 1.0 * 1000);
    

    // setTimeout(function () { 
    //     console.log("show results");
    //     if(logs[0]){
    //         setMetrics(logs) 
    //     }else{
    //         noResults();
    //     }        
    // }, 15.0 * 1000);
}

function noResults(){
    document.getElementById("date-range-sub-line").innerHTML = "No results found: Metrics not updated. Try a different date range.";
    document.getElementById("date-range-sub-line").classList.add("invalid-sub-line");
}

function setDataToLogs(data) {
    logs = data.queriedLogs;
    console.log(logs);
    if(logs[0]){
        showDateString();
        setMetrics(logs) 
    }else{
        noResults();
    }
}

function setMetrics(logArray) {
    logArray = removeDefaultTests(logArray);
    logArray = orderLogsChronologically(logArray);
    logs = logArray;
    console.log("sorted");
    console.log(logArray);
    // get a list of unique session ids
    populateSessions(logArray);
    getEscalations(logArray);

    let totalTime = 0;
    const totalSessions = uniqueSessions.length;
    // console.log("total sessions: " + totalSessions);
    let showNumberOfSessions = document.getElementById("number-of-sessions");
    showNumberOfSessions.innerHTML = totalSessions + " sessions";

    let showSessionsHandled = document.getElementById("sessions-handled");
    let sessionsHandled = (totalSessions - allEscalations)
    showSessionsHandled.innerHTML = sessionsHandled + " sessions";

    for (let i = 0; i < totalSessions; i++) {
        totalTime = totalTime + getTime(uniqueSessions[i], logArray);
    }

    let avgTime = (((totalTime / totalSessions) / 1000) / 60);
    // console.log("average time " + avgTime + " minutes");
    let showAvgTime = document.getElementById("average-session-time");
    showAvgTime.innerHTML = avgTime + " minutes";

    let totalTimeHours = (((totalTime / 1000) / 60) / 60);
    // console.log("total time " + totalTime + " minutes or " + totalTimeHours + " hours");
    let showTotalTime = document.getElementById("total-time");
    let totalTimeHours2 = ((((totalTime / 1000) / 60) / 60) - ((((totalTime / 1000) / 60) / 60) % 1)) + " hours " + (((((totalTime / 1000) / 60) / 60) % 1) * 60) + " minutes";
    showTotalTime.innerHTML = totalTimeHours2;

    getMenuSelection(logArray);
    getSubMenuSelection(logArray);
    getPhase2Metrics(logArray);
}

function removeDefaultTests(logArray) {
    let cleanLogArray = [];
    for (let i = 0; i < logArray.length; i++) {
        if(logArray[i].trace != 'c1a40fc5-71dd-7604-e2b9-80f44fb0c571'){
            cleanLogArray.push(logArray[i]);
        }
    }
    return cleanLogArray;
}

function getMenuSelection(logArray) {
    let workingArray = orderLogs(logArray);
    let option1Count = 0;
    let option2Count = 0;
    let option3Count = 0;
    let otherCount = 0;
    let fallbackCount = 0;
    let miscCount = 0;

    for (let i = 0; i < workingArray.length; i++) {
        if (workingArray[i].logs.length >= 3) {
            if (workingArray[i].logs[3].textPayload.search('intent_name: \"Main-Menu-Option-1' + '\"') >= 0) {
                option1Count = option1Count + 1;
            } else if (workingArray[i].logs[3].textPayload.search('intent_name: \"Main-Menu-Option-2' + '\"') >= 0) {
                option2Count = option2Count + 1;
            } else if (workingArray[i].logs[3].textPayload.search('intent_name: \"Main-Menu-Option-3' + '\"') >= 0) {
                option3Count = option3Count + 1;
            } else if (workingArray[i].logs[3].textPayload.search('intent_name: \"Other' + '\"') >= 0) {
                otherCount = otherCount + 1;
            } else if (workingArray[i].logs[3].textPayload.search('intent_name: \"Main-Fallback' + '\"') >= 0) {
                fallbackCount = fallbackCount + 1;
            } else {
                miscCount = miscCount + 1;
            }
        }

    }

    miscCount = workingArray.length - (option1Count + option2Count + option3Count + otherCount + fallbackCount);

    (document.getElementById("option-1")).innerHTML = option1Count + " session(s)";
    (document.getElementById("option-2")).innerHTML = option2Count + " session(s)";
    (document.getElementById("option-3")).innerHTML = option3Count + " session(s)";
    (document.getElementById("option-other")).innerHTML = otherCount + " session(s)";
    (document.getElementById("option-fallback")).innerHTML = fallbackCount + " session(s)";
    (document.getElementById("option-misc")).innerHTML = miscCount + " session(s)";
}

function getPhase2Metrics(logArray) {
    let workingArray = orderLogs(logArray);
    let sessionsHandledPhase1 = 0;
    let sessionsHandledPhase2 = 0;
    let activatePhase2 = 0;
    let confirmationSuccess = 0;
    let phase2EscalateByDesign = 0;
    let totalHandledRecount = 0;

    let escalateByDesign = ['Baltimore-no', 'Appt-selection-missing-PIV-no', 'Appt-selection-Other-or-New-PIV', 'Appt-selection-Expired-PIV-yes', 'Has-EUAID-No', 'Scheduling-Help']
    let otherEscalations = ['Other', 'Welcome-Main-Menu - no - yes', 'Main-Fallback - fallback - fallback - yes']
    let searchTerm;

    //count sessions that activate phase 2
    for (let i = 0; i < workingArray.length; i++) {
        searchTerm = 'Schedule-Appointment-Phase-2';
        let isPhase2 = false;
        for (let g = 0; g < workingArray[i].logs.length; g++) {
            if ((workingArray[i].logs[g].textPayload).search('"TELEPHONY_WARMUP"') < 0) {
                if (workingArray[i].logs[g].textPayload.search('intent_name: \"' + searchTerm + '\"') >= 0) {
                    isPhase2 = true;
                }
            }
        }
        if (isPhase2 == true){
            activatePhase2 ++;
        }
    }

    //count sessions in phase 2 escalated by design
    for (let i = 0; i < workingArray.length; i++) {
        let isPhase2 = false;
        let isEscByDesign = false;
        for (let g = 0; g < workingArray[i].logs.length; g++) {
            if ((workingArray[i].logs[g].textPayload).search('"TELEPHONY_WARMUP"') < 0) {
                if (workingArray[i].logs[g].textPayload.search('intent_name: \"' + 'Schedule-Appointment-Phase-2' + '\"') >= 0) {
                    isPhase2 = true;
                }
                for (let j = 0; j < escalateByDesign.length; j++) {
                    searchTerm = escalateByDesign[j];
                    if (workingArray[i].logs[g].textPayload.search('intent_name: \"' + searchTerm + '\"') >= 0) {
                        isEscByDesign = true
                    }
                }
            }
        }
        if ((isPhase2 == true) && (isEscByDesign == true)){
            phase2EscalateByDesign ++;
        }
    }

    //count sessions handled by phase 2

    for (let i = 0; i < workingArray.length; i++) {
        let isPhase2 = false;
        let isEsc = false;
        for (let g = 0; g < workingArray[i].logs.length; g++) {
            if ((workingArray[i].logs[g].textPayload).search('"TELEPHONY_WARMUP"') < 0) {
                if (workingArray[i].logs[g].textPayload.search('intent_name: \"' + 'Schedule-Appointment-Phase-2' + '\"') >= 0) {
                    isPhase2 = true;
                }
                for (let j = 0; j < otherEscalations.length; j++) {
                    searchTerm = otherEscalations[j];
                    if (workingArray[i].logs[g].textPayload.search('intent_name: \"' + searchTerm + '\"') >= 0) {
                        isEsc = true
                    }
                }
            }
        }
        if (isEsc == false) {
            totalHandledRecount ++;
        }
        if ((isPhase2 == true) && (isEsc == false)){
            sessionsHandledPhase2 ++;
        }
    }

    //count sessions that confirm success
    for (let i = 0; i < workingArray.length; i++) {
        let isConfimed = false;
        for (let g = 0; g < workingArray[i].logs.length; g++) {
            if ((workingArray[i].logs[g].textPayload).search('"TELEPHONY_WARMUP"') < 0) {
                if (workingArray[i].logs[g].textPayload.search('Follow the instructions in the confirmation email to self-schedule your appointment') >= 0) {
                    isConfimed = true;
                }
            }
        }
        if (isConfimed == true){
            confirmationSuccess ++;
        }
    }
    

    sessionsHandledPhase1 = (totalHandledRecount - sessionsHandledPhase2);

    (document.getElementById("sessions-handled-phase-1")).innerHTML = sessionsHandledPhase1 + " session(s)";
    (document.getElementById("sessions-handled-phase-2")).innerHTML = sessionsHandledPhase2 + " session(s)";
    (document.getElementById("activate-phase-2")).innerHTML = activatePhase2 + " session(s)";
    (document.getElementById("confirm-success")).innerHTML = confirmationSuccess + " session(s)";
    (document.getElementById("phase-2-escalate-by-design")).innerHTML = phase2EscalateByDesign + " session(s)";
}


function orderLogs(logArray) {
    // console.log("Logs length " + logArray.length);
    let matchCount = 0;
    for (let i = 0; i < logArray.length; i++) {
        let logToBeSorted = logArray[i];
        let lastMatch = '';
        if ((logToBeSorted.textPayload).search("TELEPHONY_WARMUP") < 0) {
            if (orderedLogs.length > 0) {
                for (let j = 0; j < orderedLogs.length; j++) {
                    if (orderedLogs[j].trace == logToBeSorted.trace) {
                        //add log to this one
                        orderedLogs[j].logs.push(logToBeSorted);
                        lastMatch = logToBeSorted.trace;
                    }
                }
                if (lastMatch != logToBeSorted.trace) {
                    let logObject = { 'trace': logToBeSorted.trace, 'logs': [] };
                    logObject.logs.push(logToBeSorted);
                    orderedLogs.push(logObject);
                    matchCount++;
                }
            } else if (orderedLogs.length == 0) {
                let logObject = { 'trace': logToBeSorted.trace, 'logs': [] };
                logObject.logs.push(logToBeSorted);
                orderedLogs.push(logObject);
                logIsSorted = true;
            }
        }

    }
    // console.log("new count " + matchCount);
    return orderedLogs;
}

function orderLogsChronologically(logArray) {
    let chronArray = logArray.sort((a, b) =>
        (new Date(a.timestampRaw)) - (new Date(b.timestampRaw))
    );
    return chronArray;
}

function getTime(sessionNum, logArray) {

    let logsInSession = populateLogsInSession(sessionNum, logArray);

    let lengthOfSession = ((new Date(logsInSession[(logsInSession.length - 1)].timestampRaw)) - (new Date(logsInSession[0].timestampRaw)));
    return lengthOfSession;
}

function populateLogsInSession(sessionNum, logArray) {
    let sessionLogArr = [];
    for (let i = 0; i < logArray.length; i++) {
        if (logs[i].trace == sessionNum) {
            sessionLogArr.push(logs[i]);
        }
    }

    return sessionLogArr;
}

function populateSessions(logArray) {
    for (let i = 0; i < logArray.length; i++) {
        let sessionID = logArray[i].trace
        // console.log("session id: " + sessionID)
        if (uniqueSessions.indexOf(sessionID) < 0) {
            if ((logArray[i].textPayload).search("TELEPHONY_WARMUP") < 0) {
                uniqueSessions.push(sessionID);
            }
        }
    }
}

function getEscalations(logArray) {
    let otherEscalationCount = 0;
    let noYesEscalationCount = 0;
    let fallbackEscalationCount = 0;
    //go through logs array
    //if contains escalation intent add to new array. do for each escalation type
    for (let i = 0; i < logArray.length; i++) {
        if ((logArray[i].textPayload).search("TELEPHONY_WARMUP") < 0) {
            if (((logArray[i]).textPayload).includes('intent_name: \"Other' + '\"') == true) {
                otherEscalationCount = otherEscalationCount + 1;
            } else if (((logArray[i]).textPayload).includes('intent_name: \"Welcome-Main-Menu - no - yes' + '\"') == true) {
                noYesEscalationCount = noYesEscalationCount + 1;
            } else if (((logArray[i]).textPayload).includes('intent_name: \"Main-Fallback - fallback - fallback - yes' + '\"') == true) {
                fallbackEscalationCount = fallbackEscalationCount + 1;
            }
        }

    }

    let showEscalations = document.getElementById("escalated-sessions");
    let totalEscalationCount = otherEscalationCount + noYesEscalationCount + fallbackEscalationCount;
    showEscalations.innerHTML = totalEscalationCount + " session(s)";

    allEscalations = totalEscalationCount;
}

function getSubMenuSelection(logArray) {
    let menu11 = 0;
    let menu111 = 0;
    let menu112 = 0;
    let menu113 = 0;

    let menu12 = 0;
    let menu121 = 0;
    let menu122 = 0;
    let menu123 = 0;

    let menu13 = 0;
    let menu131 = 0;
    let menu132 = 0;
    let menu133 = 0;

    let menu14 = 0;
    let menu141 = 0;
    let menu142 = 0;
    let menu143 = 0;

    let menu15 = 0;
    let menu151 = 0;
    let menu152 = 0;
    let menu153 = 0;

    let menu1other = 0;

    let menu21 = 0;
    let menu211 = 0;
    let menu212 = 0;
    let menu213 = 0;

    let menu22 = 0;
    let menu221 = 0;
    let menu222 = 0;
    let menu223 = 0;

    let menu23 = 0;
    let menu231 = 0;
    let menu232 = 0;
    let menu233 = 0;

    let menu24 = 0;
    let menu241 = 0;
    let menu242 = 0;
    let menu243 = 0;

    let menu2other = 0;

    let menu31 = 0;
    let menu311 = 0;
    let menu312 = 0;
    let menu313 = 0;

    let menu32 = 0;
    let menu321 = 0;
    let menu322 = 0;
    let menu323 = 0;

    let menu3other = 0;

    for (let i = 0; i < logArray.length; i++) {
        //general information > hours of operation
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-1-Hours-Catch' + '\"') >= 0) {
            menu11++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-1-1-General-Hours' + '\"') >= 0) {
            menu111++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-1-2-Exception' + '\"') >= 0) {
            menu112++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-1-3-Other' + '\"') >= 0) {
            menu113++;
        }
        //general information > visiting office
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-2-Visiting-Office-Catch' + '\"') >= 0) {
            menu12++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-2-1-General-Visit' + '\"') >= 0) {
            menu121++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-2-2-Parking' + '\"') >= 0) {
            menu122++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-2-3-Other' + '\"') >= 0) {
            menu123++;
        }
        //general information > locations and directions
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-3-Locations-Catch' + '\"') >= 0) {
            menu13++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-3-1-General-Locations' + '\"') >= 0) {
            menu131++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-3-2-Proximity' + '\"') >= 0) {
            menu132++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-3-3-Other' + '\"') >= 0) {
            menu133++;
        }
        //general information > contact info
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-4-Contact-Info-Catch' + '\"') >= 0) {
            menu14++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-4-1-General-Contact' + '\"') >= 0) {
            menu141++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-4-2-Accommodations' + '\"') >= 0) {
            menu142++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-4-3-Other' + '\"') >= 0) {
            menu143++;
        }
        //general information > covid-19
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-5-Covid19-Catch' + '\"') >= 0) {
            menu15++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-5-1-General-Covid' + '\"') >= 0) {
            menu151++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-5-2-Covid-Procedures' + '\"') >= 0) {
            menu152++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-5-3-Other-Covid' + '\"') >= 0) {
            menu153++;
        }
        //general information > other
        if (logArray[i].textPayload.search('intent_name: \"Option-1-Submenu-Other' + '\"') >= 0) {
            menu1other++;
        }
        //=============================================================
        //piv card > pin reset
        if (logArray[i].textPayload.search('intent_name: \"Option-2-Submenu-1-Pin-Reset' + '\"') >= 0) {
            menu21++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-2-Submenu-1-1-General-PIN-Reset' + '\"') >= 0) {
            menu211++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-2-Submenu-1-2-Pin-Reset-Error' + '\"') >= 0) {
            menu212++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-2-Submenu-1-3-Other-PIN-Reset' + '\"') >= 0) {
            menu213++;
        }
        //piv card > piv certificate
        if (logArray[i].textPayload.search('intent_name: \"Option-2-Submenu-2-PIV-Certificate-Catch' + '\"') >= 0) {
            menu22++;
        }
        if (logArray[i].textPayload.search('intent_name: \"option-2-subemenu-2-1-general-certificate' + '\"') >= 0) {
            menu221++;
        }
        if (logArray[i].textPayload.search('intent_name: \"option-2-submenu-2-2-reset-certificate' + '\"') >= 0) {
            menu222++;
        }
        if (logArray[i].textPayload.search('intent_name: \"option-2-submenu-2-3-other-certificate' + '\"') >= 0) {
            menu223++;
        }
        //piv card > piv status
        if (logArray[i].textPayload.search('intent_name: \"Option-2-Submenu-3-PIV-Status-Catch' + '\"') >= 0) {
            menu23++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-2-Submenu-3-1-General-PIV-Status' + '\"') >= 0) {
            menu231++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-2-Submenu-3-2-PIV-Status' + '\"') >= 0) {
            menu232++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-2-Submenu-3-3-Other-PIV-Status' + '\"') >= 0) {
            menu233++;
        }
        //piv card > missing or expired piv
        if (logArray[i].textPayload.search('intent_name: \"Option-2-Submenu-4-Missing-PIV-Catch' + '\"') >= 0) {
            menu24++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-2-Submenu-4-1-Missing' + '\"') >= 0) {
            menu241++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-2-Submenu-4-2-Expired-PIV' + '\"') >= 0) {
            menu242++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-2-Submenu-4-3-Other-Missing-Expired' + '\"') >= 0) {
            menu243++;
        }
        //piv card > other
        if (logArray[i].textPayload.search('intent_name: \"Option-2-Submenu-Other' + '\"') >= 0) {
            menu2other++;
        }
        //===================================================
        //badging appointment > existing appointment
        if (logArray[i].textPayload.search('intent_name: \"Opiton-3-Submenu-1-Existing-Appointment-Catch' + '\"') >= 0) {
            menu31++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-3-Submenu-1-General-Existing-Appointment' + '\"') >= 0) {
            menu311++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-3-Submenu-1-Change-Existing-Appointment' + '\"') >= 0) {
            menu312++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-3-Submenu-1-Other-Existing-Appointment' + '\"') >= 0) {
            menu313++;
        }
        //badging appointment > scheduling an appointment
        if (logArray[i].textPayload.search('intent_name: \"Option-3-Submenu-2-Schedule-Appointment-Catch' + '\"') >= 0) {
            menu32++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-3-Submenu-2-1-General-Schedule' + '\"') >= 0) {
            menu321++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-3-Submenu-2-2-Scheduler' + '\"') >= 0) {
            menu322++;
        }
        if (logArray[i].textPayload.search('intent_name: \"Option-3-Submenu-2-3-Other-Schedule' + '\"') >= 0) {
            menu323++;
        }
        //badging appointment > other
        if (logArray[i].textPayload.search('intent_name: \"Option-3-Submenu-Other' + '\"') >= 0) {
            menu3other++;
        }
    }

    (document.getElementById("menu-1-1")).innerHTML = menu11 + " hit(s)";
    (document.getElementById("menu-1-1-1")).innerHTML = menu111 + " hit(s)";
    (document.getElementById("menu-1-1-2")).innerHTML = menu112 + " hit(s)";
    (document.getElementById("menu-1-1-3")).innerHTML = menu113 + " hit(s)";
    (document.getElementById("menu-1-2")).innerHTML = menu12 + " hit(s)";
    (document.getElementById("menu-1-2-1")).innerHTML = menu121 + " hit(s)";
    (document.getElementById("menu-1-2-2")).innerHTML = menu122 + " hit(s)";
    (document.getElementById("menu-1-2-3")).innerHTML = menu123 + " hit(s)";
    (document.getElementById("menu-1-3")).innerHTML = menu13 + " hit(s)";
    (document.getElementById("menu-1-3-1")).innerHTML = menu131 + " hit(s)";
    (document.getElementById("menu-1-3-2")).innerHTML = menu132 + " hit(s)";
    (document.getElementById("menu-1-3-3")).innerHTML = menu133 + " hit(s)";
    (document.getElementById("menu-1-4")).innerHTML = menu14 + " hit(s)";
    (document.getElementById("menu-1-4-1")).innerHTML = menu141 + " hit(s)";
    (document.getElementById("menu-1-4-2")).innerHTML = menu142 + " hit(s)";
    (document.getElementById("menu-1-4-3")).innerHTML = menu143 + " hit(s)";
    (document.getElementById("menu-1-5")).innerHTML = menu15 + " hit(s)";
    (document.getElementById("menu-1-5-1")).innerHTML = menu151 + " hit(s)";
    (document.getElementById("menu-1-5-2")).innerHTML = menu152 + " hit(s)";
    (document.getElementById("menu-1-5-3")).innerHTML = menu153 + " hit(s)";
    (document.getElementById("menu-1-other")).innerHTML = menu1other + " hit(s)";

    (document.getElementById("menu-2-1")).innerHTML = menu21 + " hit(s)";
    (document.getElementById("menu-2-1-1")).innerHTML = menu211 + " hit(s)";
    (document.getElementById("menu-2-1-2")).innerHTML = menu212 + " hit(s)";
    (document.getElementById("menu-2-1-3")).innerHTML = menu213 + " hit(s)";
    (document.getElementById("menu-2-2")).innerHTML = menu22 + " hit(s)";
    (document.getElementById("menu-2-2-1")).innerHTML = menu221 + " hit(s)";
    (document.getElementById("menu-2-2-2")).innerHTML = menu222 + " hit(s)";
    (document.getElementById("menu-2-2-3")).innerHTML = menu223 + " hit(s)";
    (document.getElementById("menu-2-3")).innerHTML = menu23 + " hit(s)";
    (document.getElementById("menu-2-3-1")).innerHTML = menu231 + " hit(s)";
    (document.getElementById("menu-2-3-2")).innerHTML = menu232 + " hit(s)";
    (document.getElementById("menu-2-3-3")).innerHTML = menu233 + " hit(s)";
    (document.getElementById("menu-2-4")).innerHTML = menu24 + " hit(s)";
    (document.getElementById("menu-2-4-1")).innerHTML = menu241 + " hit(s)";
    (document.getElementById("menu-2-4-2")).innerHTML = menu242 + " hit(s)";
    (document.getElementById("menu-2-4-3")).innerHTML = menu243 + " hit(s)";
    (document.getElementById("menu-2-other")).innerHTML = menu2other + " hit(s)";

    (document.getElementById("menu-3-1")).innerHTML = menu31 + " hit(s)";
    (document.getElementById("menu-3-1-1")).innerHTML = menu311 + " hit(s)";
    (document.getElementById("menu-3-1-2")).innerHTML = menu312 + " hit(s)";
    (document.getElementById("menu-3-1-3")).innerHTML = menu313 + " hit(s)";
    (document.getElementById("menu-3-2")).innerHTML = menu32 + " hit(s)";
    (document.getElementById("menu-3-2-1")).innerHTML = menu321 + " hit(s)";
    (document.getElementById("menu-3-2-2")).innerHTML = menu322 + " hit(s)";
    (document.getElementById("menu-3-2-3")).innerHTML = menu323 + " hit(s)";
    (document.getElementById("menu-3-other")).innerHTML = menu3other + " hit(s)";
}