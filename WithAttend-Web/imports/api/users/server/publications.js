import { Meteor } from 'meteor/meteor';

import { Users } from '../users.js';
import { Companies } from '../../companies/companies.js';

//Publish all users for the specific company
Meteor.publish('users.company', function(companyId) {
  return Users.find({ $or: [{activeCompanies: companyId}, {inactiveCompanies: companyId}]}, { sort: { "profile.firstName": 1 } }); 
});

//Publish all foremen for the specific company
Meteor.publish('users.foremen', function(companyName) {
  return Roles.getUsersInRole('foreman', companyName); 
});