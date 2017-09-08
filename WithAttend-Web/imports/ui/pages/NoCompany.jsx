import React from 'react';
 
//No Company Page
export class NoCompany extends React.Component {
  render() {
    return (
      <div className="mdl-grid">
	    	<div className="mdl-layout-spacer"></div>
      	<div className="mdl-typography--text-center">
      		<h1>Oops</h1>
					<p>This is not a valid company dashboard. Please enter the correct URL.</p>
				</div>
				<div className="mdl-layout-spacer"></div>
      </div>
    )
  }
}