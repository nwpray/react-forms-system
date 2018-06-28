# React Forms System

An npm package for building and managing form state with react.

### Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Examples](#Examples)
  - [Managed Form](#managed-form)
  - [Unmanaged Form](#unmanaged-form)
  - [Control Wrapper](#control-wrapper)
  - [Basic Validation](#basic-validation)
  - [Cross Control Validation](#cross-control-validation)
- [Features](#features)
- [Related Projects](#related-projects)

## Getting Started



### Prerequisits

React

```
$ npm i react
```



### Installation

```
$ npm i react-forms-system
```

### 

## Components

### Form



### Control



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



## Features

- Minimal library components
- Control level and form level validation
- Managed or unmanaged state
- Dirty, touched and pending states
- Customizable controls
- Built in peer control evaluation

## Related Projects

Here is a list of other react form projects that are similar in purpose to `react-forms-system`.

- https://www.npmjs.com/package/informed
- https://www.npmjs.com/package/formik