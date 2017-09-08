import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Sites = new Mongo.Collection('sites');

// Deny all client-side updates since we will be using methods to manage this collection
Sites.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


/* CREATE A SCHEMA TO VALIDATE THE DATA COMING IN */
var Schemas = {};

//TODO Ensure Beacon Major a number
Schemas.Site = new SimpleSchema({
  name: {
    type: String,
    label: "Name",
    max: 100
  },
  location: {
    type: String,
    label: "Location"
  },
  beaconMajor: {
    type: String,
    label: "Beacon Major",
  },
  image: {
    type: String,
    label: "Site Image"
  },
  activeCompanies: {
    type: [String],
    label: "Active Companies",
    optional: true
  },
  inactiveCompanies: {
    type: [String],
    label: "Inactive Companies",
    optional: true
  }
});

Sites.attachSchema(Schemas.Site);