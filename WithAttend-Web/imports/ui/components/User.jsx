import React, { Component, PropTypes } from 'react';

//Site User Item

export class User extends Component {
	
	render() {
		const { user, role, userUrl, active } = this.props;
		
		var userClass = "list-item mdl-color-text--grey-"
		userClass += (active) ? "700" : "400";
		
		return (
			
			<li className="mdl-list__item" key={user._id}>
        <span className="mdl-list__item-primary-content">
          <a className={userClass} href={userUrl}>{user.profile.firstName.capitalize()}&nbsp;{user.profile.lastName.capitalize()}</a>
        </span>
        <span className="mdl-list__item-secondary-action mdl-color-text--grey-400">{role}</span>
      </li>
       
		)	
	}
}

User.propTypes = {
  user: React.PropTypes.object,
  role: React.PropTypes.string,
  userUrl: React.PropTypes.string,
  active: React.PropTypes.bool
};