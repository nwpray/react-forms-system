import React from "react";
import Component from "@/core/Component";
import PropTypes from "prop-types";
import { isFunction, update } from "lodash";
import uuid from "uuid/v4";

import { removeKeys } from "@/ObjectHelpers";

import * as mutations from "./Form.mutations";

import * as selectors from "./Form.selectors";

export const FormContext = React.createContext();

const INIT_STATE = {
  values: {},
  validationState: {}
};

const PROPS_TO_REMOVE = ["onStateChange"];

const defaultIsValidCheck = validationResults =>
  !Object.keys(validationResults).some(key => validationResults[key] === false);

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = INIT_STATE;
    this.uuid = uuid();
    this.bindings = {};
  }

  setState(updates, ...restOfArgs) {
    const { onStateChange } = this.props;

    super.setState(updates, ...restOfArgs);

    onStateChange &&
      onStateChange(
        isFunction(updates)
          ? updates(this.state)
          : { ...this.state, ...updates }
      );
  }

  bindControl(name, initValue, validators, peerDependencies, isValidCheck) {
    if (!this.bindings[name]) {
      this.bindings[name] = {};
    }

    this.bindings[name] = {
      ...this.bindings[name],
      validators,
      peerDependencies,
      isValidCheck
    };

    const dependsOn = Object.keys(peerDependencies);

    dependsOn.forEach(dependencyName => {
      if (!this.bindings[dependencyName]) {
        this.bindings[dependencyName] = { dependantOf: [] };
      }

      this.bindings = update(
        this.bindings,
        [dependencyName, "dependantOf"],
        prevList => [...(prevList || []), name]
      );
    });

    this.applyMutations([
      mutations.updateValue(name, initValue),
      mutations.updateControlValidation(name, {
        dirty: false,
        touched: false,
        valid: false
      })
    ]);
  }

  updateBindings(oldName, updates) {
    const { name: newName, value } = updates;
    const name = newName || oldName;

    this.applyMutations(
      [
        ...(newName ? [mutations.changeControlName(oldName, newName)] : []),
        ...(typeof value !== "undefined"
          ? [mutations.updateValue(name, value)]
          : [])
      ],
      () => this.triggerValidation(name)
    );
  }

  handleSubmit(e) {
    e.preventDefault();

    const { onSubmit } = this.props;

    if (onSubmit) {
      onSubmit(this.state);
    }
  }

  handleValueChange(name, value) {
    const [changed, dirty] = this.select([
      selectors.controlValueChanged(name, value),
      selectors.controlDirty(name)
    ]);

    if (changed || !dirty) {
      this.applyMutations([
        ...(changed ? [mutations.updateValue(name, value)] : []),
        ...(!dirty
          ? [
              mutations.updateControlValidation(name, {
                dirty: true
              })
            ]
          : [])
      ]);
    }
  }

  async triggerValidation(name) {
    const { dependantOf } = this.bindings[name] || {};
    const { values } = this.state;

    const controlsToUpdate = [name, ...(dependantOf || [])];

    this.applyMutations(
      controlsToUpdate.map(controlName =>
        mutations.updateControlValidation(controlName, { pending: true })
      )
    );

    const validationResults = await Promise.all(
      controlsToUpdate.map(controlName =>
        this.validateSingleControl(controlName, values[controlName])
      )
    );

    this.applyMutations(
      validationResults.map((result, index) =>
        mutations.updateControlValidation(controlsToUpdate[index], {
          ...result,
          pending: false
        })
      )
    );
  }

  async validateSingleControl(name, value) {
    const { values } = this.state;
    const { validators, peerDependencies, isValidCheck } =
      this.bindings[name] || {};

    const peerValues = Object.keys(peerDependencies).reduce(
      (prevValues, peerName) => {
        const peerKey = peerDependencies[peerName];

        return {
          ...prevValues,
          [peerKey]: values[peerName]
        };
      },
      {}
    );

    const validatorKeys = Object.keys(validators);

    const results = await Promise.all(
      validatorKeys.map(key => validators[key](value, peerValues))
    );

    const remappedResults = results.reduce((prevMap, result, index) => {
      const key = validatorKeys[index];
      return { ...prevMap, [key]: result };
    }, {});

    return {
      ...remappedResults,
      valid: (isValidCheck || defaultIsValidCheck)(remappedResults)
    };
  }

  handleTouched(name) {
    const touched = this.select(selectors.controlTouched(name));
    if (!touched) {
      this.applyMutations(
        mutations.updateControlValidation(name, { touched: true })
      );
    }
  }

  render() {
    const contextValue = {
      formState: this.state,
      bindControl: this.bindControl.bind(this),
      updateBindings: this.updateBindings.bind(this),
      onValueChange: this.handleValueChange.bind(this),
      onTouched: this.handleTouched.bind(this)
    };

    return (
      <FormContext.Provider value={contextValue}>
        <form
          method="post"
          {...removeKeys(this.props, PROPS_TO_REMOVE)}
          onSubmit={this.handleSubmit.bind(this)}
        />
      </FormContext.Provider>
    );
  }
}

Form.propTypes = {
  onSubmit: PropTypes.func,
  onStateChange: PropTypes.func
};

Form.defaultProps = {
  onSubmit: null,
  onStateChange: null
};

export default Form;
