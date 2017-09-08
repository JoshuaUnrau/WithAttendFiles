import React, { Component, PropTypes } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { PageTitle } from '../components/PageTitle.jsx';
import { createContainer } from 'meteor/react-meteor-data';

import { Sites } from '../../api/sites/sites.js'; 
import { Companies } from '../../api/companies/companies.js'; 
 
//Container for all logged in pages
export class LoggedInLayoutPage extends Component {
  render() {    
    
    if (!this.props.role) {
	    return (
		    <div className="mdl-layout__container">
		    </div>
	    )
    }
    
    return (
      <div className="mdl-layout__container">
      	
	      <div className="mdl-layout mdl-js-layout mdl-layout--fixed-drawer mdl-layout--fixed-header">
	      
	      <PageTitle pageTitle={this.props.title} />
				
				<Sidebar 
					company={this.props.company} 
					companyData={this.props.companyData}
					companyLoading={this.props.companyLoading}
					role={this.props.role}
				/>
				
	      <main className="mdl-layout__content mdl-color--grey-100">
	        {this.props.content}
	      </main>
	    </div>
        
    </div>
    )
  }
}

LoggedInLayoutPage.propTypes = {
  //Which elements are needed
  content: PropTypes.element,
  title: PropTypes.string
};

export default LoggedInLayout = createContainer( props => {
		
	//Determine page title & get site info
	var title;
	var siteHandle = Meteor.subscribe('sites.names', FlowRouter.getParam("companyName"));
	
	//TODO - Fix page title when load site dashboard directly
	if (FlowRouter.getRouteName() === 'siteDashboard') {
		var siteId = FlowRouter.getParam("siteId");
		site = Sites.find({ _id: siteId}).fetch();
		title = (!siteHandle.ready() || _.isEmpty(site)) ? "" : site[0].name.capitalize(true);		
	}	else {
		title = FlowRouter.getRouteName().capitalize(true);
	}

	//Get User Role
	var role = false;
	if (Roles.userIsInRole(Meteor.userId(), 'manager', FlowRouter.getParam("companyName"))) {
		role = 'manager';
	} else if (Roles.userIsInRole(Meteor.userId(), 'foreman', FlowRouter.getParam("companyName"))) {
		role = 'foreman';
	} else if (Roles.userIsInRole(Meteor.userId(), 'admin', Roles.GLOBAL_GROUP)) {
		role = 'admin';
	}
	
	var company = '';
	if (FlowRouter.getParam("companyName")) {
		company = FlowRouter.getParam("companyName").capitalize(true);
	}
	
	//Get Company info
	var companyHandle = Meteor.subscribe('companies.one', FlowRouter.getParam("companyName"));
	var companyLoading = !companyHandle.ready();
	companyData = Companies.findOne();
	
	if (!companyLoading) {
		Session.set('companyId', companyData._id );
		Session.set('companyName', companyData.name );
	}

	//Return all, only use what is needed on that page
	return {
		title,
		company,
		companyData,
		companyLoading: !companyHandle.ready(),
		role
	}
	
}, LoggedInLayoutPage);