import React from 'react';

const propsToRemove = ['component', 'validators', 'peerDependencies', 'isValidCheck'];

const Control = (props) => {

 	filteredProps = Object.keys(props).reduce((props, current) =>
		propsToRemove.indexOf(current) > -1 ? props : { ...props, [current]: props[current] },
		{}
	);

	const Component = props.component;

	return (
		<Component {...filteredProps} />
	);
}

export default Control;