import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { check } from 'meteor/check';

import { Sites } from './sites.js';


Meteor.methods({
	
	'sites.add'(doc) {
		// Make sure the user is logged in before inserting a site
		//TODO make sure they are a super admin
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
		
		//Check the data
		check(doc, Sites.simpleSchema());
    
    //Submit the data
    Sites.insert(doc, function(error,results){
	    //Print results or error
	    if(results) {
		  	console.log('added site ' + results);
		  } else {
			   console.log('site adding error' + error);
			}
    });
	},
	
			
	'sites.addCompany'(companyId, siteId) {
	  // Make sure the user is logged in before inserting a site
		if (! Meteor.userId()) {
    		throw new Meteor.Error("not-authorized");
    	}
    
		//TODO make sure the creator is from this company

		//TODO - Check the data
		//TODO - This will probably be added by us, but we should ensure a company can't be added to a site twice
    	Sites.update(siteId, { $push: { activeCompanies: companyId } });
	},
	'sites.allCompanySites'(companyId) {
		//Get all sites from company with ID
		return Sites.find({ activeCompanies: companyId }, { fields: {beaconMajor:1, name:1 }});
	}
	
	//TODO - Add method to move company to inactive list
	
});