import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { findDOMNode } from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import dialogPolyfill from 'dialog-polyfill';
import removeClass from 'react-kit/removeClass';
import addClass from 'react-kit/addClass';
import hasClass from 'react-kit/hasClass';

import Dialog from '../components/Dialog.jsx';
import { User } from '../components/User.jsx';
import UserHistory from '../components/UserHistory.jsx';

import { Users } from '../../api/users/users.js'; 
import { Sites } from '../../api/sites/sites.js';
import { JobCodes } from '../../api/jobCodes/jobCodes.js'; 
 
// App component - represents the whole app
class UsersPage extends Component {
	constructor(props) {
    super(props);
    this.state = { 
	    openDialog: false, 
	    dialogType: 'add-user',
	    filter: 'all',
	    editUser: false,
	    userHasDevice: false,
	    userHadDevice: false,
	    userActive: false,
	    userOriginalStatus: false,
	  	phoneChecked: false,
	  	roleSelected: 'employee',
	    timeOnEvent: false,
	    eventOnTime: "",
	    timeOffEvent: false,
	    eventOffTime: "",	    
	    jobCodeSelected: '0',
	    codeEvent: false
	  };

    this.handleCloseDialog = this.handleCloseDialog.bind(this);
  }
  
  componentDidMount() { 
    const dialog = ReactDOM.findDOMNode(this.refs.addDialog);
    // avoid chrome warnings and update only on unsupported browsers
		if (!dialog.showModal) {
			dialogPolyfill.registerDialog(dialog);
		}
  }
  
  componentDidUpdate() {
	  componentHandler.upgradeDom();
	  
	  //Set the initial checkboxes correctly for the edit user dialog
	  if (this.state.openDialog && this.state.dialogType === 'edit-user') {
		  
		  if(this.state.userHasDevice) {
			  ReactDOM.findDOMNode(this.refs.editPhoneCheckParent).MaterialCheckbox.check();
		  } else {
			  ReactDOM.findDOMNode(this.refs.editPhoneCheckParent).MaterialCheckbox.uncheck();
		  }
		  
		  if(this.state.userActive) {
			  ReactDOM.findDOMNode(this.refs.activeParent).MaterialCheckbox.check();
		  } else {
			  ReactDOM.findDOMNode(this.refs.activeParent).MaterialCheckbox.uncheck();
		  }
		  
	  }
  }
  
  showNotification(message) {
	  var notification = ReactDOM.findDOMNode(this.refs.snackbar);
	  notification.MaterialSnackbar.showSnackbar({ message: message });
  }
  
    /* ALL DIALOG FUNCTIONS */
  handleOpenDialog(event, eventData) {
    if (event === 'add-user') {
	    //Open the dialog to check in a new user manually
	    this.setState({
      	openDialog: true,
      	dialogType: 'add-user'
    	});
    } else if (event === 'time') {
    	//Open the dialog to change a users check-in / check-out time
    	var eventOnId = false;
    	var eventOffId = false;
    	var eventOnTime = "";
    	var eventOffTime = "";
	    var openDialog = false;
	    
    	if (_.isEmpty(eventData.on)) {
    		//use defaults
    	} else if (_.isEmpty(eventData.off)) {
	    	eventOnId = eventData.on._id;
	    	eventOnTime = Date.create(eventData.on.time).format("{h}:{mm} {tt}");
		    openDialog = true;
    	} else {
	    	eventOnId = eventData.on._id;
	    	eventOnTime = Date.create(eventData.on.time).format("{h}:{mm} {tt}");
	    	eventOffId = eventData.off[0]._id;
	    	eventOffTime = Date.create(eventData.off[0].time).format("{h}:{mm} {tt}");
		    openDialog = true;
    	}
    	
    	this.setState({
	      openDialog: openDialog,
	      dialogType: 'time',
	      timeOnEvent: eventOnId,
	      eventOnTime: eventOnTime,
	      eventOffTime: eventOffTime,
	      timeOffEvent: eventOffId
	    });
    	
    } else if (event === 'event') {
	    //Open the dialog to set/change a users time code for the day
	    var eventOnId;
	    var openDialog;
	    
	    if (_.isEmpty(eventData)) {
		    eventOnId = false;
		    openDialog = false;
	    } else {
		    eventOnId = eventData._id;
		    openDialog = true;
	    }
	    
	    this.setState({
	      openDialog: openDialog,
	      dialogType: 'job-code',
	      codeEvent: eventOnId
	    });
    }
  }

  handleCloseDialog() {
    this.setState({
      openDialog: false
    });
  }

  closeUser() {
	  const current = FlowRouter.current();
	  FlowRouter.go('employees', current.params);
	  $(".mdl-layout__content").animate({ scrollTop: 0 });
  }
  
  editUserDialog(user) {
		
		//Get users active state
		var userActive;
		if (_.findWhere(user.activeCompanies, Session.get('companyId')) != null ) {
			userActive = true;
		} else {
			userActive = false;
		}
		
		var hasDevice;
		if (user.hasDevice) {
			hasDevice = true;
		} else {
			hasDevice = false;
		}
	  
		this.setState({
	    openDialog: true,
	    dialogType: 'edit-user',
	    editUser: user._id,
	    userHadDevice: hasDevice,
	    userHasDevice: hasDevice,
	    userActive: userActive,
	    userOriginalStatus: userActive
	  });
	  
  }
  			
  dialogContent() {		
		switch (this.state.dialogType) {
    case 'add-user':
			
			return (
				<div>
					<h4 className="mdl-dialog__title">Add User</h4>
		      <div className="mdl-dialog__content">
			      <form className="add-user" onSubmit={this.addUser.bind(this)}>
		          <div className="mdl-textfield mdl-js-textfield" ref="phoneNumberParent">
						    <input className="mdl-textfield__input" type="text" id="phoneNumber" ref="phoneNumber" />
						    <label className="mdl-textfield__label" for="phoneNumber">Phone Number</label>
						  </div>
							<div className="mdl-textfield mdl-js-textfield" ref="firstNameParent">
						    <input className="mdl-textfield__input" type="text" id="firstName" ref="firstName" />
						    <label className="mdl-textfield__label" for="firstName">First Name</label>
						  </div>
						  <div className="mdl-textfield mdl-js-textfield" ref="lastNameParent">
						    <input className="mdl-textfield__input" type="text" id="lastName" ref="lastName" />
						    <label className="mdl-textfield__label" for="lastName">Last Name</label>
						  </div>
						  <label className="mdl-checkbox mdl-js-checkbox" for="phone-check" ref="phoneCheckParent">
							  <input type="checkbox" id="phone-check" className="mdl-checkbox__input" onChange={this.phoneCheckChange.bind(this)}/>
							  <span className="mdl-checkbox__label">Will Use App</span>
							</label>
							<input type="submit" className="invisibleButton" />								  
		        </form>
			    </div>
			    <div className="mdl-dialog__actions">
			      <button type="button" className="mdl-button" onClick={this.addUser.bind(this)}>Invite User</button>
			      <button type="button" className="mdl-button close" onClick={this.handleCloseDialog}>Cancel</button>
			    </div>
				</div>
			)
							
			break;
		case 'edit-user':   	
    	
    	//Lookup edit user	
			var userDetails = _.findWhere(this.props.users, {_id: this.state.editUser});
			var firstName = userDetails.profile ? userDetails.profile.firstName : 'none';
			var lastName = userDetails.profile ? userDetails.profile.lastName : 'none';
			
    	return (
				<div>
					<h4 className="mdl-dialog__title">Edit User</h4>
		      <div className="mdl-dialog__content">
			      <form className="add-user" onSubmit={this.addUser.bind(this)}>
		          <div className="mdl-textfield mdl-js-textfield" ref="editPhoneNumberParent">
						    <input className="mdl-textfield__input" type="text" id="editPhoneNumber" ref="editPhoneNumber" />
						    <label className="mdl-textfield__label" for="editPhoneNumber">{userDetails.username}</label>
						  </div>
							<div className="mdl-textfield mdl-js-textfield" ref="editFirstNameParent">
						    <input className="mdl-textfield__input" type="text" id="editFirstName" ref="editFirstName" />
						    <label className="mdl-textfield__label" for="editFirstName">{firstName}</label>
						  </div>
						  <div className="mdl-textfield mdl-js-textfield" ref="editLastNameParent">
						    <input className="mdl-textfield__input" type="text" id="editLastName" ref="editLastName" />
						    <label className="mdl-textfield__label" for="editLastName">{lastName}</label>
						  </div>
						  <label className="mdl-checkbox mdl-js-checkbox" for="edit-phone-check" ref="editPhoneCheckParent">
							  <input type="checkbox" id="edit-phone-check" className="mdl-checkbox__input" onChange={this.editPhoneCheckChange.bind(this)}/>
							  <span className="mdl-checkbox__label">Will Use App</span>
							</label>
							<label className="mdl-checkbox mdl-js-checkbox" for="active-check" ref="activeParent">
							  <input type="checkbox" id="active-check" className="mdl-checkbox__input" onChange={this.activeCheckChange.bind(this)}/>
							  <span className="mdl-checkbox__label">Active Employee</span>
							</label>
							<input type="submit" className="invisibleButton" />								  
		        </form>
			    </div>
			    <div className="mdl-dialog__actions">
			      <button type="button" className="mdl-button" onClick={this.editUser.bind(this)}>Update</button>
			      <button type="button" className="mdl-button close" onClick={this.handleCloseDialog}>Cancel</button>
			    </div>
				</div>
			)
			    	
    	break;
    case 'edit-role':   	
    	
    	//Lookup edit user	

    	return (
				<div>
					<h4 className="mdl-dialog__title">Edit User Role</h4>
		      <div className="mdl-dialog__content">

			    </div>
			    <div className="mdl-dialog__actions">
			      <button type="button" className="mdl-button" onClick={this.editRole.bind(this)}>Save</button>
			      <button type="button" className="mdl-button close" onClick={this.handleCloseDialog}>Cancel</button>
			    </div>
				</div>
			)
    	
    	break;
    case 'job-code':   	
    	return (
	    	<div>
		    	<h4 className="mdl-dialog__title">Set Job Code</h4>
	        <div className="mdl-dialog__content">
			      <form className="add-event" onSubmit={this.setJobCode.bind(this)}>
	          	
				        <select value={this.state.jobCodeSelected} onChange={this.jobCodeChanged.bind(this)}>
				          <option value="0" disabled>Select from list</option>
									{this.jobCodes()}
				        </select>
				        
				        <input type="submit" className="invisibleButton" />
				      
	          </form>
			    </div>
			    <div className="mdl-dialog__actions">
			      <button type="button" className="mdl-button" onClick={this.setJobCode.bind(this)}>Set Job Code</button>
			      <button type="button" className="mdl-button close" onClick={this.handleCloseDialog}>Cancel</button>
			    </div>
		    </div>
			)
			break;
		case 'time':
			
			var displayOffClass = this.state.timeOffEvent ? "mdl-textfield mdl-js-textfield mdl-textfield--floating-label" : "hidden";
			   	
    	return (
	    	<div>
		    	<h4 className="mdl-dialog__title">Change Time</h4>
	        <div className="mdl-dialog__content">
			      <form className="add-event"  onSubmit={this.changeTime.bind(this)}>
	            <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" ref="startParent">
						    <input className="mdl-textfield__input" type="text" id="start" ref="start" />
						    <label className="mdl-textfield__label" for="start">{this.state.eventOnTime}</label>
						  </div>
						  <div className={displayOffClass} ref="endParent">
						    <input className="mdl-textfield__input" type="text" id="end" ref="end" />
						    <label className="mdl-textfield__label" for="end">{this.state.eventOffTime}</label>
						  </div>
						  
						  <input type="submit" className="invisibleButton" />
						  
	          </form>
			    </div>
			    <div className="mdl-dialog__actions">
			      <button type="button" className="mdl-button" onClick={this.changeTime.bind(this)}>Change Time</button>
			      <button type="button" className="mdl-button close" onClick={this.handleCloseDialog}>Cancel</button>
			    </div>
		    </div>
			)
			break;
    default:
    	console.log('oops');
			break;
		} 		          
  }
  
    	
	//JOB CODES
	jobCodeChanged(event) {
		this.setState({
      jobCodeSelected: event.target.value
    });
	}
	
	jobCodes() {
		if (this.props.codesLoading) {
			
			return(
				<option value="" disabled>Codes loading ...</option>
			)
			
		} else {
			
			//Get the job codes and display in the list
			let jobCodes = this.props.jobCodes;
	    return jobCodes.map((code) => {
	      return (
		      <option key={code._id} value={code._id}>{code.name} ({code.code})</option>
		      )
			});
		}
	}
	
	phoneCheckChange() {
		this.setState({
      phoneChecked: !this.state.phoneChecked
    });
	} 
		
	editPhoneCheckChange() {
		this.setState({
      userHasDevice: !this.state.userHasDevice
    });
	}
	  	
	activeCheckChange() {
		this.setState({
      userActive: !this.state.userActive
    });
	}
	
  addUser(event) {
    event.preventDefault();
		
    // Find the form field values
    var formData = {} 
    var fields = [ 'phoneNumber','firstName','lastName' ];
    var notification = ReactDOM.findDOMNode(this.refs.snackbar);
    
    //For each field, save to object, then clear 	
    for (i = 0; i < fields.length; i++) {
	    var field = fields[i];
	  	formData[field] = ReactDOM.findDOMNode(this.refs[field]).value.trim();
	  	ReactDOM.findDOMNode(this.refs[field]).value = '';
	  	var parent = [field] + 'Parent';
	  	removeClass(ReactDOM.findDOMNode(this.refs[parent]), 'is-dirty');
	  }
	  
	  //For checkbox save then clear
	  formData.hasDevice = this.state.phoneChecked;
	  this.setState({ phoneChecked: false });
    removeClass(ReactDOM.findDOMNode(this.refs.phoneCheckParent), 'is-checked');
	  
    //Pass data	
    Meteor.call('users.add', formData, Session.get('companyId'), function(err,res) {
	    if (err) {
				notification.MaterialSnackbar.showSnackbar({ message: "Error adding user: " + err.reason });
	    } else {
		    notification.MaterialSnackbar.showSnackbar({ message: "Employee added" });
	    }
    });
 
    //Hide Dialog
    this.setState({
      openDialog: false
    });
  }
  
  editUser(event) {
    event.preventDefault();
    var notification = ReactDOM.findDOMNode(this.refs.snackbar);
			
		//Change Name	
		if (hasClass(ReactDOM.findDOMNode(this.refs.editFirstNameParent), 'is-dirty') || hasClass(ReactDOM.findDOMNode(this.refs.editLastNameParent), 'is-dirty')) {
			
			var userData = {};
			userData.id = this.state.editUser;
			userData.firstName = ReactDOM.findDOMNode(this.refs.editFirstName).value.trim();
			userData.lastName = ReactDOM.findDOMNode(this.refs.editLastName).value.trim();
			
			//Clear fields
			ReactDOM.findDOMNode(this.refs.editfirstName).value = '';
			ReactDOM.findDOMNode(this.refs.editLastName).value = '';
			removeClass(ReactDOM.findDOMNode(this.refs.editFirstNameParent), 'is-dirty');
			removeClass(ReactDOM.findDOMNode(this.refs.editLastNameParent), 'is-dirty');
			
			Meteor.call('users.updateName', userData, function(err,res) {
		    if (err) {
					notification.MaterialSnackbar.showSnackbar({ message: "Name change failed: " + err.error });
		    } else {
			    notification.MaterialSnackbar.showSnackbar({ message: "Changed employee name" });
		    }
			});
								
		}
		
		//Change Number
		if (hasClass(ReactDOM.findDOMNode(this.refs.editPhoneNumberParent), 'is-dirty')) {
			
			var userData = {};
			userData.id = this.state.editUser;
			userData.phoneNumber = ReactDOM.findDOMNode(this.refs.editPhoneNumber).value.trim();
			userData.hasDevice = this.state.userHasDevice;
			ReactDOM.findDOMNode(this.refs.editPhoneNumber).value = '';
			removeClass(ReactDOM.findDOMNode(this.refs.editPhoneNumberParent), 'is-dirty');
			
			Meteor.call('users.updateNumber', userData, function(err,res) {
		    if (err) {
					notification.MaterialSnackbar.showSnackbar({ message: "Number change failed: " + err.error });
		    } else {
			    notification.MaterialSnackbar.showSnackbar({ message: "Updated number" });
		    }
			});
		
		//If user just got the app but didn't change their number, send them the verification PIN
		} else if (this.state.userHadDevice != this.state.userHasDevice) {
			
			var userDetails = _.findWhere(this.props.users, {_id: this.state.editUser});
			
			Meteor.call('users.hasDevice', userDetails, function(err,res) {
		    if (err) {
					notification.MaterialSnackbar.showSnackbar({ message: "Verify phone failed: " + err.error });
		    } else {
			    notification.MaterialSnackbar.showSnackbar({ message: "Verifying phone" });
		    }
			});
			
		}
		
		//Change company status
		if (this.state.userOriginalStatus != this.state.userActive) {
			var userData = {};
			userData.id = this.state.editUser;
			userData.active = this.state.userActive;
			
			Meteor.call('users.changeCompanyState', userData, Session.get('companyId'), function(err,res) {
		    if (err) {
					notification.MaterialSnackbar.showSnackbar({ message: "Employee change failed: " + err.error });
		    } else {
			    notification.MaterialSnackbar.showSnackbar({ message: "Updated employee" });
		    }
			});
				
		}

    //Hide Dialog
    this.setState({
      openDialog: false
    });

  }
  
  changeTime(event) {
	  event.preventDefault();
    var notification = ReactDOM.findDOMNode(this.refs.snackbar);
	  
	  //If start time was edited, change time
	  if (hasClass(ReactDOM.findDOMNode(this.refs.startParent), 'is-dirty')) {
		  
		  //Get data
		  var startTime = ReactDOM.findDOMNode(this.refs.start).value.trim();
			
			//Pass date if valid		  
		  if (Date.create(startTime).isValid()) {
			  Meteor.call('events.changeTime', this.state.timeOnEvent, Date.create(startTime), function(err,res) {
			    if (err) {
						notification.MaterialSnackbar.showSnackbar({ message: "Time change error: " + err.error });
			    } else {
				    notification.MaterialSnackbar.showSnackbar({ message: "Changed start time" });
			    }
	    	}); 
		  } else {
			  notification.MaterialSnackbar.showSnackbar({ message: "Invalid start time" });
		  }
		  
		  // Clear form
			ReactDOM.findDOMNode(this.refs.start).value = '';
			removeClass(ReactDOM.findDOMNode(this.refs.startParent), 'is-dirty');
			
	  }
	  
	  //If end time was edited, change time
	  if (hasClass(ReactDOM.findDOMNode(this.refs.endParent), 'is-dirty')) {
		  
		  //Get data
		  var endTime = ReactDOM.findDOMNode(this.refs.end).value.trim();
		  
		  //Pass date if valid
		  if (Date.create(endTime).isValid()) {			  			
				Meteor.call('events.changeTime', this.state.timeOffEvent, Date.create(endTime), function(err,res) {
			    if (err) {
						notification.MaterialSnackbar.showSnackbar({ message: "Time change error: " + err.error });
			    } else {
				    notification.MaterialSnackbar.showSnackbar({ message: "Changed end time" });
			    }
	    	});  
		  } else {
			  notification.MaterialSnackbar.showSnackbar({ message: "Invalid end time" });
		  }
		  
		  // Clear form
			ReactDOM.findDOMNode(this.refs.end).value = '';
			removeClass(ReactDOM.findDOMNode(this.refs.endParent), 'is-dirty');
	  }
	  
	  //Hide Dialog
    this.setState({
      openDialog: false
    }); 
  }
  
  setJobCode(event) {
    event.preventDefault();
    var notification = ReactDOM.findDOMNode(this.refs.snackbar);

		//Update job code
		if (this.state.jobCodeSelected !== '1' && this.state.jobCodeSelected !== '0') {
	    Meteor.call('events.addJobCode', this.state.codeEvent, this.state.jobCodeSelected, function(err,res) {
		    if (err) {
					notification.MaterialSnackbar.showSnackbar({ message: "Job code error: " + err.error });
					console.log("error ", err);
		    } else {
			    notification.MaterialSnackbar.showSnackbar({ message: "Set job code" });
		    }
	    });
    } else {
	    notification.MaterialSnackbar.showSnackbar({ message: "Invalid job code" });
    }
    
    //Hide Dialog
    this.setState({
      openDialog: false
    });
  }

  
  editRole() {
	//TODO  
  }
  	
	filterUsers(filter) {
		this.setState({
      filter: filter
    });
	}
  
  renderUserDetails() {
		if (this.props.activeUser) {
			
			//Lookup user	
			var activeUserDetails = _.findWhere(this.props.users, {_id: this.props.activeUser});
			
			//Lookup site names
			if (!this.props.sitesLoading) {
				var siteNames = this.props.sites;
			} else {
				var siteNames = [];
			}
			
			//Lookup job codes
			if (!this.props.codesLoading) {
				var jobCodes = this.props.jobCodes;
			} else {
				var jobCodes = [];
			}
			
			return (
				<UserHistory
					activeUserDetails={activeUserDetails}
					closeUser={this.closeUser.bind(this)}
					editUser={this.editUserDialog.bind(this, activeUserDetails)}
					siteNames={siteNames}
					jobCodes={jobCodes}
					showNotification={this.showNotification.bind(this)}
					editJobCode={this.handleOpenDialog.bind(this)}
					editJobTime={this.handleOpenDialog.bind(this)}
				/>
			)
			
						
		} else {
			
			return (
				<div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--6-col mdl-card">
					<div className="mdl-card__title">
		      	<p className="mdl-card__supporting-text text-center">Select a user to view their profile.</p>
		      </div>
	      </div>
			)
			
		} 
	}
  
  renderUsers() {
    
    if (this.props.usersLoading) {
	    
	    return (
		    <div className="text-center">
					<div className="mdl-spinner mdl-js-spinner is-active"></div>
				</div>
	    )
	    
    } else {
	    
    	let filter = this.state.filter;
		  let UserList = this.props.users;
		  return UserList.map((user) => {
			  			  
			  //Set active state
			  var active = (_.findWhere(user.activeCompanies, Session.get('companyId')) != null ) ? true : false;
			  
			  //Set the role to be displayed
			  var role;
			  
			  if (!active) {
				  role = 'inactive';
			  } else if (Roles.userIsInRole(user._id, 'manager', FlowRouter.getParam("companyName"))) {
				  role = 'manager';
			  } else if (Roles.userIsInRole(user._id, 'foreman', FlowRouter.getParam("companyName"))) {
				  role = 'foreman';
			  } else {
				  role = 'worker';
			  }

			  
			  //Filter based on state
				var hideUser = false;
				if (filter === 'workers' && (role === 'foreman' || role === 'manager' || role === 'inactive')) {
					hideUser = true;
				} else if (filter === 'foremen' && (role === 'worker' || role === 'manager' || role === 'inactive')) {
					hideUser = true;
				}
				
				if (!hideUser) {								  
				  //Ensure they have first and last name
				  if (!user.profile) {
					  user.profile = {};
					  user.profile.firstName = 'First';
					  user.profile.lastName = 'Last';
				  }
				  
					//Create URL for each user
					var current = FlowRouter.current();
					var queryParams = {userId: user._id }; 
					var userUrl = FlowRouter.path("employees", current.params, queryParams);	
			
			    return (
			      
			      	<User 
				        key={user._id} 
								user={user} 
								role={role}
								userUrl={userUrl}
								active={active}
							/>
			      
			    );
				}

		  });
    
    }
  }

  render() {
    return (
      <div className="mdl-grid">
	      <div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--5-col mdl-card">
	      	<div className="mdl-card__title">
      			<span><h5 className="mdl-card__title-text">Employees</h5></span>
      			<div className="mdl-layout-spacer"></div>
						<button id="add-user-button" className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" onClick={this.handleOpenDialog.bind(this,'add-user')}>
							Add 
						</button> 
	      	</div>
	      						
					<div className="mdl-tabs mdl-js-tabs">
            <div className="mdl-tabs__tab-bar">
               <a href="#tab1-panel" className="mdl-tabs__tab is-active" onClick={this.filterUsers.bind(this, 'all')}>Everyone</a>
               <a href="#tab1-panel" className="mdl-tabs__tab" onClick={this.filterUsers.bind(this, 'workers')}>Workers</a>
               <a href="#tab1-panel" className="mdl-tabs__tab" onClick={this.filterUsers.bind(this, 'foremen')}>Foremen</a>
            </div>
            <div className="mdl-tabs__panel is-active" id="tab1-panel">
            </div>
            <div className="mdl-tabs__panel" id="tab2-panel">
            </div>
            <div className="mdl-tabs__panel" id="tab3-panel">
            </div>
          </div>
					
						 <ul className="mdl-list">
						 {this.renderUsers()}
						</ul>
			
	      </div>
	      
				{this.renderUserDetails()}
										        
        <div ariaLive="assertive" ariaAtomic="true" ariaRelevant="text" className="mdl-snackbar mdl-js-snackbar" ref="snackbar">
				  <div className="mdl-snackbar__text"></div>
				  <button type="button" className="mdl-snackbar__action"></button>
				</div>
				
				<Dialog ref="addDialog" open={this.state.openDialog}>
					{this.dialogContent()}
        </Dialog>
	      
      </div>
    )
  }
}

UsersPage.propTypes = {
  users: PropTypes.array.isRequired,
  sites: PropTypes.array.isRequired,
  jobCodes: PropTypes.array
};



export default createContainer(() => {
  var handleUsers = Meteor.subscribe('users.company', Session.get('companyId'));
  var handleSites = Meteor.subscribe('sites.names', Session.get('companyId'));
  var codesHandle = Meteor.subscribe('jobcodes', Session.get('companyId'));

  return {
	  usersLoading: !handleUsers.ready(),
    users: Users.find({},{sort: { "profile.firstName": 1 }}).fetch(),
    sitesLoading: !handleSites.ready(),
    sites: Sites.find().fetch(),
    codesLoading: !codesHandle.ready(),
    jobCodes: JobCodes.find().fetch()
  };
}, UsersPage);