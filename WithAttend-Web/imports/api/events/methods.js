import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { check } from 'meteor/check';
import phone from 'phone';

import { Events } from './events.js';
import { Users } from '../users/users.js';
import { Sites } from '../sites/sites.js';
import { JobCodes } from '../jobCodes/jobCodes.js';

Meteor.methods({
	'events.checkInDevice'(doc) {
		// Make sure the user is logged in before inserting an event
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
		
		//Build doc to test
		console.log(doc);
		doc.eventType = 1;
		doc.time = Date.create(doc.time+" GMT-0700 (PDT)");
		doc.createdAt = Date.create(doc.time);
				
		//Check the data
		check(doc, Events.simpleSchema());
    
    //Submit the data
    Events.insert(doc, function(error,results){
	    if(results) {
		  	console.log("device check in success");
		  } else {
			   throw new Meteor.Error("Device check in failed");
			}
    });
	},
	'events.checkOutDevice'(doc) {
		// Make sure the user is logged in before inserting an event
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
		
		//Build doc to test
		console.log(doc);
		doc.eventType = 0;
		doc.time = Date.create(doc.time+" GMT-0700 (PDT)");
		doc.createdAt = Date.create(doc.time);
		
		//Find check-in ID
		var start = Date.create().beginningOfDay();
		var end = Date.create();
		var checkIn = Events.findOne({ userId: doc.userId, eventType: 1, beaconMajor: doc.beaconMajor, companyId: doc.companyId, time: {$gte: start, $lt: end}});
		
		if (checkIn) {
			doc.relatedId = checkIn._id;
		} else {
			throw new Meteor.Error("Can't find related check-in");
		}
		
				
		//Check the data
		check(doc, Events.simpleSchema());
    
    //Submit the data
    Events.insert(doc, function(error,results){
	    if(results) {
		  	console.log("device check out success");
		  } else {
			   throw new Meteor.Error("Device check out failed");
			}
    });
	},
	'events.checkInNumber'(doc, phoneNumber) {
		// Make sure the user is logged in before inserting an event
		//TODO figure out the best way of securing this
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
		
		//Lookup number
		var number = phone(phoneNumber, 'CAN');
		if (!_.isEmpty(number)) {
			
			//See if number exists
			const user = Users.findOne({ username: { $in: [number[0], phoneNumber]} },{ fields: { _id:1 } });
			
			if (user) {

				//Only check in user if they aren't on site already
				var onsite = Meteor.call('events.isUserOnSite', user._id);

				if (onsite) {
					throw new Meteor.Error("User on site already.");
				} else {
					doc.userId = user._id;
    		}

			} else {
				throw new Meteor.Error("No user with this number");
			}

		} else {

			//If not a valid #, still check
			const user = Users.findOne({ username: phoneNumber },{ fields: { _id:1 } });
			if (user) {

				//Only check in user if they aren't on site already
				var onsite = Meteor.call('events.isUserOnSite', user._id);

				if (onsite) {
					throw new Meteor.Error("User on site already.");
				} else {
					doc.userId = user._id;
    		}

			} else {
				throw new Meteor.Error("No user with this number");
			}

		}
		
		//Build doc to test
		doc.beaconMinor = '0';
		doc.eventType = 1;
		doc.editor = Meteor.userId();
		
		if (doc.time > Date.create()) {
			throw new Meteor.Error("Can't check-in in the future.");
		}
		
				
		//Check the data
		check(doc, Events.simpleSchema());
    
    //Submit the data
    Events.insert(doc, function(error,results){
	    //Print results or error
	    if(results) {
		  	console.log('Check in with phone number success ' + results);
		  } else {
			   console.log('Check in with phone number failed ' + error);
			}
    });
	},
	'events.checkInManual'(doc) {
		// Make sure the user is logged in before inserting an event
		//TODO figure out the best way of securing this
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
		
		//Build doc to test
		doc.beaconMinor = '0';
		doc.eventType = 1;
		doc.editor = Meteor.userId();
				
		//Check the data
		check(doc, Events.simpleSchema());
    
    //Submit the data
    Events.insert(doc, function(error,results){
	    //Print results or error
	    if(results) {
		  	console.log('manual check in success ' + results);
		  } else {
			   console.log('manual check in failed ' + error);
			}
    });
	},
	'events.checkOutManual'(doc) {
		// Make sure the user is logged in before inserting an event
		//TODO figure out the best way of securing this
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
		
		//Build doc to test
		doc.beaconMinor = '0';
		doc.eventType = 0;
		doc.editor = Meteor.userId();
		
		//Find check-in ID
		var start = Date.create().beginningOfDay();
		var end = Date.create();
		var checkIn = Events.findOne({ userId: doc.userId, eventType: 1, beaconMajor: doc.beaconMajor, companyId: doc.companyId, time: {$gte: start, $lt: end}});
		
		if (checkIn) {
			doc.relatedId = checkIn._id;
		} else {
			throw new Meteor.Error("Can't find related check-in");
		}
		
		//Check the data
		check(doc, Events.simpleSchema());
    
    //Submit the data
    Events.insert(doc, function(error,results){
	    //Print results or error
	    if(results) {
		  	console.log('check out success ' + results);
		  } else {
			   console.log('check out failed ' + error);
			}
    });
	},
	'events.changeTime'(eventId, newTime) {
		// Make sure the user is logged in before inserting an event
		//TODO figure out the best way of securing this
		if (! Meteor.userId()) {
    		throw new Meteor.Error("not-authorized");
    	}

		//Get original time from event
		var event = Events.findOne({ _id: eventId });

		if (event.time) {

			//Add new time to existing date
			var newHour = Date.create(newTime).format('{HH}');
			var newMinute = Date.create(newTime).format('{mm}');
			var newDateTime = Date.create(event.time).set({ hour: newHour, minute: newMinute });
					
			//Make sure check-in isn't before check-out
			if (event.eventType === 0) {
				var eventOn = Events.findOne({ _id: event.relatedId });
				if (eventOn) {
					if (Date.create(eventOn.time).isAfter(newDateTime)) {
						throw new Meteor.Error("check-out must be after check-in");
					}
				}
			} else {	
				var eventOff = Events.findOne({ relatedId: event._id });
				if (eventOff) {
					if (Date.create(eventOff.time).isBefore(newDateTime)) {
						throw new Meteor.Error("check-out must be after check-in");
					}
				}
			}

	    //Submit the data & add editor
	    Events.update({ _id: eventId }, { $set: { time: newDateTime, editor: Meteor.userId() } }, function(error,results){
		    if(results) {
			  	console.log('Updated time ', results);
			  } else {
				  throw new Meteor.Error("Couldn't update time");
				}
	    });

		} else {
			throw new Meteor.Error("Invalid event.");
		}
	},
	'events.addJobCode'(eventId, jobCodeId) {
		// Make sure the user is logged in before editing an event
		//TODO figure out the best way of securing this
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
		
		//TODO - Check the data
		//check(doc, Events.simpleSchema());
    
    //Submit the data
    Events.update({ _id: eventId }, { $set: { jobCodeId: [jobCodeId] } }, function(error,results){
	    if(results) {
		  	console.log('Job code added to event ', results);
		} else {
			  throw new Meteor.Error("Couldn't add job code");
		}
    });
	},
	'events.isUserOnSite'(doc) {
		// Make sure the user is logged in before accessing this method
		if (! Meteor.userId()) {
    		throw new Meteor.Error("not-authorized");
    	}

		//Check if user was on site today
		var start = Date.create().beginningOfDay();
		var end = Date.create().endOfDay();
    	var events = Events.find({ userId: doc.userId, time: {$gte: start, $lt: end}, eventType: 1 }, { sort:{ time:-1 } }).fetch();
		var onsite = false;
		//If they were on site
  		if (!_.isEmpty(events)) {

    		var eventOff = Events.find({ $or: [{relatedId: events[0]._id},{userId:doc.userId, time: {$gte: events[0].time, $lt: end}, eventType:0}] },{fields:{time:1}, sort:{time:-1}}).fetch();

    		if (!_.isEmpty(eventOff)) {
	    		console.log("User already left site");
			} else {
	    		onsite = true;
			}
		} else {
    		console.log("User not on a site today");
		}
  		return onsite;

	},
	'events.getReportData'(start, end, companyId) {
		// Make sure the user is logged in before accessing this method
		//TODO ensure they are a manager
		if (! Meteor.userId()) {
    		throw new Meteor.Error("not-authorized");
    	}

		var self = this;
		var data = [];

		//Get events
		var allEvents = Events.find({ companyId: companyId, time: {$gte: start, $lt: end}, eventType: 1 }).fetch();
		
		//Group by user
		let userEvents = _.groupBy(allEvents.sortBy(function(event){ return event.userId }), function(event) {
			return event.userId;
		});
		
		//Loop through each user
		_.each(userEvents, function(events, userId) {
			
			//Get total hours for user
			var userSum = 0;
			
			//Get user name to display
			var currentUser = Users.findOne({ _id: userId });
			var userName = (currentUser && currentUser.profile) ? currentUser.profile.firstName + ' ' + currentUser.profile.lastName : "No Name";	 
			
			//Get events grouped by site
			let siteEvents = _.groupBy(events, function(event) {
				return event.beaconMajor;
			});
			
			//Loop through each site	
			_.each(siteEvents, function(userSiteEvents, beaconMajor) {
				
				//Get site name to display				
				var currentSite = Sites.findOne({ beaconMajor: beaconMajor });
				var siteName = currentSite ? currentSite.name : "Old Site";				 			
				
				//Get events grouped by code & loop
				let codeEvents = _.groupBy(userSiteEvents, function(event) {
					return !_.isEmpty(event.jobCodeId) ? event.jobCodeId[0] : "no code";
				}); 
					
				//Loop through each job code
				_.each(codeEvents, function(userCodeEvents, jobCode) {
					
					//Get code name to display
					var codeNumber;
					if (jobCode === 'no code') {
						codeNumber = 'no code';
					} else {
						var currentCode = JobCodes.findOne({ _id: jobCode });
						codeNumber = currentCode.code; 	
					}	
					
					//Set hours to zero
					var tempSum = 0;
					
					_.each(userCodeEvents, function(event) {

						//Find matching check-out							
						var endEvent = Events.findOne({relatedId: event._id});
						
						//UNCOMMENT BELOW TO ENABLE OLD EVENTS WITHOUT RELATED ID'S - RESULTS NOT GUARANTEED
						/* 
						if (endEvent == null) {
							var end = Date.create(event.time).endOfDay();
							endEvent = Events.find({userId:event.userId, time: {$gte: event.time, $lt: end}, eventType:0, beaconMajor: event.beaconMajor},{fields:{time:1}, sort:{time:1}}).fetch();
						}
						*/
						
						//If we now have data, add it to the sum
						if (endEvent) {
							var minutesWorked = getTimeRangeRaw(event.time, endEvent.time);
							tempSum += minutesWorked;
						}		

					});
					
					//After each loop, add to array data
					var roundedMinutes = 15 * Math.round(tempSum/15);
					var displayHours = (roundedMinutes > 0) ? getHours(roundedMinutes) : '0';
					userSum += roundedMinutes;
					
					var newData = {
						"Name": userName,
						"Site": siteName,
						"Code": codeNumber,
						"Hours": displayHours
					};
					data.push(newData);
						
				});
			});
			
			//Print sum for each user, then a space
			var displayHoursUser = (userSum > 0) ? getHours(userSum) : '0';
			
			var newData = 
			{
				"Name": userName,
				"Site": '',
				"Code": 'Total',
				"Hours": displayHoursUser
			};
			data.push(newData);
			
			var dataSpace = 
			{
				"Name": '',
				"Site": '',
				"Code": '',
				"Hours": ''
			};
			data.push(dataSpace);
			
		});	

		return data;

	}
});