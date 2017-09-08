import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Users = Meteor.users;

// TODO - Deny all client-side updates since we will be using methods to manage this collection

/*
Sites.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
*/


//TODO - Add a schema to the User DB

/* CREATE A SCHEMA TO VALIDATE THE DATA COMING IN 
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
  imageUrl: {
    type: String,
    label: "Last date this book was checked out",
    regEx: SimpleSchema.RegEx.Url
  }
});

Sites.attachSchema(Schemas.Site);
*/