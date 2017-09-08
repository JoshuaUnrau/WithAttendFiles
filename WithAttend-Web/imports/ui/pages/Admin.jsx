import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { findDOMNode } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Users } from '../../api/users/users.js';
import { Sites } from '../../api/sites/sites.js'; 
import { Companies } from '../../api/companies/companies.js';

 
//Admin Page
class AdminPage extends Component {
  
  addSite(event) {
    event.preventDefault();

    // Find the text field values
    var formData = {}
    
    formData.name = ReactDOM.findDOMNode(this.refs.siteName).value.trim();
    formData.location = ReactDOM.findDOMNode(this.refs.location).value.trim();
    formData.beaconMajor = ReactDOM.findDOMNode(this.refs.beaconMajor).value.trim();
		formData.image = ReactDOM.findDOMNode(this.refs.image).value.trim();
		formData.activeCompanies = [];
		formData.inactiveCompanies = [];
    Meteor.call('sites.add', formData);

    // Clear form
    ReactDOM.findDOMNode(this.refs.siteName).value = '';
    ReactDOM.findDOMNode(this.refs.location).value = '';
    ReactDOM.findDOMNode(this.refs.beaconMajor).value = '';
    ReactDOM.findDOMNode(this.refs.image).value = '';
  }
  
  addCompany(event) {
    event.preventDefault();

    // Find the text field values
    var formData = {} 
    
    formData.name = ReactDOM.findDOMNode(this.refs.name).value.trim();
    formData.title = ReactDOM.findDOMNode(this.refs.title).value.trim();
    formData.logo = ReactDOM.findDOMNode(this.refs.logo).value.trim();
				
    Meteor.call('companies.add', formData);

    // Clear form
    ReactDOM.findDOMNode(this.refs.name).value = '';
    ReactDOM.findDOMNode(this.refs.title).value = '';
    ReactDOM.findDOMNode(this.refs.logo).value = '';
  }
  
  addSiteToCompany(siteId) {	  
	  Meteor.call('sites.addCompany', Session.get('companyId'), siteId);
		//console.log("disabled for now, just used to add some sites to a company");
  }
  
  
  validatePin(event) {
		event.preventDefault();

    //Get Pin
    var pin = ReactDOM.findDOMNode(this.refs.pin).value.trim();
				
		//Check Pin		
    Meteor.call('pinCodes.validate', pin, function(err,res) {
	    if (err) {
		    console.log("Pin code error. Details: ", err);
	    } else {
		    console.log("User validated: ", res);
	    }
    });

    // Clear form
    ReactDOM.findDOMNode(this.refs.pin).value = '';
	}
	
	onSiteCheck(event) {
		event.preventDefault();

    //Get Pin
    var userId = ReactDOM.findDOMNode(this.refs.id).value.trim();
				
		//Check Pin		
    Meteor.call('events.isUserOnSite', userId, function(err,res) {
	    if (err) {
		    console.log("Error. Details: ", err);
	    } else {
		    console.log("User is on site: ", res);
	    }
    });

    // Clear form
    ReactDOM.findDOMNode(this.refs.id).value = '';
	}
	
	makeUserForeman(event) {
		event.preventDefault();

    //Get userId
    var userId = ReactDOM.findDOMNode(this.refs.foremanUserId).value.trim();
    Meteor.call('users.addRole', userId, 'foreman', Session.get("companyName"), function(err,res) {
	    if (err) {
		    console.log("Error. Details: ", err);
	    } else {
		    console.log("Made user foreman");
	    }
    });

    // Clear form
    ReactDOM.findDOMNode(this.refs.foremanUserId).value = '';
	}
	
  makeUserManager(event) {
		event.preventDefault();

    //Get userId
    var userId = ReactDOM.findDOMNode(this.refs.managerUserId).value.trim();
    Meteor.call('users.addRole', userId, 'manager', Session.get("companyName"), function(err,res) {
	    if (err) {
		    console.log("Error. Details: ", err);
	    } else {
		    console.log("Made user manager");
	    }
    });

    // Clear form
    ReactDOM.findDOMNode(this.refs.managerUserId).value = '';
	}
	
	makeUserAdmin(event) {
		event.preventDefault();

    //Get userId
    var userId = ReactDOM.findDOMNode(this.refs.adminUserId).value.trim();
    Meteor.call('users.addRole', userId, 'admin', Roles.GLOBAL_GROUP, function(err,res) {
	    if (err) {
		    console.log("Error. Details: ", err);
	    } else {
		    console.log("Made user admin");
	    }
    });

    // Clear form
    ReactDOM.findDOMNode(this.refs.adminUserId).value = '';
	}
	
	removeRoles(event) {
		event.preventDefault();

    //Get userId
    var userId = ReactDOM.findDOMNode(this.refs.removeUserId).value.trim();
    Meteor.call('users.removeRoles', userId, Session.get("companyName"), function(err,res) {
	    if (err) {
		    console.log("Error. Details: ", err);
	    } else {
		    console.log("Removed user from roles");
	    }
    });
    
    // Clear form
    ReactDOM.findDOMNode(this.refs.removeUserId).value = '';
	}
	
  changePassword(event) {
		event.preventDefault();

    //Get userId
    var userId = ReactDOM.findDOMNode(this.refs.pwUserId).value.trim();
    var newPassword = ReactDOM.findDOMNode(this.refs.newPassword).value.trim();
    Meteor.call('users.changePassword', userId, newPassword, function(err,res) {
	    if (err) {
		    console.log("Error. Details: ", err);
	    } else {
		    console.log("Changed password");
	    }
    });
    
    // Clear form
    ReactDOM.findDOMNode(this.refs.pwUserId).value = '';
    ReactDOM.findDOMNode(this.refs.newPassword).value = '';
	}
  
  renderSites() {
    let SiteList = this.props.sites;
	  
    return SiteList.map((site) => {
			
      return (
	      <li className="mdl-list__item mdl-list__item--two-line" key={site._id}>
	        <span className="mdl-list__item-primary-content">
	          <span>{site.name}</span>
	          <span className="mdl-list__item-sub-title">{site.location}</span>
	        </span>
	      </li>
      );
    });
  }
  
  renderCompanies() {
    let CompanyList = this.props.companies;
	  
    return CompanyList.map((company) => {
			
      return (
	      <li className="mdl-list__item mdl-list__item--two-line" key={company._id}>
	        <span className="mdl-list__item-primary-content">
	          <span>{company.name}</span>
	        </span>
	      </li>
      );
    });
  }
  
  render() {
	  
	  if (!this.props.userAllowed) {
		  return (
			  <div className="mdl-grid">
		      <div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--5-col mdl-card">
		      	<div className="text-center">
		      		Not allowed.
		      	</div>
		      </div>
	      </div>

		  )
	  }
	  
    return (
      <div className="mdl-grid">
	      <div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--5-col mdl-card">
	      	<div className="mdl-card__title">
	      		<h5 className="mdl-card__title-text">All Sites</h5>
	      	</div>
	
					<ul className="mdl-list">
						{this.renderSites()}
					</ul>
					
	        <form className="add-site" onSubmit={this.addSite.bind(this)} >
	          <input
	            type="text"
	            ref="siteName"
	            placeholder="Site Name"
	          />
	          <input
	            type="text"
	            ref="location"
	            placeholder="Location"
	          />
	          <input
	            type="text"
	            ref="beaconMajor"
	            placeholder="Beacon Major"
	          />
	          <input
	            type="text"
	            ref="image"
	            placeholder="Image"
	          />
	          <button type="submit">Add Site</button>
	        </form>
			
	      </div>
	      
	      <div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--5-col mdl-card">
	      	<div className="mdl-card__title">
	      		<h5 className="mdl-card__title-text">All Companies</h5>
	      	</div>
	
					<ul className="mdl-list">
						{this.renderCompanies()}
					</ul>
	        
	        <form className="add-company" onSubmit={this.addCompany.bind(this)} >
	          <input
	            type="text"
	            ref="name"
	            placeholder="Company Name"
	          />
	          <input
	            type="text"
	            ref="title"
	            placeholder="Company Title"
	          />
	          <input
	            type="text"
	            ref="logo"
	            placeholder="Logo"
	          />
	          <button type="submit">Add Company</button>
	        </form>
			
	      </div>
	      
	      
	      <div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--5-col mdl-card">
		      <div className="mdl-card__title">
		      		<h5 className="mdl-card__title-text">Pin Test</h5>
		      	</div>
					<form className="validate-pin" onSubmit={this.validatePin.bind(this)} >
	          <input
	            type="text"
	            ref="pin"
	            placeholder="Pin Code"
	          />
						<button type="submit">Validate Pin</button>
	        </form>	
				</div>
				
				<div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--5-col mdl-card">
		      <div className="mdl-card__title">
		      		<h5 className="mdl-card__title-text">Is user on site</h5>
		      	</div>
					<form className="user-on-site" onSubmit={this.onSiteCheck.bind(this)} >
	          <input
	            type="text"
	            ref="id"
	            placeholder="User Id"
	          />
						<button type="submit">Check</button>
	        </form>	
				</div>
				
				<div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--5-col mdl-card">
		      <div className="mdl-card__title">
		      		<h5 className="mdl-card__title-text">Change user status</h5>
		      	</div>
					<form className="user-to-foreman" onSubmit={this.makeUserForeman.bind(this)} >
	          <input
	            type="text"
	            ref="foremanUserId"
	            placeholder="User Id"
	          />
						<button type="submit">Set to Foreman</button>
	        </form>	
	        
	        <form className="user-to-manager" onSubmit={this.makeUserManager.bind(this)} >
	          <input
	            type="text"
	            ref="managerUserId"
	            placeholder="User Id"
	          />
						<button type="submit">Set to Manager</button>
	        </form>	
	        
	        <form className="user-to-admin" onSubmit={this.makeUserAdmin.bind(this)} >
	          <input
	            type="text"
	            ref="adminUserId"
	            placeholder="User Id"
	          />
						<button type="submit">Set to Admin</button>
	        </form>	
	        
	        <form className="user-clear-roles" onSubmit={this.removeRoles.bind(this)} >
	          <input
	            type="text"
	            ref="removeUserId"
	            placeholder="User Id"
	          />
						<button type="submit">Clear Roles</button>
	        </form>	
	        
				</div>
				
				<div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--5-col mdl-card">
		      <div className="mdl-card__title">
		      		<h5 className="mdl-card__title-text">Change user password</h5>
		      	</div>
					<form className="user-on-site" onSubmit={this.changePassword.bind(this)} >
	          <input
	            type="text"
	            ref="pwUserId"
	            placeholder="User Id"
	          />
	          <input
	            type="password"
	            ref="newPassword"
	            placeholder="New Password"
	          />
						<button type="submit">Change Password</button>
	        </form>	
				</div>
				
	    </div>
    )
  }
}

AdminPage.propTypes = {
  sites: PropTypes.array.isRequired,
  companies: PropTypes.array.isRequired
};



export default createContainer(() => {
  Meteor.subscribe('sites.all', Session.get("companyName"));
  Meteor.subscribe('companies');
  
  //Check if user can access
  var userAllowed = false;
  userAllowed = Roles.userIsInRole(Meteor.userId(), ['admin'], Roles.GLOBAL_GROUP);

  return {
    sites: Sites.find({},{sort: { name: 1 }}).fetch(),
    companies: Companies.find({},{sort: { name: 1 }}).fetch(),
    userAllowed: userAllowed
  };
}, AdminPage);