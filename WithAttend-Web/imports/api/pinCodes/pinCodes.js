import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const PinCodes = new Mongo.Collection('pinCodes');

// Deny all client-side updates since we will be using methods to manage this collection
PinCodes.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


/* CREATE A SCHEMA TO VALIDATE THE DATA COMING IN */
var Schemas = {};

//TODO Ensure Beacon Major a number
Schemas.PinCode = new SimpleSchema({
  code: {
	  type: String,
    label: "Randomly Generated Pin Code"
  },  
  secret: {
	  type: String,
    label: "Randomly Generated Secret"
  },
  expiry: {
    type: Date,
    label: "Expiry Date"
  },
  userId: {
    type: String,
    label: "User ID"
  },
  number: {
	  type: String,
	  label: "Phone number (international)"
  },
  status: {
    type: Number,
    label: "Status (0 = unused), (1 = used)"
  }
});

PinCodes.attachSchema(Schemas.PinCode);