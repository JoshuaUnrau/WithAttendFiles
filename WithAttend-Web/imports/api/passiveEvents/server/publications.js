import { Meteor } from 'meteor/meteor';

import { PassiveEvents } from '../passiveEvents.js';

//Publish all passive events for now
//TODO - Only publish the correct events
Meteor.publish('passiveEvents', function() {
  return PassiveEvents.find();
});