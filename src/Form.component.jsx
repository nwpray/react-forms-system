import React from 'react';

import Control from './Control.component';
import ObjectHelpers from './ObjectHelpers';

const or = (chain, defaultValue = undefined) =>
    Object.values(chain).reduce(
        (selected, current) =>
            !selected && typeof current !== 'undefined' && current !== null ? current : selected,
        undefined
    ) || defaultValue;

const defaultIsValidationCheck = validationState =>
    Object.keys(validationState).reduce(
        (valid, validatorName) => (!validationState[validatorName] ? false : valid),
        true
    );

const TYPE_CONTROL = 'Control';
const BINDABLE_CONTROLS = [TYPE_CONTROL];
const PROPS_TO_REMOVE = ['onStateChange'];

class Form extends React.Component {
    constructor(props) {
        super(props);

        this.validators = {};
        this.peerDependencies = {};
        this.isValidChecks = {};

        const controls = this.getControlList(props.children);
        const validationState = Object.keys(controls).reduce(
            (validation, controlName) => ({
                ...validation,
                [controlName]: { dirty: false, touched: false, pending: [] }
            }),
            {}
        );

        this.state = { currentStateValues: controls, validationState };
    }

    componentDidUpdate(props, state) {
        const { onStateChange, state: propsState } = this.props;
        const { values: currentStateValues } = this.state;

        if (
            onStateChange &&
            ((propsState && propsState !== this.getState()) || state !== this.state)
        ) {
            onStateChange(this.getState());
        }

        const modifiedControlValues = Object.keys(currentStateValues).reduce(
            (modifiedControls, controlName) =>
                state.values[controlName] !== currentStateValues[controlName]
                    ? [...modifiedControls, controlName]
                    : modifiedControls,
            []
        );

        // TODO : Make sure controls don't ever validate twice
        modifiedControlValues.forEach(controlName => this.runValidation(controlName));
    }

    onSubmit(e) {
        e.preventDefault();

        const { validationState: currentValidationState } = this.state;
        const { onSubmit } = this.props;

        this.setState(
            {
                validationState: {
                    ...Object.keys(currentValidationState).reduce(
                        (validationState, controlName) => ({
                            ...validationState,
                            [controlName]: {
                                ...currentValidationState[controlName],
                                dirty: true,
                                touched: true
                            }
                        }),
                        {}
                    )
                }
            },
            () => onSubmit && onSubmit(this.state)
        );
    }

    getState() {
        const { state } = this.props;
        return state || this.state;
    }

    getControlList(children) {
        return React.Children.toArray(children).reduce((controls, child) => {
            let updatedControls = controls;

            // Handles simple children like strings
            if (!child.props) {
                return controls;
            }

            // Bind children
            if (child.props.children) {
                updatedControls = { ...controls, ...this.getControlList(child.props.children) };
            }

            // Bind control if bindable type and has name prop
            if (BINDABLE_CONTROLS.indexOf(child.type.name) > -1 && child.props.name) {
                const state = this.getState();

                // Determine value
                let value =
                    typeof child.props.value !== 'undefined' ? child.props.value : undefined;

                if (
                    typeof value === 'undefined' &&
                    state &&
                    typeof state[child.props.name] !== 'undefined'
                ) {
                    value = state[child.props.name];
                } else if (
                    typeof value === 'undefined' &&
                    typeof child.props.defaultValue !== 'undefined'
                ) {
                    value = child.props.defaultValue;
                }

                updatedControls = { ...updatedControls, [child.props.name]: value };
            }

            return updatedControls;
        }, {});
    }

    getChildren(children) {
        return React.Children.map(children, child => {
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

            // Update validators
            if (props.name && props.validators) {
                this.validators[props.name] = props.validators;
            }

            // Update peerDepencencies
            if (props.name && props.peerDependencies) {
                this.peerDependencies[props.name] = props.peerDependencies;
            }

            // Update isValidChecks
            if (props.name && props.isValidCheck) {
                this.isValidChecks[props.name] = props.isValidCheck;
            }

            // Bind control if bindable type and has name prop
            if (BINDABLE_CONTROLS.indexOf(child.type.name) > -1 && props.name) {
                const state = this.getState();

                // Bind change handler
                const onValueChange = value => {
                    const stateDuringChange = this.getState();
                    if (stateDuringChange[props.name] !== value) {
                        // Set the form state then run validation
                        this.setState({
                            values: {
                                ...stateDuringChange.values,
                                [props.name]: value
                            },
                            validationState: {
                                ...stateDuringChange.validationState,
                                [props.name]: {
                                    ...(stateDuringChange.validationState[props.name] || {}),
                                    dirty: true
                                }
                            }
                        });
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
                                touched: true
                            }
                        }
                    });
                };

                const { validationState } = this.state;

                // Update the properties
                props = {
                    ...props,
                    controlName: props.name,
                    onValueChange,
                    onTouched,
                    validationState: validationState[props.name]
                };

                // Determine value
                props = {
                    ...props,
                    value: or(
                        [
                            props.value,
                            state && state.values && state.values[props.name],
                            props.defaultValue
                        ],
                        undefined
                    )
                };
            }

            // Clone the element with the updated props
            return React.cloneElement(child, props);
        });
    }

    runValidation(fieldName) {
        // TODO : Really need to find a good way to debounce this validation
        const { validationState, values: currentStateValues } = this.state;

        // Aggregate the list of validators for controls that need to run validation
        const validatorsByControl = [
            fieldName,
            ...Object.keys(this.peerDependencies[fieldName] || {})
        ].reduce(
            (list, controlName) => ({ ...list, [controlName]: this.validators[controlName] || {} }),
            {}
        );

        const pendingTimeStamp = +new Date();

        // Set all control validation states to pending
        this.setState({
            validationState: {
                ...validationState,
                ...Object.keys(validatorsByControl).reduce(
                    (pendingControls, controlName) => ({
                        ...pendingControls,
                        [controlName]: {
                            ...validationState[controlName],
                            pending: [
                                ...(validationState[controlName].pending || []),
                                pendingTimeStamp
                            ]
                        }
                    }),
                    {}
                )
            }
        });

        // Run validators
        Promise.all(
            Object.keys(validatorsByControl).map(controlName => {
                // Collect values
                const value = currentStateValues[controlName];
                const peerValues = Object.keys(this.peerDependencies[controlName] || {}).reduce(
                    (values, peerName) => ({
                        ...values,
                        [this.peerDependencies[controlName][peerName]]: currentStateValues[peerName]
                    }),
                    {}
                );

                // Get validators specific to this control
                const controlValidators = validatorsByControl[controlName];

                // Run all validators specific to this control
                return Promise.all(
                    Object.keys(controlValidators).map(validatorName =>
                        controlValidators[validatorName](value, peerValues)
                    )
                );
            }, [])
        ).then(validatorResult => {
            const { validationState: postValidationState } = this.state;

            // Map the result back to the validatorsByControl object structure
            let validationUpdates = Object.keys(validatorsByControl).reduce(
                (controlValidators, controlName, controlIndex) => ({
                    ...controlValidators,
                    [controlName]: Object.keys(validatorsByControl[controlName]).reduce(
                        (validators, validatorName, validatorIndex) => ({
                            ...validators,
                            [validatorName]: validatorResult[controlIndex][validatorIndex]
                        }),
                        {}
                    )
                }),
                {}
            );

            // Sets all control pending states to false and determines if form is valid overall
            validationUpdates = Object.keys(validationUpdates).reduce(
                (controlValidators, controlName) => {
                    const isValidCheck =
                        this.isValidChecks[controlName] || defaultIsValidationCheck;
                    return {
                        ...controlValidators,
                        [controlName]: {
                            ...validationUpdates[controlName],
                            pending: (postValidationState[controlName].pending || []).filter(
                                timeStamp => timeStamp !== pendingTimeStamp
                            ),
                            valid: isValidCheck(validationUpdates[controlName])
                        }
                    };
                },
                {}
            );

            const { state } = this;

            // Update the forms validationState with the computed validation changes
            this.setState({
                ...state,
                validationState: {
                    ...postValidationState,
                    ...Object.keys(validationUpdates).reduce(
                        (updates, controlName) => ({
                            ...updates,
                            [controlName]: {
                                ...(postValidationState[controlName] || {}),
                                ...postValidationState[controlName]
                            }
                        }),
                        {}
                    )
                }
            });
        });
    }

    render() {
        const { props } = this;
        const { children } = props;

        const filteredProps = ObjectHelpers.removeKeys(props, PROPS_TO_REMOVE);

        filteredProps.method = filteredProps.method || 'post';
        filteredProps.onSubmit = filteredProps.onSubmit || (e => e.preventDefault());

        return (
            <form {...props} onSubmit={e => this.onSubmit(e)}>
                {this.getChildren(children)}
            </form>
        );
    }
}

Form.Control = Control;

export default Form;
