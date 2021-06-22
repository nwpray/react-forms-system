import React from "react";

const flattenDescendants = (children) =>
  React.Children.toArray(children).reduce((flattenedChildren, child) => {
    const { props } = child;
    const { children: propsChildren } = props || {};

    const childChildren =
      !props || !propsChildren ? [] : flattenDescendants(propsChildren);

    return [...flattenedChildren, child, ...childChildren];
  }, []);

/**
 * TODO: Document
 *
 * @param {*} children
 * @param {*} propsToMatch
 */
const filterChildren = (children, filterCondition, recursive = false) =>
  React.Children.toArray(children).reduce((filteredChildren, child) => {
    const { props } = child;
    const { children: propsChildren } = props || {};

    let filteredChildrenUpdates = [];

    if (props && propsChildren && recursive) {
      filteredChildrenUpdates = [
        ...filteredChildrenUpdates,
        ...filterChildren(props.children, filterCondition, recursive),
      ];
    }

    if (filterCondition(child)) {
      filteredChildrenUpdates = [...filteredChildrenUpdates, child];
    }

    return [...filteredChildren, ...filteredChildrenUpdates];
  }, []);

export default {
  flattenDescendants,
  filterChildren,
};
