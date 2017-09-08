import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { check } from 'meteor/check';
import twilio from 'twilio';

import { PinCodes } from './pinCodes.js';
import { Users } from '../users/users.js';

Meteor.methods({
	
	'pinCodes.generate'(userId, phone, secret) {
		// Make sure the user is logged in before creating a code
		if (! Meteor.userId()) {
    	throw new Meteor.Error("not-authorized");
    }
    
    //Generate the pin
    var pin = _.sample('123456789', 6).join('');
    
    //TODO - Ensure this pin doesn't exist
    
    //Set the values for the collection
    var doc = {
	    code: pin,
	    secret: secret,
	    expiry: Date.create().advance({ hours: 12 }),
	    userId: userId,
	    number: phone,
	    status: 0
    };
		
		//Check the data
		check(doc, PinCodes.simpleSchema());
		
    //Submit the data
    PinCodes.insert(doc, function(error,results){
	    //Print results or error
	    if(results) {
		  	
		  	//var client = twilio('ACCOUNTSID', 'AUTHTOKEN');
		  	var client = twilio(Meteor.settings.Twilio.SID, Meteor.settings.Twilio.Token);
		  	
		  	//Send SMS
				client.sendMessage({
				
				    to: doc.number, // Any number Twilio can deliver to
				    from: Meteor.settings.Twilio.From, // A number you bought from Twilio and can use for outbound communication
				    body: 'Your WithAttend code is ' + doc.code + '.'+' To enter your pin tap the following link -> withattend://pin:'+doc.code // body of the SMS message
				
				}, function(err, res) { //this function is executed when a response is received from Twilio
				
				    if (!err) { // "err" is an error received during the request, if any
				
			        // "responseData" is a JavaScript object containing data received from Twilio.
			        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
			        // http://www.twilio.com/docs/api/rest/sending-sms#example-1
				
				      console.log('Pin code sent successfully. Results: ', res); // outputs "+14506667788"				
				    } else {
					    console.log('Pin code sending error. Details: ', err); // outputs "+14506667788"
				    }
				});
		  	
		  } else {
			   console.log('Error adding pin code to database. Details: ', error);
			}
    });
	},
	'pinCodes.generateNew'(userId) {

    //Generate the pin
    var pin = _.sample('123456789', 6).join('');

    //TODO - Ensure this pin doesn't exist

    //Get user
    var user = Users.findOne({_id:userId});

    //Give the user a new password and log them out
    var newPass = Random.id(14);
    Accounts.setPassword(user._id, newPass, true);

    //Set the values for the collection
    var doc = {
	    code: pin,
	    secret: newPass,
	    expiry: Date.create().advance({ hours: 12 }),
	    userId: user._id,
	    number: user.username,
	    status: 0
    };

		//Check the data
		check(doc, PinCodes.simpleSchema());

		//Update user account to be unconfirmed again
		Users.update({ _id:user._id },{ $set: { phoneConfirmed: 0 } });

    //Submit the data
    PinCodes.insert(doc, function(error,results){
	    //Print results or error
	    if(results) {

		  	//var client = twilio('ACCOUNTSID', 'AUTHTOKEN');
		  	var client = twilio(Meteor.settings.Twilio.SID, Meteor.settings.Twilio.Token);

		  	//Send SMS
				client.sendMessage({

				    to: doc.number, // Any number Twilio can deliver to
				    from: Meteor.settings.Twilio.From, // A number you bought from Twilio and can use for outbound communication
				    body: 'Your WithAttend code is ' + doc.code + '.'+' To enter your pin tap the following link -> withattend://pin:'+doc.code // body of the SMS message

				}, function(err, res) { //this function is executed when a response is received from Twilio

				    if (!err) { // "err" is an error received during the request, if any

			        // "responseData" is a JavaScript object containing data received from Twilio.
			        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
			        // http://www.twilio.com/docs/api/rest/sending-sms#example-1

				      console.log('Pin code sent successfully. Results: ', res); // outputs "+14506667788"
				    } else {
					    console.log('Pin code sending error. Details: ', err); // outputs "+14506667788"
				    }
				});

		  } else {
			   console.log('Error adding pin code to database. Details: ', error);
			}
    });
	},
	'pinCodes.validate'(code) {
    //TODO - Consider putting rate limiting in place.
    
		//check if id is in PinCode database, not expired, not used
		console.log(code);
		const pinCode = PinCodes.findOne({ code: code.code, status: 0, expiry: { $gte : new Date() }}, {fields: { _id:1, userId: 1, secret:1 }});
		if (pinCode) {
			
			console.log('pin code found: ', pinCode);
			
			const user = Users.findOne({ _id: pinCode.userId },{ fields: { username:1,activeCompanies:1 } });
						
			//Invalidate Pin Code & remove Secret
			PinCodes.update({ _id: pinCode._id },{ $set: {status: 1, secret: 0} });
			
			//Update User profile to note that phone is validated
			Users.update({ _id:pinCode.userId },{ $set: { phoneConfirmed: 1 } });

			console.log(user);

			returnData = {
				userId: pinCode.userId,
				username: user.username,
				secret: pinCode.secret,
				companyId: user.activeCompanies[0]
			}
			
			return returnData;	
			
		} else {
			//Return error
			throw new Meteor.Error("Pin not valid");
		}
	}
	
});