/* Helper for commonly used math functions */

Math.trunc = Math.trunc || function(x) {
	return x < 0 ? Math.ceil(x) : Math.floor(x);
}

getUserSiteTimes = function(eventOn, eventOff) {
	
	var siteStatusClass = 'off-site';
	var timeRange = '';
	var timeOnSite = 'n/a';
	
	if (!_.isEmpty( eventOn )) {
	
		//Get their check-in time
		var timeOn = Date.create(eventOn[0].time);
		var timeOnDisplay = Date.create(eventOn[0].time).format("{h}:{mm} {tt}");
		
		if (!_.isEmpty( eventOff )) {
							
			//Get their check-out time
			var timeOff = Date.create(eventOff[0].time);
			var timeOffDisplay = Date.create(eventOff[0].time).format("{h}:{mm} {tt}");
			siteStatusClass = "was-on-site";
				
		} else {
			
			//Get the time they have been on site thus far
			siteStatusClass = "on-site";
			timeOffDisplay = 'now';
			var timeOff = Date.create();

		}
		
		//Format to return
		timeOnSite = getTimeRange(timeOn,timeOff);
		timeRange = timeOnDisplay + ' - ' + timeOffDisplay;
		
	}
	
	var time = { timeRange, timeOnSite, siteStatusClass };
	return time;
	
};

//Format time on site nicely
getTimeRange = function(timeOn, timeOff) {
	var minutesOnSite = Date.create(timeOff).minutesSince(timeOn);
	if (minutesOnSite >= 60) {
		var hours = Math.trunc(minutesOnSite/60);
		var minutes = minutesOnSite % 60;
	  timeOnSiteNew = hours + 'h ' + minutes + 'm';
	} else {
	  timeOnSiteNew = minutesOnSite + 'm';
	}			
	return timeOnSiteNew;
}

//Raw Time on Site (in minutes)
getTimeRangeRaw = function(timeOn, timeOff) {
	var minutesOnSite = Date.create(timeOff).minutesSince(timeOn);
	return minutesOnSite;
}

//Format time for report
getHours = function(roundedMinutes) {
	if (roundedMinutes >= 60) {
		var hours = Math.floor(roundedMinutes/60);
		var minutes = roundedMinutes % 60;
		return hours + ':' + minutes;
	} else {
		var minutes = roundedMinutes;
		return '0:' + minutes;
	}	
}


isSameDay = function(date1, date2) {
	shortDay1 = Date.create(date1).short();
	shortDay2 = Date.create(date2).short();
	
	if (shortDay1 === shortDay2) {
		return true;
	} else {
		return false;
	}
	
}