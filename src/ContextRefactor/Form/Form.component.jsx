import React from "react";
import PropTypes from "prop-types";
import { removeKeys } from "@/ObjectHelpers";

export const FormContext = React.createContext();

const INIT_STATE = {
  values: {},
  validationState: {}
};

const PROPS_TO_REMOVE = ["onStateChange"];

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = INIT_STATE;
  }

  bindControl(name, initValue) {
    const { values } = this.state;
    const { onStateChange } = this.props;

    const updatedState = {
      ...this.state,
      values: {
        ...values,
        [name]: initValue
      },
      validationState: {
        [name]: {
          dirty: false,
          touched: false,
          valid: false
        }
      }
    };

    this.setState(updatedState);
    onStateChange(updatedState);
  }

  handleSubmit(e) {
    e.preventDefault();

    const { onSubmit } = this.props;

    if (onSubmit) {
      onSubmit(this.state);
    }
  }

  handleValueChange(name, value) {
    const { values } = this.state;
    const { onStateChange } = this.props;

    const updatedState = {
      ...this.state,
      values: {
        ...values,
        [name]: value
      }
    };

    this.setState(updatedState);
    onStateChange(updatedState);
  }

  handleTouched(name) {
    const { validationState } = this.state;
    const { onStateChange } = this.props;

    const updatedState = {
      ...this.state,
      validationState: {
        ...validationState,
        [name]: {
          ...validationState[name],
          touched: true
        }
      }
    };

    this.setState(updatedState);
    onStateChange(updatedState);
  }

  render() {
    const contextValue = {
      formState: this.state,
      bindControl: this.bindControl.bind(this),
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
