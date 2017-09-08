import React, { Component } from 'react';

//Snackbar / Toast
export class Snackbar extends Component {
	
	render() {
		
		return (
			
			<div ariaLive="assertive" ariaAtomic="true" ariaRelevant="text" className="mdl-snackbar mdl-js-snackbar" ref="snackbar">
			  <div className="mdl-snackbar__text"></div>
			  <button type="button" className="mdl-snackbar__action"></button>
			</div>
       
		)	
	}
}