import React from 'react';

const propsToRemove = ['component'];

export default class Control extends React.Component{
	render(){
		const props = Object.keys(this.props).reduce((props, current) =>
			propsToRemove.indexOf(current) > -1 ? props : { ...props, [current]: this.props[current] },
			{}
		);
		const Component = this.props.component;

		return <Component {...props} />;
	}
}