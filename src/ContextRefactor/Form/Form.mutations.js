import update from "lodash/update";

export const updateValue = (name, value) => (state) => ({
  ...state,
  values: {
    ...state.values,
    [name]: value,
  },
});

export const updateGlobalValidation = () => (state) =>
  update(state, "validationState", (validationState) => {
    const { dirty, touched, valid, pending, ...controls } = validationState;

    const controlNames = Object.keys(controls);

    return {
      ...controls,
      ...controlNames.reduce(
        (prevGlobalState, controlName) => {
          const controlState = controls[controlName];

          return {
            dirty: controlState.dirty ? true : prevGlobalState.dirty,
            touched: controlState.touched ? true : prevGlobalState.touched,
            valid: !controlState.valid ? false : prevGlobalState.valid,
            pending: controlState.pending ? true : prevGlobalState.pending,
          };
        },
        { dirty: false, touched: false, valid: true, pending: false }
      ),
    };
  });

// TODO implement global validation state
export const updateControlValidation = (name, updates) => (state) =>
  updateGlobalValidation()({
    ...state,
    validationState: {
      ...state.validationState,
      [name]: {
        ...state.validationState[name],
        ...updates,
      },
    },
  });

export const touchAll = () => (state) => {
  const { dirty, touched, valid, pending, ...controls } = state.validationState;

  const controlNames = Object.keys(controls);

  return {
    ...state,
    validationState: {
      ...state.validationState,
      dirty,
      valid,
      pending,
      touched: true,
      ...controlNames.reduce((prevControls, controlName) => {
        const { [controlName]: control } = controls;
        return {
          ...prevControls,
          [controlName]: {
            ...control,
            touched: true,
          },
        };
      }, {}),
    },
  };
};

export const changeControlName = (oldName, newName) => (state) => ({
  ...state,
  values: {
    ...state.values,
    // [oldName]: undefined,
    [newName]: state.values[oldName],
  },
  validationState: {
    ...state.validationState,
    // [oldName]: undefined,
    [newName]: state.validationState[oldName],
  },
});
