import React from "react";
import PropTypes from "prop-types";

const defaultIsValidationCheck = validationState =>
  Object.keys(validationState).reduce(
    (valid, validatorName) => (!validationState[validatorName] ? false : valid),
    true
  );

class Control extends React.Component {
  constructor(props) {
    super(props);
    const { name, bindControl, value, defaultValue } = props;

    bindControl(name, value || defaultValue || null);
  }

  handleChange(value) {
    const { name, onValueChange } = this.props;
    onValueChange(name, value);
  }

  handleTouch() {
    const { name, onTouched } = this.props;
    onTouched(name);
  }

  render() {
    const {
      name,
      formState,
      component: Component,
      ...restOfProps
    } = this.props;

    const {
      values: { [name]: value },
      validationState: { [name]: validationState = {} }
    } = formState;

    return (
      <Component
        {...restOfProps}
        onChange={this.handleChange.bind(this)}
        onTouched={this.handleTouch.bind(this)}
        value={value}
        validationState={validationState}
      />
    );
  }
}

Control.propTypes = {
  name: PropTypes.string.isRequired,
  component: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.func,
    PropTypes.node
  ]).isRequired,
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  validators: PropTypes.object,
  peerDependencies: PropTypes.object,
  isValidCheck: PropTypes.func
};

Control.defaultProps = {
  value: null,
  defaultValue: null,
  validators: {},
  peerDependencies: {},
  isValidCheck: defaultIsValidationCheck
};

export default Control;
