import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { check } from 'meteor/check';

import { JobCodes } from './jobCodes.js';


Meteor.methods({
	
	'jobCodes.add'(doc) {
		// Make sure the user is logged in before inserting an event
		//TODO make sure they are a super admin
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
		
		//Check the data
		check(doc, JobCodes.simpleSchema());
    
    //Submit the data
    JobCodes.insert(doc, function(error,results){
	    //Print results or error
	    if(results) {
		  	console.log('added job code ' + results);
		  } else {
			   console.log('Error adding job code ' + error);
			}
    });
	}
	
});