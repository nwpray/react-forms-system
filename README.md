# React Forms System

An npm package for building and managing form state with react.

### Disclaimer !!!

This package is still in beta, there are know issues or features that still need to be implemented. You may notice performance issues during async validation.

### Contents

- [Features](#features)

- [Getting Started](#getting-started)

  - [Prerequisites](#prerequisites)
  - [Installation](#installation)

- [Components](#components)

  - [Form](#form)
    - [Basic Form](#basic-form)
    - [Form State](#form-state)
  - [Control](#control)
    - [Basic Control](#basic-control)
    - [Wrapper Interface](#wrapper-interface)
    - [Validator](#validator)
    - [Peer Dependencies](#peer-dependencies)

- [Examples](#Examples)
  - [Managed Form](#managed-form)
  - [Unmanaged Form](#unmanaged-form)
  - [Control Wrapper](#control-wrapper)
  - [Basic Validation](#basic-validation)
  - [Cross Control Validation](#cross-control-validation)

- [Related Projects](#related-projects)

  

## Features

- Minimal library components

- Control level and form level validation

- Managed or unmanaged state

- Dirty, touched and pending states

- Customizable controls

- Built in peer control evaluation

  

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



## Components

### Form

`<Form />` is a HOC that manages and maintains the state of all the `<control />` that are nested below it.



##### Props

| Prop          | Type              | Description                                                  |
| ------------- | ----------------- | ------------------------------------------------------------ |
| onSubmit      | (FormState)=>void | onSubmit is called any time the html submit event is called. It passes the entire state of the form as its only argument. |
| onStateChange | (FormState)=>void | onStateChange is called every time there is a state update. It passes the entire state of the form as its only argument. |
| ....          | ....              | All other props passed will be directly applied to the underlying html `<form />` component. |



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



### Control

A `<Control />` is a HOC that wraps and provides all `<Form />` interaction to any controls you would like to use in your form.



##### Props

| Prop             | Type                       | Description                                                  |
| ---------------- | -------------------------- | ------------------------------------------------------------ |
| name             | string                     | The name to call the component                               |
| component        | React.Component            | The component to use as a control                            |
| value            | any                        | The current value of the control when using in a managed form |
| defaultValue     | any                        | The initial value of the control when using an unmanaged form |
| validators       | {}                         | A map of validators to be apply to this control on value change |
| peerDependencies | {}                         | A list of peer `<Control />` components names whos values will need to be used in one or more of the controls validators. |
| isValidCheck |(validationState)=>boolean|A predicate function that will be used to determine the overall `valid` key of the controls validationState.|
| ... |...|All other props will be applied to the component passed in `component` prop.|



##### Basic Control

```jsx
// Common use for a unmanaged form
<Form.Control 
    name="myControlName" 
    component={MyControlComponent} 
    defaultValue={''}
/>

// Common use for a managed form
<Form.Control
    name="myControlName"
    component={MyControlComponent}
    value={''}
/>
```



##### Wrapper Interface

```jsx
const MyControlComponent = ({ value, onValueChange, onTouched, validationState }) = {
    return (
 		// ...wrapped component to be used as a control goes here
    );
};
```



##### Validator

A validator is a function that takes a control value and a map of peer values and returns ` true` for passed validation and ` false` for failed validation.  A validator can also return a Promise as every single validator gets wrapped in a `Promise.all()` during evaluation.

```jsx
(value, peerValues) => !!value || !!peerValues.peer
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
    isValidCheck={(validationState) => validationState.required }
    ...
/>
```



##### Peer Dependencies

Peer dependencies are any other `<Control />` component that the current control will need values for to run its own validation. The format for passing peer dependencies is:

```jsx
<Form.Control 
    ...
    peerDependencies={{ myValidator: (value, peerValues) => ... }}
    ...
/>
```



## Examples

### Managed Form

A managed form lets you manage the state of the form yourself in a HOC around your `<Form />`

```jsx
import React from 'react';
import { Form } from 'react-forms-system';
import { NameInputComponent } from '../somewherelocal/NameInputComponent';

class ManagedForm extends React.Component{
    constructor(props){
   		super(props);
        this.state = { firstName: '', lastName: '' };
    }
    
    render(){
        return (
            <Form onStateChange={formState => this.setState(formState.values)} >
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

An unmanaged form manages its own state internally

```jsx
import React from 'react';
import { Form } from 'react-forms-system';
import { NameInputComponent } from '../somewherelocal/NameInputComponent';

const UnmanagedForm = () => {
   	return (
        <Form onSubmit={console.log} >
            <Form.Control 
                name="firstName" 
                component={NameInputComponent}
                defaultValue={''}
            />
            <Form.Control 
                name="lastName" 
                component={NameInputComponent} 
                value={''}
            />
        </Form>
    );
};
```



### Control Wrapper

Each control used in the form must be wrapped in a HOC. The HOC will recieve props from the form and allow the underlying control to render itself appropriately. In addition, any props passed to the `<Form.Control />` component will be passed strait through the the HOC as long as they don't conflict with the `<Form.Control />` API. The underlying component is then also required to apply its own value `value` and fire off events when that value has changed `onValueChange` as well as  to signify a touch of the component `onTouched`.

```jsx
// NameInputComponent.jsx
import React from 'react';

export default ({ value, onValueChange, onTouched }) => {
    return (
        <input 
            value={value} 
            onChange={(e) => onValueChange(e.target.value)} 
            onClick={(e) => onTouched()}
        />
    );
};
```



### Basic Validation

Each control is passed as a property a set of validation states `validationState` as a prop which can be used to render itself appropriately for validation states. The inherent members of `validationState` are dirty, touched, pending and valid. 

**Dirty** - The control has fired the `onValueChange` event

**Touched** - The control has fired the `onTouched` event

**Pending** - One or more of the validators is still running

**Valid** - All the validators return true or `isValidCheck` callback returns true

```jsx
// NameInputComponent.jsx
import React from 'react';

export default ({ value, onValueChange, onTouched, validationState }) => {
    const className = (validationState.touched || validationState.dirty) &&
          validationState.valid ? '' : 'invalid';
    return (
        <input 
            className={className}
            value={value} 
            onChange={(e) => onValueChange(e.target.value)} 
            onClick={(e) => onTouched()}
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

````javascript
{{ 'control name': 'validator reference name' }}
````

**control name** - The name of the peer control

**validator reference name** - the key name you want the value of the target field to be under in peerValues of the validator.

```jsx
// Form.jsx
import React from 'react';
import { Form } from 'react-forms-system';
import { NameInputComponent } from 'NameInputComponent';

const myselfOrPeer = (value, peerValues) => !!value || !!peerValues.peer

const UnmanagedForm = () => {
   	return (
        <Form onSubmit={console.log} >
            <Form.Control 
                name="provider" 
                component={NameInputComponent}
                defaultValue={''}
                validators={{ myselfOrPeer }}
                peerDependencies={{
                    location: 'peer'
                }}
            />
            <Form.Control 
                name="location" 
                component={NameInputComponent}
                defaultValue={''}
                validators={{ myselfOrPeer }}
                peerDependencies={{
                    provider: 'peer'
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