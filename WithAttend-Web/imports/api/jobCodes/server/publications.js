import { Meteor } from 'meteor/meteor';

import { JobCodes } from '../jobCodes.js';

//Only publish the codes for the current company
Meteor.publish('jobcodes', function(companyId) {
  return JobCodes.find({ companyId: companyId });
});