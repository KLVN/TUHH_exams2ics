(function() {
    // Add download button
    $("#main").append("<button id='dl'>Download .ics file</button>");
    
    // Add CSS for download button
    $("#dl").css({
        'position': 'fixed',
        'width': '100%',
        'bottom': '0px',
        'left': '0',
        'padding': '10px 50px',
        'background': '#d00a0a',
        'border': '0',
        'color': '#FFF',
        'font-size': '23px',
        'font-family': 'Arial',
        'line-height': '30px',
        'cursor': 'pointer',
        'z-index': '10'
    });
   
    // Change background-color if hovering over items
    $('head').append('<style>table.prtermine tr:hover td {background-color : #2DC6D6;}</style>')

    // Variables for ICS - using https://github.com/nwcell/ics.js/
    var SEPARATOR = (navigator.appVersion.indexOf('Win') !== -1) ? '\r\n' : '\n';
    var calendarEvents = [];
    var calendarStart = [  
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:TUHH Exams',
    'CALSCALE:GREGORIAN'
    ].join(SEPARATOR);
    var calendarEnd = SEPARATOR + 'END:VCALENDAR';

    // Add checkboxes to each exam
    $('.prtermine').find('tr').each(function(){
        var trow = $(this);
        if(trow.find('td').length > 1){
            trow.append('<td><input type="checkbox" name="cb"/></td>');
        }
    });

    // Change text of download button, depending on selected exams
    $('input[name="cb"]').click(function(){
        $("#dl").text("Download .ics file" + " (" + $("input[name='cb']:checked").length + " selected)");
    });

    // Iterate over all checked checkboxes and add them as an event
    function getCheckboxes() {
        $('.prtermine').find('tr').has('input[type=checkbox]:checked').each(function(){
            var place = $(this).find("td").eq(2).text();
            if(place == "nach Vereinbarung") return;
            var name = $(this).find("td").eq(0).text();
            var date = $(this).find("td").eq(1).text();
            var time = $(this).find("td").eq(3).text();
            var fdate = convertTime(date, time);
            addEvent(name, fdate, place);
        });
    };

    // Converting time to ICS formatting
    function convertTime(date, time) {
        var arrD = date.split(".");
        var arrT = time.split(":");
        if (time == "\u00a0" || time == "") {
            var fullDate = arrD[2] + arrD[1] + arrD[0];
            return fullDate;
        } else {
            var fullDate = arrD[2] + arrD[1] + arrD[0] + "T" + arrT[0] + arrT[1] + "00";
            return fullDate;
        }
    }

    // Add events to array
    function addEvent(name, date, place) {
        var calendarEvent = [
            'BEGIN:VEVENT',
            'DTSTART;TZID=Europe/Berlin:' + date,
            'DTEND;TZID=Europe/Berlin:' + date,
            'UID:' + calendarEvents.length + "@" + "TUHHExams",
            'DESCRIPTION:Event added with https://github.com/KLVN/TUHH_exams2ics',
            'LOCATION:' + place,
            'SUMMARY:' + name,
            'END:VEVENT'
        ];
        calendarEvent = calendarEvent.join(SEPARATOR);
        calendarEvents.push(calendarEvent);
        return calendarEvent;
    }

    // Download .ics file
    $("#dl").click(function() {
        getCheckboxes();
        var calendarEnd = SEPARATOR + 'END:VCALENDAR';
        var calendar = calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;
        
        // using https://stackoverflow.com/a/30832210/
        filename = "TUHH_Exams.ics"
        var file = new Blob([calendar], {type: "text/calendar"});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else {
            var a = document.createElement("a"),
                    url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);  
            }, 0); 
        }
        calendarEvents = [];
    });
})();