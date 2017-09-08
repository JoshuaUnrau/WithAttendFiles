import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { check } from 'meteor/check';

import { PassiveEvents } from './passiveEvents.js';


Meteor.methods({
	
	'passiveEvents.enterSite'(doc) {
		// Make sure the user is logged in before inserting an event
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
		console.log(doc);
		doc.eventType = 1;
		doc.createdAt = Date.create(doc.createdAt+" GMT-0700 (PDT)");
		
		//Check the data
		check(doc, PassiveEvents.simpleSchema());
    
    //Submit the data
    PassiveEvents.insert(doc, function(error,results){
	    //Print results or error
	    if(results) {
		  	console.log('added passive event ' + results);
		  } else {
			   console.log('Error passive adding event ' + error);
			}
    });
	},
	'passiveEvents.leaveSite'(doc) {
		// Make sure the user is logged in before inserting an event
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
		console.log(doc);
		doc.eventType = 0;
		doc.createdAt = Date.create(doc.createdAt+" GMT-0700 (PDT)");
		
		//Check the data
		check(doc, PassiveEvents.simpleSchema());
    
    //Submit the data
    PassiveEvents.insert(doc, function(error,results){
	    //Print results or error
	    if(results) {
		  	console.log('added passive event ' + results);
		  } else {
			   console.log('Error passive adding event ' + error);
			}
    });
	}	
	
});