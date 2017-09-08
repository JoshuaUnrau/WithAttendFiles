import React, { Component, PropTypes } from 'react';

import { Events } from '../../api/events/events.js';

//Site User Item

export class SiteUser extends Component {
	constructor(props) {
    super(props);
    var checkedStatus = (this.props.siteStatusClass === 'on-site') ? 'checked' : '';
	  this.state = { checked: checkedStatus };
  }
  
	checkOrNot() {
		if (!this.props.active) {
			
			return (
				<span className="mdl-list__item-secondary-content">
		    	<span className="mdl-list__item-secondary-info">{this.props.timeOnSite}</span>
		      <i className="material-icons mdl-color-text--grey">block</i>
		    </span>
			)
			
		} else {
			
			return (
				<span className="mdl-list__item-secondary-content">
					<span className="mdl-list__item-secondary-info">{this.props.timeOnSite}</span>
					<span className="mdl-list__item-secondary-action">
			      <label className="mdl-switch mdl-js-switch" for={this.props.user._id}>
			        <input type="checkbox" id={this.props.user._id} className="mdl-switch__input" onChange={this.checkInOutUser.bind(this)} checked={this.state.checked} />
			      </label>
			    </span>		    
		    </span>
			)
		}
	}
	
  checkInOutUser() {	  
	  var data = {
		  companyId: this.props.companyId,
		  beaconMajor: this.props.beaconMajor,
		  userId: this.props.user._id,
		  time: new Date,
		  createdAt: new Date
	  };
	  
	  switch (this.props.siteStatusClass) {
    case 'off-site':
    	this.props.userAction('off-site', data);
    	this.setState({ checked: 'checked' });
      break;
    case 'on-site':
      this.props.userAction('on-site', data);
      this.setState({ checked: '' });
      break;
    case 'was-on-site':
    	this.props.userAction('was-on-site', data);
    	this.setState({ checked: 'checked' });
    	break;
    default:
			break;
		}
  }
  
	openDialog() {
		this.props.openDialog();
	}
	
	openTimeDialog() {
		this.props.openTimeDialog();
	}
  
	render() {
		const { user, siteStatusClass, foremanStyle, timeRange, timeOnSite, userLink, jobCode, active } = this.props;
		
		var iconClass = "material-icons mdl-list__item-avatar mdl-color--";
		var subClass = (timeRange === "") ? "hidden" : "mdl-list__item-sub-title";
		
	  switch (this.props.siteStatusClass) {
    case 'off-site':
    	iconClass += 'red';
      break;
    case 'on-site':
      iconClass += 'green';
      break;
    case 'was-on-site':
    	iconClass += 'orange';
    	break;
    default:
    	iconClass += 'grey';
			break;
		}
		
		var userClass = "list-item mdl-color-text--grey-"
		userClass += (active) ? "700" : "400";
		
		return (
			<div className="mdl-list__item  mdl-list__item--two-line">
				<span className="mdl-list__item-primary-content">
		      <i className={iconClass}>person</i>
		      <span className={siteStatusClass}><a className={userClass} href={userLink}>{user.profile.firstName.capitalize()} {user.profile.lastName.capitalize()}</a></span>
		      <span className={subClass}><span className="fake-link" onClick={this.openTimeDialog.bind(this)}>{timeRange}</span> &nbsp;|&nbsp; <strong className="fake-link" onClick={this.openDialog.bind(this)}>{jobCode}</strong></span>
		    </span>
		    
		    {this.checkOrNot()}
		    
		  </div>
        
		);	
	}
}

SiteUser.propTypes = {
  user: React.PropTypes.object,
  siteStatusClass: React.PropTypes.string,
  foremanStyle: React.PropTypes.object,
  timeRange: React.PropTypes.string,
  timeOnSite: React.PropTypes.string,
  beaconMajor: React.PropTypes.string,
  companyId: React.PropTypes.string
};