import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { findDOMNode } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import dialogPolyfill from 'dialog-polyfill';

import "dialog-polyfill/dialog-polyfill.css";

import Dialog from '../components/Dialog.jsx';

import { Users } from '../../api/users/users.js'; 
import { Sites } from '../../api/sites/sites.js'; 
import { Companies } from '../../api/companies/companies.js';

 
// App component - represents the whole app
class SitesPage extends Component {
	constructor(props) {
    super(props);
    this.state = { 
	    openDialog: false,
	    siteId: false,
	    foremanSelected: false
	  };
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
  }
  
  componentDidUpdate() {
	  //Only run once the dialog is loaded
	  if (!this.props.siteLoading) {
	    const dialog = ReactDOM.findDOMNode(this.refs.addDialog);
	    // avoid chrome warnings and update only on unsupported browsers
			if (! dialog.showModal) {
				dialogPolyfill.registerDialog(dialog);
			}
		}
		// This upgrades all upgradable components (i.e. with 'mdl-js-*' class)
    componentHandler.upgradeDom();
  }  

  
  dialogContent() {
  	
  	return (
    	<div>
	    	<h4 className="mdl-dialog__title">Change Site Foreman</h4>
	      <div className="mdl-dialog__content">
		      
		      <h5>Current Site Foremen</h5>
	      	<div className="mdl-list">
	      		{this.siteForemen()}
	      	</div>

		      
		      <h5>Add Foreman to Site</h5>						          	
	        <select value={this.state.foremanSelected} onChange={this.foremanChanged.bind(this)}>
	          <option value="0" disabled>Select from list</option>
						{this.foremenList()}
	        </select>
	        <button type="button" className="mdl-button" onClick={this.addForeman.bind(this)}>Add</button>
		    </div>
		    <div className="mdl-dialog__actions">
		      <button type="button" className="mdl-button" onClick={this.handleCloseDialog}>Ok</button>
		    </div>
	    </div>
		)
  }
  
  handleCloseDialog() {
    this.setState({
      openDialog: false
    });
  }
  
  handleOpenDialog(siteId) {
	  this.setState({
	  	openDialog: true,
	  	siteId: siteId
	 	});
	}

	foremanChanged(event) {
		this.setState({
      foremanSelected: event.target.value
    });
	}
	
	foremenList() {
		if (this.props.foremenLoading) {
			
			return(
				<option value="" disabled>Foremen loading ...</option>
			)
			
		} else {
			
			//Get the job codes and display in the list
			let foremen = this.props.foremen;
	    return foremen.map((foreman) => {
	      return (
		      <option key={foreman._id} value={foreman._id}>{foreman.profile.firstName} {foreman.profile.lastName}</option>
		      )
			});
		}
	}  
	
	siteForemen() {
		//Find list of all siteforemen
		var siteForemen = Users.find({  foremanSites: this.state.siteId }).fetch();

		if (_.isEmpty(siteForemen)) {
			
			return (
		    	<div className="mdl-list__item">
		    	  <span className="mdl-list__item-primary-content">
				      <span>No foremen set</span>
				    </span>
		    	</div>
			)
			
		} else {
			
			return siteForemen.map((foreman) => {
	      return (
		    	<div className="mdl-list__item" key={foreman._id}>
		    	  <span className="mdl-list__item-primary-content">
				      <span>{foreman.profile.firstName} {foreman.profile.lastName}</span>
				    </span>
				    <a className="mdl-list__item-secondary-action" href="" onClick={this.removeForeman.bind(this,foreman._id)}>
				    	<i className="material-icons">clear</i>
				    </a>
		    	</div>
		    )
		  });

	  }
	}	
	 
  addForeman() {
		var notification = ReactDOM.findDOMNode(this.refs.snackbar);

		//Add foreman to site
		if (this.state.foremanSelected !== '1' && this.state.foremanSelected !== '0') {
	    Meteor.call('users.addForeman', this.state.siteId, this.state.foremanSelected, function(err,res) {
		    if (err) {
					notification.MaterialSnackbar.showSnackbar({ message: "Error: " + err.error });
		    } else {
			    notification.MaterialSnackbar.showSnackbar({ message: "Foreman added to site" });
		    }
	    });
    } else {
	    notification.MaterialSnackbar.showSnackbar({ message: "Invalid foreman" });
    }
  }
  
  removeForeman(foremanId) {
	 	var notification = ReactDOM.findDOMNode(this.refs.snackbar);

		//Add foreman to site
    Meteor.call('users.removeForeman', this.state.siteId, foremanId, function(err,res) {
	    if (err) {
				notification.MaterialSnackbar.showSnackbar({ message: "Error: " + err.error });
	    } else {
		    notification.MaterialSnackbar.showSnackbar({ message: "Foreman removed from site" });
	    }
    });
  }
  
  renderSites() {
    
    if (this.props.sitesLoading) {
	    
	    return (
			  <div className="text-center">
					<div className="mdl-spinner mdl-js-spinner is-active"></div>
				</div>
		  )
	    
    } else {

	    let SiteList = this.props.sites;
	    var foreman = (Roles.userIsInRole(Meteor.userId(), 'foreman', Session.get('companyName'))) ? true : false;
	    var foremanSites = [];
	    if (foreman) {
		    var user = Users.findOne({_id:Meteor.userId()},{foremanSites:1});
		    if (!_.isEmpty(user.foremanSites)) {
			    foremanSites = user.foremanSites;
		    }
	    }
		  
	    return SiteList.map((site) => {
					
				//Create URL for each site
				const params = {companyName: FlowRouter.getParam("companyName"), siteId: site._id };
				const siteUrl = FlowRouter.path("siteDashboard", params);
				
				var manageClass = foreman ? "hidden" : "mdl-list__item-secondary-action mdl-color-text--grey-600 fake-link";
				
				//Filter at this level -> TODO filter at publish level
				if (!foreman || _.contains(foremanSites, site._id)) {
					return (
			      <div className="mdl-list__item mdl-list__item--two-line" key={site._id}>
			        <span className="mdl-list__item-primary-content">
			          <span><a className="mdl-color-text--grey-700 list-item" href={siteUrl}>{site.name}</a></span>
			          <span className="mdl-list__item-sub-title">{site.location}</span>
			        </span>
			        <span onClick={this.handleOpenDialog.bind(this, site._id)} className={manageClass}>Manage</span>
			      </div>
		      )
				}
	    });
	  }
	  
  }

  render() {
    return (
      <div className="mdl-grid">
	      <div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--5-col mdl-card">
	      	<div className="mdl-card__title">
	      		<h5 className="mdl-card__title-text">Sites</h5>
	      	</div>
	
					<ul className="mdl-list">
						{this.renderSites()}
					</ul>
					   			
	      </div>
	      
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

SitesPage.propTypes = {
  sites: PropTypes.array.isRequired,
  foremen: PropTypes.array
};


export default createContainer(() => {
  //Get all the foremen
  var foremenHandle = Meteor.subscribe('users.foremen', Session.get('companyName'));
  var sitesHandle = Meteor.subscribe('sites', Session.get('companyId'));

  return {
    sites: Sites.find({},{sort: { name: 1 }}).fetch(),
    sitesLoading: !sitesHandle.ready(),
    foremen: Users.find({},{sort: { name: 1 }}).fetch(),
    foremenLoading: !foremenHandle.ready()
  };
}, SitesPage);