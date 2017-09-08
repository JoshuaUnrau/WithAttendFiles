import React from 'react';
 
// App component - represents the whole app
export class Welcome extends React.Component {
  render() {
    return (
	    <div className="mdl-grid">
		    <div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--6-col mdl-card">
		    	<div className="mdl-card__title">
      			<h5 className="mdl-card__title-text">Welcome to WithAttend</h5>
					</div>
					
					<div className="mdl-card__supporting-text">
						Get accurate data on your sites in real-time. Select an item from the menu to get started.
			  	</div>

				</div>
      </div>
    )
  }
}