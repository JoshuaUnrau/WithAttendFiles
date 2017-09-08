import { Meteor } from 'meteor/meteor';

import { Events } from '../events.js';
import { Users } from '../../users/users.js';
import { Sites } from '../../sites/sites.js';

//Pass events for a company
Meteor.publish('events.user', function(userId, companyId) {
	var twoWeeksAgo = new Date(+new Date - 12096e5);
	return Events.find({ userId: userId, companyId: companyId, time: { $gte : twoWeeksAgo }});
});

//Pass all events and users for a site to the site dashboard
Meteor.publishComposite('events.siteAndUsers', function(siteId, companyId) {
  
  //TODO - Validate the beacon and company

  return {
    find() {
	    
	    //Get BeaconMajor from siteId
			var site = Sites.findOne({ _id: siteId }, { beaconMajor:1, _id:0} );
	    
      //Get date two weeks ago
			var twoWeeksAgo = new Date(+new Date - 12096e5);
			return Events.find({beaconMajor: site.beaconMajor, companyId: companyId, time: { $gte : twoWeeksAgo }});
    },
		
    children: [{
      find(event) {
        return Users.find({ _id: event.userId });
      },
    }],
  };
});
