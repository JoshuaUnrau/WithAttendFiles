import React from 'react';
 
//No Company Page
export class NoAccess extends React.Component {
  render() {
    return (
      <div className="mdl-grid">
	    	<div className="mdl-layout-spacer"></div>
      	<div className="mdl-typography--text-center">
      		<h1>Oops</h1>
					<p>You do not have access to this company.</p>
				</div>
				<div className="mdl-layout-spacer"></div>
      </div>
    )
  }
}