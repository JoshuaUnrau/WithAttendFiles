import { Accounts } from 'meteor/accounts-base';
import phone from 'phone';

import { Users } from '../../api/users/users.js';

//Set the company based on the site the creator is using
//Also check the number is unique and send the invite code
Accounts.onCreateUser(function(options, user) {
 
  //Get the current Active Company & lower case company
  if (options.profile) {
	  var profile = options.profile;
		user.activeCompanies = [profile.company];
		profile.firstName = profile.firstName.toLowerCase();
		profile.lastName = profile.lastName.toLowerCase();
		
		//Save profile without the Company
		user.profile = _.omit(profile, 'company');
  }
  
  //Save "has device" status
  user.hasDevice = options.hasDevice;
  
  //Validate phone number to common format
  if (user.username) {
	  
	  //Check if username or phone number entered
	  var number = phone(user.username, 'CAN');
	  if (!_.isEmpty(number)) {
		  
		  //check if phone number has been used before
			const existingUser = Users.findOne({ username: number[0], phoneConfirmed: 1 });
		
			if (!existingUser) {
		  	//Update # in system to correct format
				user.username = number[0];
				
				//Create Pin Code and Validate device if has one
				if (options.hasDevice) {
					Meteor.call('pinCodes.generate', user._id, number[0], options.password);
				}
				
			} else {
				throw new Meteor.Error("Number already used.");
			}
			
	  }
	  
  }
 
  return user;
});