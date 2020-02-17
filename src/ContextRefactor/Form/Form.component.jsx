import React from "react";
import Component from "@/core/Component";
import PropTypes from "prop-types";
import { isFunction } from "lodash";
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

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = INIT_STATE;
    this.uuid = uuid();
  }

  setState(updates, ...restOfArgs) {
    const { onStateChange } = this.props;

    super.setState(updates, ...restOfArgs);

    onStateChange(
      isFunction(updates) ? updates(this.state) : { ...this.state, ...updates }
    );
  }

  bindControl(name, initValue) {
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

    this.applyMutations([
      ...(newName ? [mutations.changeControlName(oldName, newName)] : []),
      ...(typeof value !== "undefined"
        ? [mutations.updateValue(name, value)]
        : [])
    ]);
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
          ? [mutations.updateControlValidation(name, { dirty: true })]
          : [])
      ]);
    }
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
