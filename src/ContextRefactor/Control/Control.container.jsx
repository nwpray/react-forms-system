import React from "react";

import { FormContext } from "../Form";
import Control from "./Control.component";

export default ({ ...props }) => (
  <FormContext.Consumer>
    {context => <Control {...props} {...context} />}
  </FormContext.Consumer>
);
