export const formValue = () => (props) => props.formState.values[props.name];
export const validationState = () => (props) => {
  const { formState } = props;
  const { validationState: vState } = formState || {};
  const { [props.name]: state } = vState || {};

  return state;
};
export const component = () => (props) => props.component;
export const name = () => (props) => props.name;
export const isValidCheck = () => (props) => props.isValidCheck;
export const peerDependencies = () => (props) => props.peerDependencies;
export const validators = () => (props) => props.validators;
export const value = () => (props) => props.value;
