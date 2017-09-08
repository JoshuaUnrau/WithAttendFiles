import { Accounts } from 'meteor/accounts-base';
 

Accounts.onLogin(function() {  
   
  //When user logs in redirect to the welcome page, or the page they were trying to access
  var redirect;
  redirect = Session.get('redirectAfterLogin');
  if (redirect != null) {
    if (redirect !== '/login') {
      return FlowRouter.go(redirect);
    }
  }

});