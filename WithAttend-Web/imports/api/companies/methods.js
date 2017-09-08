import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { check } from 'meteor/check';

import { Companies } from './companies.js';


Meteor.methods({
	
	'companies.add'(doc) {
		// Make sure the user is logged in before inserting a company
		//TODO make sure they are a super admin
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
		
		//TODO - Check the data
		check(doc, Companies.simpleSchema());
    
    //Submit the data
    Companies.insert(doc, function(error,results){
	    //Print results or error
	    if(results) {
		  	console.log('added company ' + results);
		  } else {
			   console.log('company adding error' + error);
			}
    });
	}
	
});