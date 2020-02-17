export const applyMutations = (...mutations) => state =>
  mutations.reduce((newState, mutation) => mutation(newState), state);
