import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const JobCodes = new Mongo.Collection('jobCodes');

// Deny all client-side updates since we will be using methods to manage this collection
JobCodes.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


/* CREATE A SCHEMA TO VALIDATE THE DATA COMING IN */
var Schemas = {};

//TODO Ensure Beacon Major a number
Schemas.JobCode = new SimpleSchema({
  name: {
	  type: String,
    label: "Job Code Name"
  },
  code: {
    type: Number,
    label: "Job Code"
  },
  companyId: {
    type: String,
    label: "CompanyId"
  }
});

JobCodes.attachSchema(Schemas.JobCode);