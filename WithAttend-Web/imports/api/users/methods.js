/* All methods for accessing Site Data */
import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import phone from 'phone';

import { Users } from './users.js';


//TODO - Add methods for adding new users and editing users, or use the Meteor API?

Meteor.methods({
	
	'users.add'(doc, companyId) {
		// Make sure the user is logged in before adding a new user
		//TODO make sure they are a foreman or manager
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
		
		//TODO - Check the data & company
		//check(doc, Sites.simpleSchema());
    
    var options = { username:doc.phoneNumber, hasDevice:doc.hasDevice };
    var profile = { firstName:doc.firstName, lastName: doc.lastName, company: companyId }
    options.profile = profile;
    options.password = Random.id(14);
     
    Accounts.createUser(options);
	},	
	'users.updateName'(doc) {
		// Make sure the user is logged in before adding a new user
		//TODO make sure they are a foreman or manager
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
		
		//TODO - Check the data & company
		//check(doc, Sites.simpleSchema());
		console.log("edit user ", doc);
		if (doc.firstName) {
			Users.update(doc.id, { $set: { "profile.firstName": doc.firstName } });
		}
		
		if (doc.lastName) {
			Users.update(doc.id, { $set: { "profile.lastName":doc.lastName } });
		}
		    
    return true;
	},	
	'users.updateNumber'(doc) {
		// Make sure the user is logged in before adding a new user
		//TODO make sure they are a foreman or manager
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
		
		var phoneNumber = doc.phoneNumber;
	  //Validate phone number to common format
	  var number = phone(phoneNumber, 'CAN');
	  if (!_.isEmpty(number)) {
		  
		  //check if phone number has been used before
			const existingUser = Users.findOne({ username: number[0], phoneConfirmed: 1 });
		
			if (!existingUser) {
		  	//Update # in system to correct format
				phoneNumber = number[0];
				
				//Create Pin Code and Validate device if has one
				if (doc.hasDevice) {
									
					var newPass = Random.id(14);
					Meteor.call('pinCodes.generate', doc.id, number[0], newPass);
					
					//Set password to new password & logout of all devices
					Accounts.setPassword(doc.id, newPass, true);
					
				}
				
			} else {
				throw new Meteor.Error("Number already used.");
			}
			
	  }

    Users.update(doc.id, { $set: { username: phoneNumber, hasDevice: doc.hasDevice } });
    
    return true;
	},
	'users.changeCompanyState'(doc, companyId) {
		// Make sure the user is logged in before adding a new user
		//TODO make sure they are a foreman or manager
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
		
		//Change status with company
		if (doc.active) {
			Users.update(doc.id, { $push: { activeCompanies: companyId }, $pull: { inactiveCompanies: companyId } });
		} else {
			Users.update(doc.id, { $push: { inactiveCompanies: companyId }, $pull: { activeCompanies: companyId } });
		}

    return true;
	},
	'users.hasDevice'(user) {
		// Make sure the user is logged in before adding a new user
		//TODO make sure they are a foreman or manager
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
		
		var phoneNumber = user.username;
	  //Validate phone number to common format
	  var number = phone(phoneNumber, 'CAN');
	  if (!_.isEmpty(number)) {
	
	  	//Update # in system to correct format
			phoneNumber = number[0];
				
			var newPass = Random.id(14);
			Meteor.call('pinCodes.generate', user._id, number[0], newPass);
			
			//Set password to new password & logout of all devices
			Accounts.setPassword(user._id, newPass, true);
					
		} else {
			throw new Meteor.Error("Invalid number.");
		}

    Users.update(user._id, { $set: { username: phoneNumber, hasDevice: true } });
    
    return true;
	},
	'users.addToCompany'(companyId, userId) {
	  // Make sure the user is logged in before inserting a site
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
    
		//TODO make sure the creator is from this company

		//TODO - Check the data
	
    Users.update(userId, { $push: { activeCompanies: companyId } });
	},
	'users.addForeman'(siteId, userId) {
	  // Make sure the user is logged in
	  //TODO only manager or admin
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
    
		//TODO - Check the data
	
    Users.update(userId, { $push: { foremanSites: siteId } });
    
    return true;
	},
	'users.removeForeman'(siteId, userId) {
	  // Make sure the user is logged in
	  //TODO only manager or admin
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
    
		//TODO - Check the data
		
    Users.update(userId, { $pull: { foremanSites: siteId } });
    
    return true;
	},
	'users.addRole'(userId, role, companyName) {
	  // Make sure the user is logged in
	  //TODO only manager or admin
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
    
		//TODO - Check the data
		Roles.addUsersToRoles(userId, [role], companyName);
    
    return true;
	},
	'users.removeRoles'(userId, companyName) {
	  // Make sure the user is logged in
	  //TODO only manager or admin
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
    
		//TODO - Check the data
		Roles.removeUsersFromRoles(userId, ['admin','manager','foreman'], companyName);
    
    return true;
	},
	'users.changePassword'(userId, newPassword) {
	  // Make sure the user is logged in
	  //TODO only manager or admin
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
    
		//TODO - Check the data
		Accounts.setPassword(userId, newPassword, false);
    
    return true;
	},
	'user.getData'(code) {
		//TODO - Consider putting rate limiting in place.

		//check if id is in PinCode database, not expired, not used
		console.log(code);

		const user = Users.findOne({ _id: code.userId },{ fields: {activeCompanies:1 } });
		const company = Companies.findOne({ _id: code.userId },{ fields: {activeCompanies:1 } });
		returnData = {
			companyId: user.activeCompanies[0]
		}
		return returnData;
	}
	
	
	
});