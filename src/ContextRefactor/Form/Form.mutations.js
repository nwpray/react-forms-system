export const updateValue = (name, value) => state => ({
  ...state,
  values: {
    ...state.values,
    [name]: value
  }
});

export const updateControlValidation = (name, updates) => state => ({
  ...state,
  validationState: {
    ...state.validationState,
    [name]: {
      ...state.validationState[name],
      ...updates
    }
  }
});

export const changeControlName = (oldName, newName) => state => ({
  ...state,
  values: {
    ...state.values,
    // [oldName]: undefined,
    [newName]: state.values[oldName]
  },
  validationState: {
    ...state.validationState,
    // [oldName]: undefined,
    [newName]: state.validationState[oldName]
  }
});
