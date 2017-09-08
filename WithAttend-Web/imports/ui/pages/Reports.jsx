import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { findDOMNode } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import removeClass from 'react-kit/removeClass';
import hasClass from 'react-kit/hasClass';
import dialogPolyfill from 'dialog-polyfill';

import "dialog-polyfill/dialog-polyfill.css";

import Dialog from '../components/Dialog.jsx';
 
//Report Page
class ReportsPage extends Component {
	constructor(props) {
    super(props);
    this.state = { 
	    openDialog: false,
	    startDate: Date.create('15 days ago').beginningOfDay(),
	    endDate: Date.create('1 day ago').endOfDay()
	  };
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
  }
  
  componentDidMount() { 
    const dialog = ReactDOM.findDOMNode(this.refs.setDate);
    // avoid chrome warnings and update only on unsupported browsers
		if (!dialog.showModal) {
			dialogPolyfill.registerDialog(dialog);
		}
  }
  
  componentDidUpdate() {
		// This upgrades all upgradable components (i.e. with 'mdl-js-*' class)
    componentHandler.upgradeDom();
  }	
  
	downloadCSV(csv) {
		//Generate 
		var csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
		var csvName = "payroll_report-" + Date.create(this.state.startDate).format(Date.ISO8601_DATE) + "_to_" + Date.create(this.state.endDate).format(Date.ISO8601_DATE) +  ".csv";

		//IE11 & Edge
		if (navigator.msSaveBlob) {
		    navigator.msSaveBlob(csvData, csvName);
		} else {
		    //In FF link must be added to DOM to be clicked
		    var link = document.createElement('a');
		    link.href = window.URL.createObjectURL(csvData);
		    link.setAttribute('download', csvName);
		    document.body.appendChild(link);    
		    link.click();
		    document.body.removeChild(link);    
		}
	}
	
	buildCSV() {		
		var self = this;
		var notification = ReactDOM.findDOMNode(this.refs.snackbar);
		
		//Ask for Data
		Meteor.call('events.getReportData', this.state.startDate, this.state.endDate, Session.get('companyId'), function(err,res) {
	    if (err) {
				notification.MaterialSnackbar.showSnackbar({ message: "Report error: " + err.error });
	    } else {
		    notification.MaterialSnackbar.showSnackbar({ message: "Report successfully created" });
				var csv = Papa.unparse(res);
				self.downloadCSV(csv);
	    }
    });
	}
  
  handleOpenDialog() {
    this.setState({
      openDialog: true
    });
  }	

  handleCloseDialog() {
    this.setState({
      openDialog: false
    });
  }
  
  setDate(event) {
	  event.preventDefault(); 
	  var notification = ReactDOM.findDOMNode(this.refs.snackbar);
	  
	   //If start date was edited, change date
	  if (hasClass(ReactDOM.findDOMNode(this.refs.startParent), 'is-dirty')) {
		  
		  //Get data
		  var start = ReactDOM.findDOMNode(this.refs.start).value.trim();
			
			//Pass date if valid		  
		  if (Date.create(start).isValid() && Date.create(start).isBefore('today')) {
				this.setState({ startDate: Date.create(start).beginningOfDay() }); 
				notification.MaterialSnackbar.showSnackbar({ message: "Start date changed" });
		  } else {
			  notification.MaterialSnackbar.showSnackbar({ message: "Invalid start date" });
		  }
		  
		  // Clear form
			ReactDOM.findDOMNode(this.refs.start).value = '';
			removeClass(ReactDOM.findDOMNode(this.refs.startParent), 'is-dirty');
			
	  }
	  
	  
	  //If end date was edited, change date
	  if (hasClass(ReactDOM.findDOMNode(this.refs.endParent), 'is-dirty')) {
		  
		  //Get data
		  var end = ReactDOM.findDOMNode(this.refs.end).value.trim();
		 
		  //Pass date if valid
		  if (Date.create(end).isValid() && Date.create(start).isBefore('tomorrow')) {
			  this.setState({ endDate: Date.create(end).endOfDay() });
			  notification.MaterialSnackbar.showSnackbar({ message: "End date changed" });
		  } else {
			  notification.MaterialSnackbar.showSnackbar({ message: "Invalid end date" });
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
    
    var start = Date.create(this.state.startDate).short();
    var end = Date.create(this.state.endDate).short();
    var browserAlertClass = (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) ? "browser-alert text-center" : "hidden";
    
    return (
      <div className="mdl-grid">
		    <div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--5-col mdl-card">
		    	<div className="mdl-card__title">
      			<span><h5 className="mdl-card__title-text">Payroll Reports</h5></span>
					</div>
					
					<div className={browserAlertClass}>
						<p className="no-bottom-margin">Note: Payroll download works best on the Chrome or Firefox browsers.</p>
					</div>
					
					<div className="mdl-card__supporting-text">
						Choose your dates and click 'Download Report' below to get your payroll report.<br /><br />
						
						<span>Period: {start} to {end}&nbsp;&nbsp;</span><span><button className="mdl-button mdl-js-button" onClick={this.handleOpenDialog.bind(this)}>Change</button></span><br /><br />

						<button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" onClick={this.buildCSV.bind(this)}>Download Report</button>
			  	</div>
			  </div>
			  			    
		    <div ariaLive="assertive" ariaAtomic="true" ariaRelevant="text" className="mdl-snackbar mdl-js-snackbar" ref="snackbar">
			  	<div className="mdl-snackbar__text"></div>
					<button type="button" className="mdl-snackbar__action"></button>
				</div>
			    
			  			  
			  <Dialog ref="setDate" open={this.state.openDialog}>
		    	<h4 className="mdl-dialog__title">Change Report Dates</h4>
	        <div className="mdl-dialog__content">
			      <form className="add-event"  onSubmit={this.setDate.bind(this)}>
	            <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" ref="startParent">
						    <input className="mdl-textfield__input" type="text" id="start" ref="start" />
						    <label className="mdl-textfield__label" for="start">{start}</label>
						  </div>
						  <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" ref="endParent">
						    <input className="mdl-textfield__input" type="text" id="end" ref="end" />
						    <label className="mdl-textfield__label" for="end">{end}</label>
						  </div>
						  
						  <input type="submit" className="invisibleButton" />
						  
	          </form>
			    </div>

			    <div className="mdl-dialog__actions">
			      <button type="button" className="mdl-button" onClick={this.setDate.bind(this)}>Change Dates</button>
			      <button type="button" className="mdl-button close" onClick={this.handleCloseDialog}>Cancel</button>
			    </div>
		    </Dialog>
			  
      </div>
    )
  }
}

export default createContainer(() => {
	
  //Check if user can access
  var userAllowed = false;
  userAllowed = Roles.userIsInRole(Meteor.userId(), ['manager', 'admin'], FlowRouter.getParam("companyName"));

  return {
    userAllowed: userAllowed
  };
}, ReportsPage);
