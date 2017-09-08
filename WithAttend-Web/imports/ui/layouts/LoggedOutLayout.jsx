import React from 'react';

export const LoggedOutLayout = ({content}) => (
	<div className="logged-out">
		<div className="mdl-layout mdl-js-layout">
			<main className="mdl-layout__content mdl-color--grey-100">
				{content}
			</main>
		</div>
	</div>
)