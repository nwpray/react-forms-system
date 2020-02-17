import React from "react";
import PropTypes from "prop-types";
import { isEqual } from "lodash";

import Component from "@/core/Component";

import * as selectors from "./Control.selectors";

const defaultIsValidationCheck = validationState =>
  Object.keys(validationState).reduce(
    (valid, validatorName) => (!validationState[validatorName] ? false : valid),
    true
  );

const isFunctionEqual = (funcA, funcB) => funcA.toString() === funcB.toString();
const isValidatorsEqual = (validatorsA, validatorsB) => {
  const aKeys = Object.keys(validatorsA);
  const bKeys = Object.keys(validatorsB);

  if (!isEqual(aKeys, bKeys)) return false;

  return aKeys.reduce((equal, key) => {
    if (isFunctionEqual(validatorsA[key], validatorsB[key])) return equal;
    return false;
  }, true);
};

const getValueFromProps = props => {
  const { name, value, defaultValue, formState } = props;
  const {
    values: { [name]: formValue }
  } = formState;

  if (typeof formValue !== "undefined") return formValue;
  if (typeof value !== "undefined") return value;
  if (typeof defaultValue !== "undefined") return defaultValue;

  return null;
};

class Control extends Component {
  constructor(props) {
    super(props);

    const { name, bindControl } = props;

    bindControl(
      name,
      getValueFromProps(props),
      props.validators,
      props.peerDependencies,
      props.isValidCheck
    );
  }

  shouldComponentUpdate(nextProps) {
    const { updateBindings } = this.props;

    const compareSelectors = [
      selectors.component(),
      selectors.name(),
      selectors.validationState(),
      selectors.formValue(),
      selectors.isValidCheck(),
      selectors.peerDependencies(),
      selectors.validators(),
      selectors.value()
    ];

    const [
      prevComponent,
      prevName,
      prevValidationState,
      prevFormValue,
      prevIsValidCheck,
      prevPeerDependencies,
      prevValidators,
      prevValue
    ] = this.selectProps(compareSelectors);

    const [
      nextComponent,
      nextName,
      nextValidationState,
      nextFormValue,
      nextIsValidCheck,
      nextPeerDependencies,
      nextValidators,
      nextValue
    ] = this.selectProps(compareSelectors, nextProps);

    let shouldUpdate = false;
    let bindingUpdates = {};

    if (!isEqual(prevComponent, nextComponent)) shouldUpdate = true;

    if (!isEqual(prevValidationState, nextValidationState)) shouldUpdate = true;

    if (!isEqual(prevFormValue, nextFormValue)) shouldUpdate = true;

    if (!isEqual(nextName, prevName)) {
      bindingUpdates = { ...bindingUpdates, name: nextName };
    }

    if (!isFunctionEqual(nextIsValidCheck, prevIsValidCheck)) {
      bindingUpdates = { ...bindingUpdates, isValidCheck: nextIsValidCheck };
    }

    if (!isEqual(prevPeerDependencies, nextPeerDependencies)) {
      bindingUpdates = {
        ...bindingUpdates,
        peerDependencies: nextPeerDependencies
      };
    }

    if (!isValidatorsEqual(prevValidators, nextValidators)) {
      bindingUpdates = {
        ...bindingUpdates,
        validators: nextValidators
      };
    }

    // handle managed value changes
    if (
      typeof nextValue !== "undefined" &&
      (!isEqual(prevValue, nextValue) || !isEqual(nextFormValue, nextValue))
    ) {
      bindingUpdates = {
        ...bindingUpdates,
        value: nextValue
      };
    }

    // handle unmanaged value changes
    if (
      typeof nextValue === "undefined" &&
      !isEqual(nextFormValue, prevFormValue)
    ) {
      bindingUpdates = {
        ...bindingUpdates,
        value: nextFormValue
      };
    }

    if (Object.keys(bindingUpdates).length > 0) {
      updateBindings(prevName, bindingUpdates);
    }

    return shouldUpdate;
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
      component: PassedComponent,
      ...restOfProps
    } = this.props;

    return (
      <PassedComponent
        {...restOfProps}
        name={name}
        onChange={this.handleChange.bind(this)}
        onTouch={this.handleTouch.bind(this)}
        value={getValueFromProps(this.props)}
        validationState={this.selectProps(selectors.validationState()) || {}}
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
  value: undefined,
  defaultValue: undefined,
  validators: {},
  peerDependencies: {},
  isValidCheck: defaultIsValidationCheck
};

export default Control;
