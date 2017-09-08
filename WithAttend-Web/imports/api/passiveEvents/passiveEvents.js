import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const PassiveEvents = new Mongo.Collection('passiveEvents');

// Deny all client-side updates since we will be using methods to manage this collection
PassiveEvents.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


/* CREATE A SCHEMA TO VALIDATE THE DATA COMING IN */
var Schemas = {};

//TODO Ensure Beacon Major a number
Schemas.PassiveEvent = new SimpleSchema({
  createdAt: {
    type: Date,
    label: "Time event happened"
  },
  userId: {
    type: String,
    label: "User Id"
  },
  beaconMinor: {
    type: String,
    label: "Beacon Minor"
  },
  beaconMajor: {
    type: String,
    label: "Beacon Major"
  },
  companyId: {
    type: String,
    label: "Company Id"
  },
  eventType: {
	  type: Number,
	  label: "Type of event 1=entering, 0=leaving"
  }
});

PassiveEvents.attachSchema(Schemas.PassiveEvent);