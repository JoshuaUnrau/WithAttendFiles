import React from 'react';
import ReactDOM from 'react-dom';
import hasClass from 'react-kit/hasClass';
 
//Site Sidebar
export default class Sidebar extends React.Component {
  
  renderHeader() {	  
	  if (this.props.companyLoading) {
	  
	  	return ( 
		  	<header className="">
	        <span><h2></h2></span>
	      </header>
	    )
	    
	  } else {
		  
		  var brandClass = 'brand-' + this.props.companyData.name;
		  	    
	    return (
		    <header className={brandClass}>
		    	<span><h3 className="brand-logo text-center">{this.props.companyData.name}</h3></span>
		    </header>
	    )
	    
	  } 
  }
  
  //Manually close sidebar on mobile
  closeSidebar() {
	  if (hasClass(ReactDOM.findDOMNode(this.refs.sidebar), 'is-visible')) {
		  var layout = document.querySelector('.mdl-layout');
			layout.MaterialLayout.toggleDrawer();
	  }
  }
  
  isActive(currentLink) {
    var activeClass = (ActiveRoute.name(currentLink)) ? 'mdl-navigation__link mdl-navigation__link--current' : 'mdl-navigation__link';
	  return activeClass;
  }
  
  renderLinks() {
	  
	  //Build the links to display
	  var params = { companyName: FlowRouter.getParam("companyName") };
		var links = [];
		links.push({ 'name':'sites', 'icon':'location_city'});
		links.push({ 'name':'employees', 'icon':'group'});
		if (this.props.role === 'manager') {		  
		  links.push({ 'name':'reports', 'icon':'trending_up'});
		  links.push({ 'name':'settings', 'icon':'settings'});
	  }
	  links.push({ 'name':'logout', 'icon':'cancel'});
		
		var linksDisplay = [];
		for (var i = 0; i < links.length; i++) {
			linksDisplay.push(<a key={links[i].name} className={this.isActive(links[i].name)} href={FlowRouter.path(links[i].name, params)} onClick={this.closeSidebar.bind(this)}><i className="material-icons" role="presentation">{links[i].icon}</i> {links[i].name.capitalize(true)}</a>);
		} 
		
	  return (
		    <nav className="mdl-navigation mdl-layout-spacer">
		    	{linksDisplay}
		    	<div className="mdl-layout-spacer"></div>
		    	<p className="powered-by text-center mdl-color-text--gray-600">POWERED BY</p>
		    	<p className="powered-by-big text-center mdl-color-text--green">WithAttend</p>
				</nav>
	  )
	  
  }
  
  render() {

    return (
    <div className="mdl-layout__drawer" ref="sidebar">
      {this.renderHeader()}      
      {this.renderLinks()}
    </div>
    )
  }
}