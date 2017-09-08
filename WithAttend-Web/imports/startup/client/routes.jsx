import React from 'react';
import {mount} from 'react-mounter';

//Import Pages & Layouts
import LoggedInLayout from '../../ui/layouts/LoggedInLayout.jsx';
import {LoggedOutLayout} from '../../ui/layouts/LoggedOutLayout.jsx';
import {Welcome} from '../../ui/pages/Welcome.jsx';
import {NoCompany} from '../../ui/pages/NoCompany.jsx';
import {NoAccess} from '../../ui/pages/NoAccess.jsx';
import {Login} from '../../ui/pages/Login.jsx';
import SitesPage from '../../ui/pages/Sites.jsx';
import SiteDashboard from '../../ui/pages/SiteDashboard.jsx';
import UsersPage from '../../ui/pages/Users.jsx';
import ReportsPage from '../../ui/pages/Reports.jsx';
import JobCodesPage from '../../ui/pages/JobCodes.jsx';
import AdminPage from '../../ui/pages/Admin.jsx';


/* Base URL - could just redirect to marketing page */
FlowRouter.route('/', {
	name: 'noCompany',
	action() {
		mount(LoggedOutLayout, { 
			content: (<NoCompany />) 
		})
	}	 
});

FlowRouter.route('/no-access', {
	name: 'noAccess',
	action() {
		mount(LoggedOutLayout, { 
			content: (<NoAccess />) 
		})
	}	 
});

/* Groups of routes */

//Company Group. Ensure its a valid company.
let company = FlowRouter.group({
	name: 'company',
	prefix: '/c/:companyName',
	triggersEnter: [checkCompany],
});

function checkCompany(context) {
	var company = context.params.companyName;

	//TODO - lookup companies rather than put them in this array
	if (company !== undefined && company !== 'nova' && company !== 'bosa' && company !== 'demo') {
		return FlowRouter.go('noCompany');
	}	
	
}

//Show login page unless user logged in already
company.route('/login', {
	name: 'login',	
	triggersEnter: [function(){
      var route = FlowRouter.current();
      //If logged in, go to the welcome page
      if (Meteor.userId()) {
				return FlowRouter.go('welcome', route.params );      
			}
			//If a redirect isn't set, redirect to welcome after login
			var redirect;
			redirect = Session.get('redirectAfterLogin');
			if (!redirect) {
				Session.set('redirectAfterLogin', FlowRouter.path("welcome", route.params));
			}
	}],
	action(params) {
		mount(LoggedOutLayout, { 
			content: (<Login company={params.companyName} />) 
		})
	}	 
});


//Route Group only accessible to logged in users. Includes sidebar and page title. Redirects if not logged in.
let loggedIn = company.group({
	name: 'loggedIn',
	triggersEnter: [function(context){
      if (!(Meteor.loggingIn() || Meteor.userId())) {
        //Remember the page they want to access and redirect after login (unless it was the login or logout page)
        if (context.route.name !== 'login' && context.route.name !== 'logout') {
          Session.set('redirectAfterLogin', context.path);
        }
				//TODO - add a query parameter & let the user know they need to login to see that URL
				return FlowRouter.go('login', context.params );
			}
	}]
});

//Default landing page after logging in
loggedIn.route('/', {
	name: 'welcome',
	action() {
		mount(LoggedInLayout, { 
			content: (<Welcome />)
		})
	}	 
});

//Logout
loggedIn.route('/logout', {
  name: 'logout',
  action(params) {
    return Meteor.logout(function() {
      return FlowRouter.go('login', params);
    });
  }
});

//Sites Home
loggedIn.route('/sites', {
	name: 'sites',
	action() {
		mount(LoggedInLayout, { 
			content: (<SitesPage />)
		})
	}	 
});

//TODO - Check if user can see this site
loggedIn.route('/sites/:siteId', {
	name: 'siteDashboard',
	action() {
		mount(LoggedInLayout, { 
			content: (<SiteDashboard activeUser={FlowRouter.getQueryParam("userId")} />) 
		})
	}	 
});

loggedIn.route('/employees', {
	name: 'employees',
	action() {
		mount(LoggedInLayout, { 
			content: (<UsersPage activeUser={FlowRouter.getQueryParam("userId")} />) 
		})
	}	 
});

//TODO - Check if user can see the reports
loggedIn.route('/reports', {
	name: 'reports',
	action() {
		mount(LoggedInLayout, { 
			content: (<ReportsPage />) 
		})
	}	 
});

loggedIn.route('/job-codes', {
	name: 'settings',
	action() {
		mount(LoggedInLayout, { 
			content: (<JobCodesPage />) 
		})
	}	 
});

//Admin for us
loggedIn.route('/admin', {
	name: 'admin',
	action() {
		mount(LoggedInLayout, { 
			content: (<AdminPage />) 
		})
	}	 
});


//TODO - 404
/*
FlowRouter.notFound = {
	name: '404',
	action() {
		mount(LoggedOutLayout, { 
			content: (<FourOhFour />) 
		})
	}	 
};
*/