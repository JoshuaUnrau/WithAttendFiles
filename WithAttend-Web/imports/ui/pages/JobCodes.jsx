import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { findDOMNode } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import dialogPolyfill from 'dialog-polyfill';

import "dialog-polyfill/dialog-polyfill.css";

import Dialog from '../components/Dialog.jsx';

import { JobCodes } from '../../api/jobCodes/jobCodes.js'; 
 
// App component - represents the whole app
class JobCodesPage extends Component {
	constructor(props) {
    super(props);
    this.state = { openDialog: false };
    this.handleOpenDialog = this.handleOpenDialog.bind(this);
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
  }
  
  componentDidMount() { 
    const dialog = ReactDOM.findDOMNode(this.refs.addDialog);
    // avoid chrome warnings and update only on unsupported browsers
		if (!dialog.showModal) {
			dialogPolyfill.registerDialog(dialog);
		}
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
  	
	addJobCode(event) {
		event.preventDefault();
		
		var formData = {}
		
		//Get Form Data
    formData.name = ReactDOM.findDOMNode(this.refs.name).value.trim();
    formData.code = parseInt(ReactDOM.findDOMNode(this.refs.code).value.trim());
    formData.companyId = Session.get("companyId");
				
		//Check Pin		
    Meteor.call('jobCodes.add', formData, function(err,res) {
	    if (err) {
		    console.log("Error adding code: ", err);
	    } else {
		    console.log("Added Code: ", res);
	    }
    });

    //Clear form
    ReactDOM.findDOMNode(this.refs.name).value = '';
    ReactDOM.findDOMNode(this.refs.code).value = '';
    
    //Hide Dialog
    this.setState({
      openDialog: false
    });			
	}	
		
	jobCodeList() {
		//Print the job codes
		if (this.props.jobCodesLoading) {
			
			return (
				<div className="text-center">
					<div className="mdl-spinner mdl-js-spinner is-active"></div>
				</div>
			)
			
		} else {
			let jobCodes = this.props.jobCodes;
			return jobCodes.map((jobCode) => {
						
				return (
					<li className="mdl-list__item" key={jobCode._id}>
						<span className="mdl-list__item-primary-content">
							{jobCode.code}: {jobCode.name}
						</span>
					</li>
				)
			
			});
		}		
	}

  render() {
    return (
      <div className="mdl-grid">
	      <div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--5-col mdl-card">
	      	<div className="mdl-card__title">
	      			<span><h5 className="mdl-card__title-text">Job Codes</h5></span>
	      			<div className="mdl-layout-spacer"></div>
							<button id="add-user-button" className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" onClick={this.handleOpenDialog}>
								Add Code 
							</button> 
	      	</div>
 						<ul className="mdl-list">
							{this.jobCodeList()}
						</ul>
	      </div>
	      
  			<Dialog ref="addDialog" open={this.state.openDialog}>
          <h4 className="mdl-dialog__title">Add Code</h4>
          <div className="mdl-dialog__content">
			      <form className="add-user" onSubmit={this.addJobCode.bind(this)}>
	            <div className="mdl-textfield mdl-js-textfield" ref="phoneNumberParent">
						    <input className="mdl-textfield__input" type="text" id="name" ref="name" />
						    <label className="mdl-textfield__label" for="name">Code Name</label>
						  </div>
							<div className="mdl-textfield mdl-js-textfield" ref="firstNameParent">
						    <input className="mdl-textfield__input" type="number" id="code" ref="code" />
						    <label className="mdl-textfield__label" for="code">Code Number</label>
						  </div>
						  
						  <input type="submit" className="invisibleButton" />
						  
	          </form>
			    </div>
			    <div className="mdl-dialog__actions">
			      <button type="button" className="mdl-button" onClick={this.addJobCode.bind(this)}>Create Code</button>
			      <button type="button" className="mdl-button close" onClick={this.handleCloseDialog}>Cancel</button>
			    </div>
        </Dialog>
	      
      </div>
    )
  }
}

JobCodesPage.propTypes = {
  jobCodes: PropTypes.array.isRequired
};


export default createContainer(() => {
  
  //Get all company job codes
  var jobCodesHandle = Meteor.subscribe('jobcodes', Session.get('companyId'));

  return {
    jobCodes: JobCodes.find({},{sort: { name: 1 }}).fetch(),
    jobCodesLoading: !jobCodesHandle.ready()
  };
  
}, JobCodesPage);