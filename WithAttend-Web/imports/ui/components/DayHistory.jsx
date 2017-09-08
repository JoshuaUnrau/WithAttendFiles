import React, { Component, PropTypes } from 'react';

export class DayHistory extends Component {
	
	triggerChangeJobCode() {
		this.props.changeJobCode();
	}
	
	triggerChangeTime() {
		this.props.changeJobTime();
	}
	
	render() {
		const { date, startTime, endTime, siteName, hoursWorked, jobCode } = this.props;
				
		return (
			
			<div className="mdl-list__item mdl-list__item--two-line day-history">
	    	<span className="mdl-list__item-primary-content">
		      <span>{date}</span>
		      <span className="mdl-list__item-sub-title"><span className="fake-link" onClick={this.triggerChangeTime.bind(this)}>{startTime} - {endTime}</span> <span className="hideMobile">@</span><br className="showMobile" /> {siteName} <span className="fake-link" onClick={this.triggerChangeJobCode.bind(this)}>({jobCode})</span></span>
		    </span>
		    <span className="mdl-list__item-secondary-content">
		      <span className="mdl-list__item-secondary-info">{hoursWorked}</span>
		    </span>
	    </div>
       
		)	
	}
}

DayHistory.propTypes = {
  date: React.PropTypes.string,
  startTime: React.PropTypes.string,
  endTime: React.PropTypes.string,
  siteName: React.PropTypes.string,
  hoursWorked: React.PropTypes.string,
};