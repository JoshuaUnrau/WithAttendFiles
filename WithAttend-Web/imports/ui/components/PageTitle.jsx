import React from 'react';
 
//Page Title
export const PageTitle = ({pageTitle}) => (
	    <header className="mdl-layout__header mdl-color--grey-100 mdl-color-text--grey-600 is-casting-shadow">
	      <div ariaExpanded="false" role="button" tabindex="0" className="mdl-layout__drawer-button"><i className="material-icons">menu</i></div>
	      <div className="mdl-layout__header-row"><span className="mdl-layout-title">{pageTitle}</span></div>
	    </header>
);