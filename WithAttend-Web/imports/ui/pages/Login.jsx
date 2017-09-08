import React from 'react';
import ReactDOM from 'react-dom';
import { findDOMNode } from 'react-dom';
import { Meteor } from 'meteor/meteor';
 
//Login Page
export class Login extends React.Component {
	
  loginUser(event) {
	  event.preventDefault();
		
    //Login user and console log if error
    //TODO - Pass error properly
    var username = ReactDOM.findDOMNode(this.refs.username).value.trim();
    var password = ReactDOM.findDOMNode(this.refs.password).value.trim();
    var notification = ReactDOM.findDOMNode(this.refs.snackbar);
    
    Meteor.loginWithPassword(username, password, function(error) {
	    if (error) {
		  	notification.MaterialSnackbar.showSnackbar({ message: "Oops: " + error.reason });
	    }
    });
	  
  }
  
  render() {
	  var companyClass = "mdl-card__title brand-" + this.props.company;
	  
    return (
	    
	    <div className="mdl-grid">
	    	<div className="mdl-layout-spacer"></div>
				<div className="mdl-card mdl-shadow--2dp mdl-cell mdl-cell--6-col card-top-space">
					<div className={companyClass}>
						<h2 className="mdl-card__title-text brand-welcome">{this.props.company}</h2>
					</div>
			  	<div className="mdl-card__supporting-text">
						<form action="#" onSubmit={this.loginUser.bind(this)}>
							<div className="mdl-textfield mdl-js-textfield">
								<input className="mdl-textfield__input" type="text" id="username" ref="username" />
								<label className="mdl-textfield__label" for="username">Username</label>
							</div>
							<div className="mdl-textfield mdl-js-textfield">
								<input className="mdl-textfield__input" type="password" id="userpass" ref="password" />
								<label className="mdl-textfield__label" for="userpass">Password</label>
							</div>
							<input type="submit" className="invisibleButton" />
						</form>
						<p className="legal mdl-color-text--gray-400"><small>By Logging In you agree to the <a href="http://withattend.com/legal">Terms & Conditions</a></small></p>
					</div>
					<div className="mdl-card__actions mdl-card--border">
						<button className="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" onClick={this.loginUser.bind(this)}>Log in</button>
					</div>
				</div>
				<div className="mdl-layout-spacer"></div>
				
				<div ariaLive="assertive" ariaAtomic="true" ariaRelevant="text" className="mdl-snackbar mdl-js-snackbar" ref="snackbar">
				  <div className="mdl-snackbar__text"></div>
				  <button type="button" className="mdl-snackbar__action"></button>
				</div>
				
			</div>
				
    )	
  }
}