import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Companies = new Mongo.Collection('companies');

// Deny all client-side updates since we will be using methods to manage this collection
Companies.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


/* CREATE A SCHEMA TO VALIDATE THE DATA COMING IN */
var Schemas = {};

Schemas.Company = new SimpleSchema({
  name: {
    type: String,
    label: "Name",
    max: 20
  },  
  title: {
    type: String,
    label: "Name",
    max: 100
  },
  logo: {
    type: String,
    label: "Name",
    max: 40
  }
});

Companies.attachSchema(Schemas.Company);