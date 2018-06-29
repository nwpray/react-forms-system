import React from 'react';

import Control from './Control.component';

const or = (chain, defaultValue = undefined) => {
	for(let i in chain){
		if(typeof chain[i] !== 'undefined' && chain[i] !== null) return chain[i];
	}

	return defaultValue;
};
const defaultIsValidationCheck = (validationState) => {
    return Object.keys(validationState).reduce((valid, validatorName) => {
        return !validationState[validatorName] ? false : valid;
    }, true);
};

const TYPE_CONTROL = 'Control';
const BINDABLE_CONTROLS = [ TYPE_CONTROL ];

const propsToRemove = ['onStateChange'];

export default class Form extends React.Component{
	static Control = Control;

	validators = {};
	peerDependencies = {};
    isValidChecks = {};

	constructor(props) {
		super(props);
		const controls = this.getControlList(props.children);
		const validationState = Object.keys(controls).reduce((validation, controlName) => {
			return { ...validation, [controlName]: { dirty: false, touched: false, pending: [] }};
		}, {});

		this.state = { values: controls, validationState: validationState};
	}
	setState(stateUpdates, callback = undefined){
		const { onStateChange } = this.props;

		const callbackWrapper = () => {
			onStateChange && onStateChange(this.getState());
			callback && callback();
		};

		super.setState(stateUpdates, callbackWrapper);
	}
	getState(){
		return this.props.state || this.state;
	}
	getControlList(children){
        return React.Children.toArray(children).reduce((controls, child) => {

            // Handles simple children like strings
        	if(!child.props){
        		return controls;
			}

            // Bind children
            if(child.props.children){
            	controls = { ...controls, ...this.getControlList(child.props.children)};
            }

            // Bind control if bindable type and has name prop
            if(BINDABLE_CONTROLS.indexOf(child.type.name) > -1 && child.props.name){
            	const state = this.getState();

                // Determine value
				let value = typeof child.props.value !== 'undefined' ? child.props.value : undefined;

				if(typeof value === 'undefined' && state && typeof state[child.props.name] !== 'undefined'){
                    value = state[child.props.name];
				}
				else if(typeof value === 'undefined' && typeof child.props.defaultValue !== 'undefined'){
					value = child.props.defaultValue;
				}

				controls = { ...controls, [child.props.name]: value };
            }

            return controls;
        }, {});
	}
	getChildren(children){
		return React.Children.map(children, (child) => {

			// If it is a simple child like a string we only need to return it
			// Simple child is anything that would be considered the tags body text in regular html
			if(!child.props){
				return child;
			}

			let props = { ...child.props };

            // Bind children
			if(props.children){
				props = { ...props, children: this.getChildren(props.children) };
			}

			// Update validators
			if(props.name && props.validators){
				this.validators[props.name] = props.validators;
			}

			// Update peerDepencencies
			if(props.name && props.peerDependencies){
				this.peerDependencies[props.name] = props.peerDependencies;
			}

			// Update isValidChecks
			if(props.name && props.isValidCheck){
				this.isValidChecks[props.name] = props.isValidCheck;
			}

			// Bind control if bindable type and has name prop
			if(BINDABLE_CONTROLS.indexOf(child.type.name) > -1 && props.name){

                const state = this.getState();

                // Bind change handler
                const onValueChange = (value) => {
                    const state = this.getState();
                    if (state[props.name] !== value) {

						// Set the form state then run validation
						this.setState({
                            values: {
                            	...state.values,
								[props.name]: value
							},
                            validationState:{
                                ...state.validationState,
                                [props.name]: {
                                    ...(state.validationState[props.name] || {}),
                                    dirty: true
                                }
                            }
                        }, () => {
							this.runValidation(props.name)
						});
                    }
                };

                // Bind touched handler
                const onTouched = () => {
                	const state = this.getState();
						this.setState({
							...state,
							validationState: {
								...state.validationState,
								[props.name]: {
									...(state.validationState[props.name] || {}),
									touched: true
								}
							}
						});
				};

                // Update the properties
				props = {
					...props,
					controlName: props.name,
					onValueChange,
					onTouched,
					validationState: this.state.validationState[props.name]
				};

				// Determine value
				props = { ...props, value: or([props.value, state && state.values && state.values[props.name], props.defaultValue], undefined)};
			}

			// Clone the element with the updated props
			return React.cloneElement(child, props);
		});
	}
	runValidation(fieldName){

        // Aggregate the list of validators for controls that need to run validation
		const validatorsByControl = [ fieldName, ...Object.keys(this.peerDependencies[fieldName] || {})].reduce(( list, controlName ) => {
			return { ...list, [controlName]: (this.validators[controlName] || {}) };
		}, {});

		const pendingTimeStamp = + new Date();

		// Set all control validation states to pending
		this.setState({
			validationState:{
				...this.state.validationState,
				...Object.keys(validatorsByControl).reduce((pendingControls, controlName) => {
					return {
						...pendingControls,
						[controlName]: {
							...this.state.validationState[controlName],
							pending: [ ...(this.state.validationState[controlName].pending || []), pendingTimeStamp]
						}
					};
				}, {})
			}
		});

		// Run validators
		Promise.all(Object.keys(validatorsByControl).map(controlName => {
			// Collect values
			const value = this.state.values[controlName];
			const peerValues = Object.keys(this.peerDependencies[controlName] || {}).reduce((values, peerName) => {
				return { ...values, [this.peerDependencies[controlName][peerName]]: this.state.values[peerName] };
			}, {});

			// Get validators specific to this control
			const controlValidators = validatorsByControl[controlName];

			// Run all validators specific to this control
			return Promise.all(Object.keys(controlValidators).map((validatorName) => {
				return controlValidators[validatorName](value, peerValues);
			}));

		}, []))
			.then(validatorResult => {
				// Map the result back to the validatorsByControl object structure
				let validationUpdates = Object.keys(validatorsByControl).reduce(( controlValidators, controlName, controlIndex ) => {
					return {
						...controlValidators,
						[controlName]: Object.keys(validatorsByControl[controlName]).reduce(( validators, validatorName, validatorIndex) => {
							return {
								...validators,
								[validatorName]: validatorResult[controlIndex][validatorIndex]
							};
						}, {})
					};
				}, {});

				// Sets all control pending states to false and determines if form is valid overall
				validationUpdates = Object.keys(validationUpdates).reduce((controlValidators, controlName) => {
					const isValidCheck = this.isValidChecks[controlName] || defaultIsValidationCheck;
					return {
						...controlValidators,
						[controlName]: {
                            ...validationUpdates[controlName],
                            pending: ( this.state.validationState[controlName].pending || []).filter((timeStamp) => timeStamp !== pendingTimeStamp),
                            valid: isValidCheck(validationUpdates[controlName])
						}
					};
				}, {});

				// Update the forms validationState with the computed validation changes
				this.setState({
					...this.state,
					validationState: {
						...this.state.validationState,
						...Object.keys(validationUpdates).reduce((updates, controlName) => {
							return {
								...updates,
								[controlName] : {
                                    ...( this.state.validationState[controlName] || {} ),
                                    ...validationUpdates[controlName]
								}
							};
						}, {})
					}
				});
			});

	}
	onSubmit(e){
        e.preventDefault();

        this.setState({
			validationState: {
                ...Object.keys(this.state.validationState).reduce((validationState, controlName) => {
                    return {
						...validationState,
                        [controlName]: {
                            ...this.state.validationState[controlName],
                            dirty: true,
                            touched: true
                        }
                    }
                }, {})
			}
		}, () => this.props.onSubmit && this.props.onSubmit(this.state));
	}
	render(){
		const props = Object.keys(this.props).reduce(
			(props, current) => propsToRemove.indexOf(current) > -1 ? props : { ...props, [current]: this.props[current]},
			{}
		);

		props.method = props.method || 'post';
		props.onSubmit = props.onSubmit || (e => e.preventDefault());

		return (
			<form { ...props } onSubmit={(e) => this.onSubmit(e)} >
				{this.getChildren(this.props.children)}
			</form>
		);
	}
}