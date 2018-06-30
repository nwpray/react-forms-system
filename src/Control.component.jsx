import React from 'react';

const propsToRemove = ['component', 'validators', 'peerDependencies', 'isValidCheck'];

const Control = props => {
    const { component } = props;

    const filteredProps = Object.keys(props).reduce(
        (currentlyFilteredProps, current) =>
            propsToRemove.indexOf(current) > -1
                ? currentlyFilteredProps
                : { ...currentlyFilteredProps, [current]: currentlyFilteredProps[current] },
        {}
    );

    const Component = component;

    return <Component {...filteredProps} />;
};

export default Control;
