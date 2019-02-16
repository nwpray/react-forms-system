import React from "react";
import { isArray } from "lodash";

export default class Component extends React.Component {
  applyMutations(mutations) {
    if (isArray(mutations)) {
      this.setState(state =>
        mutations.reduce((newState, mutation) => mutation(newState), state)
      );
      return;
    }

    this.setState(mutations);
  }

  select(selectors, state = null) {
    if (isArray(selectors)) {
      return selectors.map(selector => selector(state || this.state));
    }

    return selectors(state || this.state);
  }

  selectProps(selectors, props = null) {
    if (isArray(selectors)) {
      return selectors.map(selector => selector(props || this.props));
    }

    return selectors(props || this.props);
  }
}
