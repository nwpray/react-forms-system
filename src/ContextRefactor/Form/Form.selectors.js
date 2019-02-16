export const controlDirty = name => state => state.validationState[name].dirty;
export const controlTouched = name => state =>
  state.validationState[name].touched;
export const controlValue = name => state => state.values[name];
export const controlValueChanged = (name, value) => state =>
  state.values[name] !== value;
