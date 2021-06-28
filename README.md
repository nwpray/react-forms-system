# React Forms System

NOW REACT NATIVE COMPATABLE!!

Yet another react forms library.... Don't worry there are some new ideas as well as refined ideas from other libraries that will make your life so much easier.

_Why use this package?_

React Forms System is a simple forms state management library that provides powerful validation api. The biggest perk is that it does not get into the game of building out its own UI, and instead relies heavily on the inversion of control pattern. Things like component implementation, validation messages and validators are left up to the user to implement. This inversion of control allows virtually any UI components from any library to be used with this library. In summary, React Forms System tries to do only a few things but do them well.

_What sets this apart?_

The biggest thing that sets this library apart is how expressive the built in validation states are and the built in ability to validate using values from other control values within the form. The validation states are heavily influenced by angular form validation which gives an amazing amount of flexibility to control not only if there are validation errors but if the user should be blasted by validation messages before they have even had an opportunity to interact with the form.

A second big thing that sets this library apart is its `Control` component and how simple and flexible the api is. The `Control` component definitely leans on the BYOC (bring your own component) paradigm. The api is neat because it tells you what the value of your control is and its validation state and in return your control only needs to tell the form when the value changes and optionally when it should be considered `touched`.

### Contents

- [Features](#features)
- [Getting Started](#getting-started)

  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [React Native](#react-native)

- [Components](#components)

  - [Form](#form)
    - [Basic Form](#basic-form)
    - [Form State](#form-state)
    - [Submit Source](#submit-source)
  - [Control](#control)
    - [Basic Control](#basic-control)
    - [Wrapper Interface](#wrapper-interface)
    - [Validator](#validator)
    - [Peer Dependencies](#peer-dependencies)
    - [Submit](#submit)

- [Examples](#Examples)
- [Managed Form](#managed-form)

  - [Unmanaged Form](#unmanaged-form)
  - [Control Wrapper](#control-wrapper)
  - [Basic Validation](#basic-validation)
  - [Cross Control Validation](#cross-control-validation)

- [Related Projects](#related-projects)
- [Roadmap](#roadmap)

## Features

- Minimal library components
- Control level and form level validation
- Managed or unmanaged state
- Dirty, touched and pending states
- Customizable controls
- Built in peer control evaluation
- React Web and React Native compatible

## Getting Started

### Prerequisites

React

```bash
$ npm i react
```

### Installation

```bash
$ npm i react-forms-system
```

### React Native

The only requirement to get this to work for react native is to pass a different `component` prop to the `Form` with a react native compatable component. `View` should do just fine (and is really the only thing I have tested up to this point)

```jsx
import { View } from 'react-native';
...
<Form onSubmit={...} component={View} >
...
</Form>
```

## Components

### Form

`<Form />` is a HOC that manages and maintains the state of all the `<Control />` that are nested below it.

##### Props

| Prop          | Type              | Description                                                                                                                                                                                        |
| ------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| onSubmit      | (FormState)=>void | onSubmit is called any time the html form submit event is called. It passes the entire state of the form as its only argument.                                                                     |
| onStateChange | (FormState)=>void | onStateChange is called every time there is a state update. It passes the entire state of the form as its only argument.                                                                           |
| component     | React.Component   | If you want to use a different underlying component for the form besides and html `<form />` then pass it here. `View` is the only react native component that has been tested with this prop atm. |
| ...           | ...               | All other props passed will be directly applied to the underlying html `<form />` component or the passed `component`.                                                                             |

##### Basic Form

```jsx
<Form onSubmit={(formState) => console.log(formState)}>
  // ... form content here
</Form>
```

##### Form State

The form state can very based off your Controls, but the root of the form state always stays the same:

```javascript
{
    values: { ... }, // A map of the Forms Control values
    validationState: { ... } // A map of Forms Control validation states
}
```

##### Submit Source

The second argument passed to the onSubmit callback will be the submit source. In the case of an html form submit, the value will be `native_submit`. In the case of a custom submit control, it will be the name of the control.

```jsx
import CustomSubmit from './some/path/CustomSubmit';

// Should log 'native_submit'
<Form onSubmit={(formState, source) => console.log(source)}>
  <button type="submit">Submit</button>
</Form>

// Should log 'customSubmit'
<Form onSubmit={(formState, source) => console.log(source)}>
  <Form.Control name="customSubmit" component={CustomSubmit} submit />
</Form>
```

### Control

A `<Control />` is a HOC that wraps and provides all `<Form />` interaction to any controls you would like to use in your form.

##### Props

| Prop             | Type                       | Description                                                                                                                                                                                     |
| ---------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name             | string                     | The name to call the component                                                                                                                                                                  |
| component        | React.Component            | The component to use as a control                                                                                                                                                               |
| value            | any                        | The current value of the control when using in a managed form                                                                                                                                   |
| defaultValue     | any                        | The initial value of the control                                                                                                                                                                |
| validators       | {}                         | A map of validators to be apply to this control on value change                                                                                                                                 |
| peerDependencies | {}                         | A list of peer `<Control />` components names whos values will need to be used in one or more of the controls validators.                                                                       |
| isValidCheck     | (validationState)=>boolean | A predicate that will be used to determine the overall `valid` key of the controls validationState. The default validator considers any false validation values to be considered `valid: false` |
| submit           | bool                       | If `true` this control will now be treated as a submittable. `value`, `defaultValue`, `validators`, `peerDependencies` and `isValidCheck` will no longer have any effect when this is enabled.  |
| ...              | ...                        | All other props will be forwarded to the control wrapper passed in `component` prop.                                                                                                            |

##### Basic Control

```jsx
// Common use for a unmanaged form
// Must use `defaultValue` prop for unmanaged form controls
<Form.Control
    name="myControlName"
    component={MyControlComponent}
    defaultValue=""
/>

// Common use for a managed form
<Form.Control
    name="myControlName"
    component={MyControlComponent}
    value=""
/>
```

##### Wrapper Interface

An example of the props that are passed by the `Control` component.

```jsx
const MyControlComponent = ({ name, value, onChange, onTouch, validationState }) = {
    return (
 		// ...wrapped component to be used as a control goes here
    );
};
```

> See [Control Wrapper](#control-wrapper) for example

##### Validator

A validator is a function that takes a control value and a map of peer values and returns `true` for passed validation and `false` for failed validation. A validator can also return a Promise as every single validator gets wrapped in a `Promise.all()` during evaluation.

```jsx
(value, peerValues) => !!value || !!peerValues.peer;
```

The format for passing validators to the control is:

```jsx
<Form.Control
    ...
    validators={{ myValidator: (value, peerValues) => ... }}
    ...
/>
```

or for making validators reusable

```jsx
const myValidator = (value, peerValues) => ...;
...
<Form.Control
    ...
    validators={{ myValidator }}
    ...
/>
```

Out of the box, the key `valid` will be set in the `validationState` of each control as `true` if all validators were `true` or `false` if any validator returned `false`. You can override this by passing the `isValidCheck` prop. `isValidCheck` receives the controls `validationState` and returns a `true` if field should be considered valid and `false` if it shouldn't. Here is a simple example:

```jsx
const required = (value) => !!value;
...
<Form.Control
    ...
    validators={{ required }}
    isValidCheck={(validationState) => !!validationState.required }
    ...
/>
```

> See [Basic Validation](#basic-validation) for example

##### Peer Dependencies

Peer dependencies are any other `<Control />` component that the current control will need values for to run its own validation. The format for passing peer dependencies is:

```jsx
<Form.Control
    ...
    peerDependencies={{ nameOfPeerControl: 'aliasForPeerControl'}
    ...
/>
```

> See [Cross control validation](#cross-control-validation) for an example

##### Submit

Controls can be turned into a submittable by adding the prop `submit`. Any control that has the prop submit will no longer send `value`, `onChange`, `onTouch` or `validationState`. Instead it will recieve the callback `onSubmit` which will trigger a form submit. In addition the

```jsx
const CustomSubmit = ({ onSubmit }) => (<button onClick={onSubmit}>Submit</button>);
...
<Form.Control
	name="custom_submit"
	component={CustomSubmit}
	submit
/>
```

## Examples

### Managed Form

A managed form lets you manage the state of the form yourself

```jsx
import React from "react";
import { Form } from "react-forms-system";
import { NameInputComponent } from "../somewherelocal/NameInputComponent";

class ManagedForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { firstName: "", lastName: "" };
  }

  render() {
    return (
      <Form onStateChange={(formState) => this.setState(formState.values)}>
        <Form.Control
          name="firstName"
          component={NameInputComponent}
          value={this.state.firstName}
        />
        <Form.Control
          name="lastName"
          component={NameInputComponent}
          value={this.state.lastName}
        />
      </Form>
    );
  }
}
```

### Unmanaged Form

An unmanaged form manages its own state internally. Notice that all controls have a `defaultValue` which is required for unmanaged forms.

```jsx
import React from "react";
import { Form } from "react-forms-system";
import { NameInputComponent } from "../somewherelocal/NameInputComponent";

const UnmanagedForm = () => {
  return (
    <Form onSubmit={console.log}>
      <Form.Control
        name="firstName"
        component={NameInputComponent}
        defaultValue=""
      />
      <Form.Control
        name="lastName"
        component={NameInputComponent}
        defaultValue=""
      />
    </Form>
  );
};
```

### Control Wrapper

Each control used in the form must be wrapped in a HOC. The HOC will recieve props from the form and allow the underlying control to render itself appropriately. In addition, any props passed to the `<Form.Control />` component will be passed strait through the HOC to the underlying control, as long as they don't conflict with the `<Form.Control />` API. The underlying component is then also required to apply its own value `value` and fire off events when that value has changed (`onChange`) as well as to signify a touch of the component (`onTouch`).

```jsx
// NameInputComponent.jsx
import React from "react";

export default ({ value, onChange, onTouch }) => {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => onTouch()}
    />
  );
};
```

### Basic Validation

Each control is passed a set of validation states (`validationState`) as a prop, which can be used to render itself appropriately for validation states. The inherent members of `validationState` are dirty, touched, pending and valid.

**dirty** - The control has fired the `onChange` event

**touched** - The control has fired the `onTouch` event

**pending** - One or more of the validators is still running.

**valid** - All the validators return true or `isValidCheck` callback returns true

These four validation states are also available globally to the whole form directly under the `validationState` key. a.k.a. `validationState.dirty` expresses whether or not the form is dirty. The meanings for the form level keys are the same.

```jsx
// NameInputComponent.jsx
import React from 'react';

export default ({ value, onChange, onTouch, validationState }) => {
    const className = (validationState.touched || validationState.dirty) &&
          validationState.valid ? '' : 'invalid';
    return (
        <input
            className={className}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onClick={(e) => onTouch()}
        />
    );
};

// Form.jsx
import React from 'react';
import { Form } from 'react-forms-system';
import { NameInputComponent } from 'NameInputComponent';

const required = (value) => !!value;
// validAlwaysFalse will force valdiationState.valid to be false for any control that uses it, in this example its being used on lastName control
const validAlwaysFalse => (validationState) => false;

const UnmanagedForm = () => {
   	return (
        <Form onSubmit={console.log} >
            <Form.Control
                name="firstName"
                component={NameInputComponent}
                defaultValue={''}
                validators={{ required }}
            />
            <Form.Control
                name="lastName"
                component={NameInputComponent}
                defaultValue={''}
                isValidCheck={validAlwaysFalse}
                validators={{ required }}
            />
        </Form>
    );
};
```

### Cross Control Validation

You can pass the prop `peerDependencies` to a control to get it to include a peer controls value in any validators it runs. The following example will only validate the location and provider fields if one of them has a value. The format for passing `peerDependencies` is:

```javascript
{{ 'control name': 'validator alias name' }}
```

**control name** - The name of the peer control

**validator alias name** - the key name you want the value of the target control to be referenced as under in peerValues of the validator.

```jsx
// Form.jsx
import React from "react";
import { Form } from "react-forms-system";
import { NameInputComponent } from "NameInputComponent";

const myselfOrPeer = (value, peerValues) => !!value || !!peerValues.peer;

const UnmanagedForm = () => {
  return (
    <Form onSubmit={console.log}>
      <Form.Control
        name="provider"
        component={NameInputComponent}
        defaultValue={""}
        validators={{ myselfOrPeer }}
        peerDependencies={{
          location: "peer",
        }}
      />
      <Form.Control
        name="location"
        component={NameInputComponent}
        defaultValue={""}
        validators={{ myselfOrPeer }}
        peerDependencies={{
          provider: "peer",
        }}
      />
    </Form>
  );
};
```

## Related Projects

Here is a list of other react form projects that are similar in purpose to `react-forms-system`.

- https://www.npmjs.com/package/informed
- https://www.npmjs.com/package/formik

## Roadmap

- Better error messages for poor use of api
- debounce state updates
- Test coverage
- Optimize Depencencies
- Hosted docs
- Bundle optimization
- Supporting package with prebuilt controls
- Supporting package with common validators
- More examples
