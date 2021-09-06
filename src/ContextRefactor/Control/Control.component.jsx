import React from "react";
import PropTypes from "prop-types";
import isEqual from "lodash/isEqual";

import Component from "@/core/Component";
import { removeKeys } from "@/ObjectHelpers";

import * as selectors from "./Control.selectors";

const defaultIsValidationCheck = (validationState) =>
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

const getValueFromProps = (props) => {
  const { name, value, defaultValue, formState } = props;
  const {
    values: { [name]: formValue },
  } = formState;

  if (typeof value !== "undefined") return value;
  if (typeof formValue !== "undefined") return formValue;
  if (typeof defaultValue !== "undefined") return defaultValue;

  return null;
};

const PROPS_TO_REMOVE = [
  "isValidCheck",
  "peerDependencies",
  "onTouched",
  "onValueChange",
  "updateBindings",
  "bindControl",
];

class Control extends Component {
  constructor(props) {
    super(props);

    const { name, bindControl, submit } = props;

    if (submit) return;

    bindControl(
      name,
      getValueFromProps(props),
      props.validators,
      props.peerDependencies,
      props.isValidCheck
    );
  }

  shouldComponentUpdate(nextProps) {
    const { updateBindings, submit } = this.props;

    if (submit) return true;

    const compareSelectors = [
      selectors.component(),
      selectors.name(),
      selectors.validationState(),
      selectors.formValue(),
      selectors.isValidCheck(),
      selectors.peerDependencies(),
      selectors.validators(),
      selectors.value(),
    ];

    const [
      prevComponent,
      prevName,
      prevValidationState,
      prevFormValue,
      prevIsValidCheck,
      prevPeerDependencies,
      prevValidators,
      prevValue,
    ] = this.selectProps(compareSelectors);

    const [
      nextComponent,
      nextName,
      nextValidationState,
      nextFormValue,
      nextIsValidCheck,
      nextPeerDependencies,
      nextValidators,
      nextValue,
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
        peerDependencies: nextPeerDependencies,
      };
    }

    if (!isValidatorsEqual(prevValidators, nextValidators)) {
      bindingUpdates = {
        ...bindingUpdates,
        validators: nextValidators,
      };
    }

    // handle managed value changes
    if (
      typeof nextValue !== "undefined" &&
      (!isEqual(prevValue, nextValue) ||
        (!isEqual(nextFormValue, nextValue) &&
          isEqual(nextFormValue, prevFormValue)))
    ) {
      bindingUpdates = {
        ...bindingUpdates,
        value: nextValue,
      };
    }

    // handle unmanaged value changes
    if (
      typeof nextValue === "undefined" &&
      !isEqual(nextFormValue, prevFormValue)
    ) {
      bindingUpdates = {
        ...bindingUpdates,
        value: nextFormValue,
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

  handleSubmit() {
    const { name, onSubmit } = this.props;
    onSubmit(name);
  }

  render() {
    const {
      name,
      formState,
      component: PassedComponent,
      submit,
      ...restOfProps
    } = this.props;

    return (
      <PassedComponent
        {...removeKeys(restOfProps, PROPS_TO_REMOVE)}
        name={name}
        onChange={!submit ? this.handleChange.bind(this) : undefined}
        onTouch={!submit ? this.handleTouch.bind(this) : undefined}
        onSubmit={submit ? this.handleSubmit.bind(this) : undefined}
        value={!submit ? getValueFromProps(this.props) : undefined}
        validationState={
          !submit
            ? this.selectProps(selectors.validationState()) || {}
            : undefined
        }
      />
    );
  }
}

Control.propTypes = {
  name: PropTypes.string.isRequired,
  component: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.func,
    PropTypes.node,
  ]).isRequired,
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  validators: PropTypes.object,
  peerDependencies: PropTypes.object,
  isValidCheck: PropTypes.func,
};

Control.defaultProps = {
  value: undefined,
  defaultValue: undefined,
  validators: {},
  peerDependencies: {},
  isValidCheck: defaultIsValidationCheck,
};

export default Control;
