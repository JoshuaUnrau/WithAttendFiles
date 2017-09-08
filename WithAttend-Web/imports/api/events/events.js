import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Events = new Mongo.Collection('events');

// Deny all client-side updates since we will be using methods to manage this collection
Events.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


/* CREATE A SCHEMA TO VALIDATE THE DATA COMING IN */
var Schemas = {};

//TODO Ensure Beacon Major a number
Schemas.Event = new SimpleSchema({
  time: {
    type: Date,
    label: "Time of event (used for calculations)"
  },
  createdAt: {
    type: Date,
    label: "Time actually recorded"
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
    label: "Event Type"
  },
  relatedId: {
    type: String,
    label: "Id of related event",
    optional: true
  },
  editor: {
    type: String,
    label: "Editor Id",
    optional: true
  },
  jobCodeId: {
    type: [String],
    label: "Job Code Ids",
    optional: true
  },
  jobCodeTime: {
	  type: [Number],
	  label: "Job Code Times",
	  optional: true
  }
});

Events.attachSchema(Schemas.Event);