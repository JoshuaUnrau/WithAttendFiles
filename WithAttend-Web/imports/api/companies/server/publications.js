import { Meteor } from 'meteor/meteor';

import { Companies } from '../companies.js';

//Publish all companies for now
Meteor.publish('companies', function companiesPublication() {
  return Companies.find({});
});

//Get Company info
Meteor.publish('companies.one', function(companyName) {
  //TODO - Validate companyName
  return Companies.find({ name: companyName });
});