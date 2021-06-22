import React from "react";

import Control from "./Control.component";
import ObjectHelpers from "./ObjectHelpers";
import ReactHelpers from "./ReactHelpers";

const defaultIsValidationCheck = (validationState) =>
  Object.keys(validationState).reduce(
    (valid, validatorName) => (!validationState[validatorName] ? false : valid),
    true
  );

// Flatten the children tree and filter out all the children that are not a component or not bindable
/**
 * TODO: Document bindableControlsFromChildren
 *
 * @param {*} children
 * @param {*} bindableControlNames
 */
const bindableControlsFromChildren = (children, bindableControlNames) =>
  ReactHelpers.flattenDescendants(children).filter(
    (child) =>
      ({ ...{}, ...child.props }.name &&
      child.type &&
      bindableControlNames.indexOf(child.type.name) > -1)
  );

const bindControlValue = (currentValues = {}, control) => {
  const { name, value, defaultValue } = control.props;
  return {
    ...currentValues,
    [name]: [value, defaultValue].find(
      (x) => typeof x !== "undefined" && x !== null
    ),
  };
};

const bindControlValueByValueOnly = (currentValues = {}, control) => {
  const { name, value } = control.props;

  return typeof value === "undefined"
    ? currentValues
    : { ...currentValues, [name]: value };
};

const bindControlValidationState = (currentState = {}, control) => {
  const { name, validators, value } = control.props;
  return {
    ...currentState,
    [name]: {
      ...ObjectHelpers.applyValue(validators || {}, false),
      valid: false,
      dirty: false,
      touched: false,
      pending: [],
    },
  };
};

const bindControlValidators = (currentValidators = {}, control) => {
  const { name, validators } = control.props;

  return {
    ...currentValidators,
    ...(validators ? { [name]: validators } : {}),
  };
};

const bindPeerDependencies = (currentDependencies = {}, control) => {
  const { name, peerDependencies } = control.props;

  return {
    ...currentDependencies,
    ...(peerDependencies ? { [name]: peerDependencies } : {}),
  };
};

const bindIsValidCheck = (currentChecks = {}, control) => {
  const { name, isValidCheck } = control.props;
  return {
    ...currentChecks,
    ...(isValidCheck ? { [name]: isValidCheck } : {}),
  };
};

const collectFormBindingsFromControls = (controls, bindings) =>
  controls.reduce(
    (formBindings, control) =>
      Object.keys(bindings).reduce(
        (controlBindings, bindingName) => ({
          ...controlBindings,
          [bindingName]: bindings[bindingName](
            formBindings[bindingName],
            control
          ),
        }),
        {}
      ),
    {}
  );

const getDependentControls = (controlName, peerDependencies) =>
  Object.keys(peerDependencies).filter(
    (dependantControlName) =>
      Object.keys(peerDependencies[dependantControlName]).indexOf(controlName) >
      -1
  );

const updateValidationState = (controlName, validationState, updates) => ({
  ...validationState,
  [controlName]: {
    ...(validationState[controlName] || {}),
    ...updates,
  },
});

const pushControlPending = (controlName, validationState, pendingKey) =>
  updateValidationState(controlName, validationState, {
    pending: [...validationState[controlName].pending, pendingKey],
  });

const TYPE_CONTROL = "Control";
const BINDABLE_CONTROLS = [TYPE_CONTROL];
const PROPS_TO_REMOVE = ["onStateChange"];

class Form extends React.Component {
  constructor(props) {
    super(props);

    // Collect all controls with the form that are bindable
    const bindableControls = bindableControlsFromChildren(
      props.children,
      BINDABLE_CONTROLS
    );

    // Get all the form bindings needed for initializing the form;
    const bindings = collectFormBindingsFromControls(bindableControls, {
      values: bindControlValue,
      validationState: bindControlValidationState,
      validators: bindControlValidators,
      peerDependencies: bindPeerDependencies,
      isValidChecks: bindIsValidCheck,
    });

    // Init the form state
    this.state = {
      values: bindings.values,
      validationState: bindings.validationState,
      valid: false,
      dirty: false,
      touched: false,
    };

    // Bind validation data
    this.validators = bindings.validators;
    this.peerDependencies = bindings.peerDependencies;
    this.isValidChecks = bindings.isValidChecks;
  }

  componentDidMount() {
    // Collect all controls with the form that are bindable
    const bindableControls = bindableControlsFromChildren(
      this.props.children,
      BINDABLE_CONTROLS
    );

    bindableControls.forEach((control) =>
      this.runValidation(control.props.name)
    );
  }

  componentDidUpdate(props, state) {
    const { state: currentPropState, onStateChange } = this.props;
    const { state: currentState } = this;
    const previousState = state;

    // If the currentState is not the same as the last one fire the onStateChange handler if it exists
    if (
      onStateChange &&
      !currentPropState &&
      JSON.stringify(currentState) !== JSON.stringify(previousState)
    )
      onStateChange(currentState);

    // Update validation bindings
    const bindableControls = bindableControlsFromChildren(
      props.children,
      BINDABLE_CONTROLS
    );

    const bindings = collectFormBindingsFromControls(bindableControls, {
      validators: bindControlValidators,
      peerDependencies: bindPeerDependencies,
      isValidChecks: bindIsValidCheck,
    });

    this.validators = bindings.validators;
    this.peerDependencies = bindings.peerDependencies;
    this.isValidChecks = bindings.isValidChecks;

    // Determine which controls values have changed
    const { values: currentStateValues } = this.getState();

    const modifiedControlValues = Object.keys(currentStateValues).reduce(
      (modifiedControls, controlName) =>
        JSON.stringify(state.values[controlName]) !==
        JSON.stringify(currentStateValues[controlName])
          ? [...modifiedControls, controlName]
          : modifiedControls,
      []
    );

    // Run validation on modified controls
    modifiedControlValues.forEach((controlName) =>
      this.runValidation(controlName)
    );
  }

  onSubmit(e) {
    e.preventDefault();

    const { validationState: currentValidationState } = this.getState();
    const { onSubmit } = this.props;

    const stateUpdates = {
      validationState: {
        ...Object.keys(currentValidationState).reduce(
          (validationState, controlName) => ({
            ...validationState,
            [controlName]: {
              ...currentValidationState[controlName],
              dirty: true,
              touched: true,
            },
          }),
          {}
        ),
      },
    };

    this.setState(stateUpdates);

    if (onSubmit) onSubmit({ ...this.getState(), ...stateUpdates });
  }

  static getDerivedStateFromProps(props, state) {
    // Collect all controls with the form that are bindable
    const bindableControls = bindableControlsFromChildren(
      props.children,
      BINDABLE_CONTROLS
    );

    // Get all the form bindings needed for initializing the form;
    const bindings = collectFormBindingsFromControls(bindableControls, {
      values: bindControlValue,
    });

    const updatedState = Object.keys(bindings.values || {}).reduce(
      (updates, controlName) => {
        const { props: controlProps } = bindableControls.find(
          (control) => control.props.name === controlName
        );
        return controlProps.value &&
          controlProps.value !== state.values[controlName]
          ? {
              values: {
                ...updates.values,
                [controlName]: controlProps.value,
              },
              validationState: {
                ...updates.validationState,
                [controlName]: {
                  ...updates.validationState[controlName],
                },
              },
            }
          : updates;
      },
      state
    );

    return JSON.stringify(updatedState) !== JSON.stringify(state)
      ? updatedState
      : null;
  }

  getState() {
    const { state } = this.props;
    return state || this.state;
  }

  getChildren(children) {
    return React.Children.map(children, (child) => {
      // If it is a simple child like a string we only need to return it
      // Simple child is anything that would be considered the tags body text in regular html
      if (!child || !child.props) {
        return child;
      }

      let props = { ...child.props };

      // Bind children
      if (props.children) {
        props = { ...props, children: this.getChildren(props.children) };
      }

      // Bind control if bindable type and has name prop
      if (BINDABLE_CONTROLS.indexOf(child.type.name) > -1 && props.name) {
        const state = this.getState();

        // Bind change handler
        const onValueChange = (value) => {
          const stateDuringChange = this.getState();
          const { onStateChange } = this.props;

          if (stateDuringChange[props.name] !== value) {
            const stateChanges = {
              values: {
                ...stateDuringChange.values,
                [props.name]: value,
              },
              validationState: {
                ...stateDuringChange.validationState,
                [props.name]: {
                  ...(stateDuringChange.validationState[props.name] || {}),
                  dirty: true,
                },
              },
            };

            if (onStateChange) onStateChange(stateChanges);
            this.setState(stateChanges);
          }
        };

        // Bind touched handler
        const onTouched = () => {
          const stateDuringTouch = this.getState();
          this.setState({
            ...stateDuringTouch,
            validationState: {
              ...stateDuringTouch.validationState,
              [props.name]: {
                ...(stateDuringTouch.validationState[props.name] || {}),
                touched: true,
              },
            },
          });
        };

        const { validationState } = this.getState();

        // Update the properties
        props = {
          ...props,
          controlName: props.name,
          onValueChange,
          onTouched,
          validationState: validationState[props.name],
        };

        // Determine value
        props = {
          ...props,
          value: [
            props.value,
            { ...{}, ...state.values }[props.name],
            props.defaultValue,
          ].find((value) => typeof value !== "undefined" && value !== null),
        };
      }

      // Clone the element with the updated props
      return React.cloneElement(child, props);
    });
  }

  runValidation(controlName) {
    // TODO : Really need to find a good way to debounce this validation
    const { validationState, values: currentStateValues } = this.getState();

    const dependantPeerControls = getDependentControls(
      controlName,
      this.peerDependencies
    );

    const validatorsByControlName = [
      controlName,
      ...dependantPeerControls,
    ].reduce(
      (validators, currentControlName) => ({
        ...validators,
        [currentControlName]: this.validators[currentControlName],
      }),
      {}
    );

    const pendingTimeStamp = +new Date();

    // Set all control validation states to pending for each control that will validate
    this.setState({
      validationState: pushControlPending(
        controlName,
        validationState,
        pendingTimeStamp
      ),
    });

    Promise.all(
      Object.keys(validatorsByControlName).map((currentControlName) => {
        const value = currentStateValues[currentControlName];
        const peerValues = Object.keys(
          this.peerDependencies[currentControlName] || {}
        ).reduce(
          (values, peerName) => ({
            ...values,
            [this.peerDependencies[currentControlName][peerName]]:
              currentStateValues[peerName],
          }),
          {}
        );

        const currentControlValidators =
          validatorsByControlName[currentControlName] || {};

        return Promise.all(
          Object.keys(currentControlValidators).map((validatorName) =>
            currentControlValidators[validatorName](value, peerValues)
          )
        );
      })
    ).then((validationResults) => {
      const { validationState: originalValidationState } = this.getState();

      const validationStateUpdates = Object.keys(
        validatorsByControlName
      ).reduce((currentValidationState, currentControlName, controlIndex) => {
        const currentControlValidators =
          validatorsByControlName[currentControlName] || {};
        const currentResult = validationResults[controlIndex];

        const currentControlValidationStateUpdates = Object.keys(
          currentControlValidators
        ).reduce(
          (validationUpdates, currentValidatorName, validatorIndex) => ({
            ...validationUpdates,
            [currentValidatorName]: currentResult[validatorIndex],
          }),
          {}
        );

        return updateValidationState(
          currentControlName,
          currentValidationState,
          {
            ...currentControlValidationStateUpdates,
          }
        );
      }, {});

      const updatedValidationState = Object.keys(validationStateUpdates).reduce(
        (currentValidationState, currentControlName) => {
          const peerValues = Object.keys(
            this.peerDependencies[currentControlName] || {}
          ).reduce(
            (values, peerName) => ({
              ...values,
              [this.peerDependencies[currentControlName][peerName]]:
                currentStateValues[peerName],
            }),
            {}
          );

          return updateValidationState(
            currentControlName,
            currentValidationState,
            {
              ...validationStateUpdates[currentControlName],
              pending: (
                { ...{}, ...originalValidationState[currentControlName] }
                  .pending || []
              ).filter((pendingKey) => pendingKey !== pendingTimeStamp),
              valid: (
                this.isValidChecks[currentControlName] ||
                defaultIsValidationCheck
              )(validationStateUpdates[currentControlName], peerValues),
            }
          );
        },
        originalValidationState
      );

      const globalValidationState = Object.keys(updatedValidationState).reduce(
        (globalState, currentControlName) => {
          const {
            valid: controlValid,
            dirty: controlDirty,
            touched: controlTouched,
          } = updatedValidationState[currentControlName];

          return {
            valid: !controlValid ? false : globalState.valid,
            dirty: controlDirty ? true : globalState.dirty,
            touched: controlTouched ? true : globalState.touched,
          };
        },
        { valid: true, dirty: false, touched: false }
      );

      this.setState({
        validationState: { ...updatedValidationState },
        ...globalValidationState,
      });
    });
  }

  render() {
    const { props } = this;
    const { children } = props;

    const filteredProps = ObjectHelpers.removeKeys(props, PROPS_TO_REMOVE);

    // For post by default so values don't get injected in url query segment
    filteredProps.method = filteredProps.method || "post";

    return (
      <form {...filteredProps} onSubmit={(e) => this.onSubmit(e)}>
        {this.getChildren(children)}
      </form>
    );
  }
}

Form.Control = Control;

export default Form;
