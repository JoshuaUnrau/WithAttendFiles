import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { findDOMNode } from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import { DayHistory } from './DayHistory.jsx';

import { Events } from '../../api/events/events.js';

//User History Card
class UserHistoryContainer extends Component {
  
	componentDidUpdate() {
		//Scroll to top on load user history
		ReactDOM.findDOMNode(this).scrollIntoView();
	}

	handleClose() {
		this.props.closeUser();
	}
	
	handleEdit() {
		this.props.editUser();
	}
	
	handleEditJobCode(event, eventData) {
		this.props.editJobCode(event, eventData);
	}
	
	handleEditTime(event, eventData) {
		this.props.editJobTime(event, eventData);
	}
	
	handleResendPin(userId) {
		var self = this;
		
		Meteor.call('pinCodes.generateNew', userId, function(err,res) {
	    if (err) {
				self.props.showNotification( "Pin resend failed: " + err.error );
				console.log(err, userId);
	    } else {
		    self.props.showNotification( "New pin sent" );
	    }
		});	
	}
	
	renderHistory() {
		
		if (this.props.eventsLoading) {	
			return (
			  <div className="text-center spinner-padding">
					<div className="mdl-spinner mdl-js-spinner is-active"></div>
				</div>
		    )
		} else {
			
			//Filter only users check-in events
			var filteredEvents = this.props.events.filter((event) => {
		   	if (event.eventType === 1 && event.userId === this.props.activeUserDetails._id) {
		    	return event;
		    }
		  });

			if (_.isEmpty(filteredEvents)) {
		    
		    return (
			    <div>
			    	<h6>No History</h6>
			    </div>
		    )
		    
	    } else {
		   	    	
		   	const { activeUserDetails } = this.props;
		   	var self = this;
		   	 			   			   	
	    	//TODO - add grouping and loop through each group
	    	//let groupedEvents = _.groupBy(filteredEvents.sortBy(function(event){ return event.time }, true), function(event) {
			  //  return Date.create(event.time).format("{Dow} {Mon} {d}");
				//});
				
				//sort by date
				return filteredEvents.sortBy(function(event){ return event.time }, true).map((event) => {
					
					//Get key event info
					var startTime = Date.create(event.time).format("{h}:{mm} {tt}");
					var end = Date.create(event.time).endOfDay();
					var date = Date.create(event.time).format("{Dow} {Mon} {d}");
					var site = _.findWhere(self.props.siteNames, {beaconMajor: event.beaconMajor});
					
					//Try and get end time based on ID, otherwise use data from start time, and sort by most recent after start time
					endEvent = Events.find({ $or: [{relatedId: event._id},{userId:event.userId, time: {$gte: event.time, $lt: end}, eventType:0, beaconMajor: event.beaconMajor}] },{fields:{time:1}, sort:{time:1}}).fetch();
					
					//Displays end time and hours worked correctly
					var endTime;
					var hoursWorked;
					
					if (!_.isEmpty(endEvent)) {
						endTime = Date.create(endEvent[0].time).format("{h}:{mm} {tt}");
						hoursWorked = getTimeRange(event.time, endEvent[0].time);
					} else {
						endTime = 'n/a';
						hoursWorked = 'n/a';
					}	
					
					var jobCode = '0';
					//If has job code, show it
					if (!_.isEmpty(event.jobCodeId)) {
						var jobCodeData = _.findWhere(self.props.jobCodes, { _id:event.jobCodeId[0] } );
						jobCode = jobCodeData.code;
					}

					//Return each item
					return (
						<DayHistory
								key={event._id}
								date={date}
								startTime={startTime}
								endTime={endTime}
								siteName={site.name}
								hoursWorked={hoursWorked}
								jobCode={jobCode}
								changeJobCode={this.handleEditJobCode.bind(this, 'event', event)}
								changeJobTime={this.handleEditTime.bind(this, 'time', { on:event, off:endEvent})}
						/>
					)	
					
				});

			}
		}
	}
	
	render() {
		const { activeUserDetails } = this.props;
		
		if (activeUserDetails) {
			//If phone verified, display
			var phoneConfirmed;
			if (activeUserDetails.phoneConfirmed === 1) {
				phoneConfirmed = 'Yes';
			} else {
				phoneConfirmed = 'No';
			}
			
			//Make click to call link work
			var telLink
			if (activeUserDetails.username.has('+')) {
				telLink = "tel:" + activeUserDetails.username;
			} else {
				telLink = "tel:+1" + activeUserDetails.username;
			}
			
			var hasApp;
			var showResendPin;
			if (activeUserDetails.hasDevice) {
				hasApp = 'Yes';
				showResendPin = "fake-link";
			} else {
				hasApp = 'No';
				showResendPin = "hidden";
			}
			
			var firstName = activeUserDetails.profile.firstName ? activeUserDetails.profile.firstName : 'none';
			var lastName = activeUserDetails.profile.lastName ? activeUserDetails.profile.lastName : 'none';
			
			var active = (_.findWhere(activeUserDetails.activeCompanies, Session.get('companyId')) != null ) ? 'Active' : 'Inactive';
									
			return (
				
				<div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--6-col mdl-card">
					<div className="mdl-card__title">
	      		<span>
	      			<h5 className="mdl-card__title-text">{firstName.capitalize()}&nbsp;{lastName.capitalize()}</h5>
	      		</span>
						<div className="mdl-layout-spacer"></div>
						<button className="mdl-button mdl-js-button mdl-button--icon" onClick={this.handleEdit.bind(this, activeUserDetails._id)}>
							<i className="material-icons">edit</i>
						</button>
						<button className="mdl-button mdl-js-button mdl-button--icon" onClick={this.handleClose.bind(this)}>
							<i className="material-icons">close</i> 
						</button>
					</div>
					
					
					<div className="mdl-card__supporting-text no-top-padding">
						Phone: <a href={telLink}>{activeUserDetails.username}</a> <span className={showResendPin} onClick={this.handleResendPin.bind(this,activeUserDetails._id)}>(Resend Pin)</span><br />
						Uses App: {hasApp}<br />
						Phone Confirmed: {phoneConfirmed}<br />
						Employee Status: {active}<br />
					</div>
					
					<div className="mdl-card__supporting-text">
						<h5 className="underline-header">User History</h5>
						<div className="mdl-list no-top-padding">
							{this.renderHistory()}
						</div>
					</div>
						
				</div>
			)
			
		} else {
			
			return (
				<div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--6-col mdl-card">
					<div className="text-center spinner-padding">
	      		<div className="mdl-spinner mdl-js-spinner is-active"></div>
					</div>
				</div>
			)
			
			}
	}
}

UserHistoryContainer.propTypes = {
  activeUserDetails: React.PropTypes.object,
  events: React.PropTypes.array,
  jobCodes: React.PropTypes.array,
  siteNames: React.PropTypes.array
};


export default UserHistory = createContainer((props) => {
  
  //Get events for the selected user
  var eventsLoading: false;
  if (props.activeUserDetails) {
		var handleEvents = Meteor.subscribe('events.user', props.activeUserDetails._id, Session.get('companyId'));
		eventsLoading = !handleEvents.ready();
  }
  
  return {
    eventsLoading: eventsLoading,
    events: Events.find({},{sort: { time: -1 }}).fetch()
  };
}, UserHistoryContainer);