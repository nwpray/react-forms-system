import Form from './Form.component';

export { Form };
/*import React from 'react';
import ReactDOM from 'react-dom';

import Form from './Form.component';

const CustomComponent = ({ value, onValueChange }) => {
	return <button onClick={(e) => onValueChange(value + 1)}>{value}</button>
};

const CustomComponentColored = ({ value, onValueChange }) => {
	return <button onClick={(e) => onValueChange(value + 1)} style={{ background : value % 2 === 0 ? 'blue' : 'red'}}>{value}</button>
};

const CustomArrayComponent = ({ value, onValueChange }) => {
	return <button onClick={() => onValueChange([ ...value, 'x'])}>{JSON.stringify(value)}</button>
};

class CustomClassComponent extends React.Component{
	render(){
		const { value, onValueChange } = this.props;
		return <button onClick={() => onValueChange(value + '+')}>{value}</button>;
	}
}

class ManagedForm extends React.Component{
	constructor(props){
		super(props);

		this.state = {
			values: {
                counter: 0,
                array: [],
                class: '+'
			},
			validation: {}
		};
	}
	render(){
		return (
            <Form onStateChange={(state) => this.setState(state)}>
                <div>
                    <Form.Control name="counter" component={CustomComponent} value={this.state.values.counter} />
                </div>
                <Form.Control name="array" component={CustomArrayComponent} value={this.state.values.array} />
                <Form.Control name="class" component={CustomClassComponent} value={this.state.values.class} />
                <Form.Control name="counter" component={CustomComponentColored} value={this.state.values.counter} />
            </Form>
		);
	}
}

const UnmanagedForm = () => {
	return (
        <Form onStateChange={console.log}>
            <div>
                <Form.Control name="counter" component={CustomComponent} defaultValue={0} />
            </div>
            <Form.Control name="array" component={CustomArrayComponent} defaultValue={[]} />
            <Form.Control name="class" component={CustomClassComponent} defaultValue={'+'} />
            <Form.Control name="counter" component={CustomComponentColored} defaultValue={0} />
        </Form>
	);
};

// =======================

const required = (value) => {
	return !!value;
};
const isString = (value) => typeof value === 'string';
const isNumber = (value) => typeof value === 'number';
const startsWithA = (value) => isString(value) && value && value[0].toLowerCase() === 'a';
const asyncValidator = (value) => new Promise((resolve) => resolve(true));

const ValidatedInput = ({ value, onValueChange, onTouched, validation }) => {
	const style = (validation.touched || validation.dirty) && !validation.valid ? {
		background: 'rgba(255, 0, 0, 0.2)',
		color: 'red'
	} : {};
    return (
    	<React.Fragment>
    		<input value={value}
				   onFocus={(e) => onTouched()}
				   onChange={(e) => onValueChange(e.target.value)}
				   style={style}
			/>
			{ (validation.touched || validation.dirty) && !validation.startsWithA && <div>Input must start with a or A</div>}
		</React.Fragment>
	);
};

const ValidatedForm = () => {
	return (
		<Form onStateChange={console.log}>
			<Form.Control name="validatedInput"
						  component={ValidatedInput}
						  defaultValue={''}
						  validators={{ required, isString, startsWithA, asyncValidator }}
			/>
		</Form>
	);
};

// =======================

ReactDOM.render(
	<React.Fragment>
		<h3>Managed Form</h3>
        <ManagedForm />
		<h3>Un-managed Form</h3>
		<UnmanagedForm />
		<h3>Validated Form</h3>
		<ValidatedForm />
	</React.Fragment>,
	document.getElementById('root')
);*/