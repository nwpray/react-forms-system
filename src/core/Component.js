import React from "react";
import isArray from "lodash/isArray";

export default class Component extends React.Component {
  applyMutations(mutations, callback) {
    this.setState(
      (state) =>
        (isArray(mutations) ? mutations : [mutations]).reduce(
          (newState, mutation) => mutation(newState),
          state
        ),
      callback
    );
  }

  select(selectors, state = null) {
    const wasArray = isArray(selectors);

    const results = (wasArray ? selectors : [selectors]).map((selector) =>
      selector(state || this.state)
    );

    return wasArray ? results : results[0];
  }

  selectProps(selectors, props = null) {
    const wasArray = isArray(selectors);

    const results = (wasArray ? selectors : [selectors]).map((selector) =>
      selector(props || this.props)
    );

    return wasArray ? results : results[0];
  }
}
