import React from 'react';
import ObjectHelpers from './ObjectHelpers';

const PROPS_TO_REMOVE = ['component', 'validators', 'peerDependencies', 'isValidCheck'];

const Control = props => {
    const { component } = props;

    const Component = component;
    const filteredProps = ObjectHelpers.removeKeys(props, PROPS_TO_REMOVE);

    return <Component {...filteredProps} />;
};

export default Control;
