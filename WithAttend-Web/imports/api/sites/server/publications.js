import { Meteor } from 'meteor/meteor';

import { Sites } from '../sites.js';
import { Users } from '../../users/users.js';

//Publish sites that are active with this company

Meteor.publish('sites', function(companyId) {
 	//TODO - Only return foreman sites
 	return Sites.find({ activeCompanies: companyId }, { sort: { "name":1 } });
});

//Publish data for one site
Meteor.publish('sites.one', function(siteId) {
  //TODO - Validate siteID format
    return Sites.find({ _id: siteId });
});

//Publish all sites names for a company
Meteor.publish('sites.names', function(companyId) {
  return Sites.find({ activeCompanies: companyId }, { fields: {beaconMajor:1, name:1 }});
});

//Publish all site data for admin
Meteor.publish('sites.all', function(companyName) {
  if (Roles.userIsInRole(this.userId, ['admin'], companyName)) {
    return Sites.find();
  } else {
    this.stop();
    return;
  }
});