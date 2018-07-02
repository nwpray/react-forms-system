// TODO : Document
const or = (conditions, defaultCondition = undefined) => {
    const resultCondition = conditions.reduce((firstTrueCondition, currentCondition) => {
        if (typeof firstTrueCondition !== 'undefined') return firstTrueCondition;
        return currentCondition || firstTrueCondition;
    }, undefined);

    return typeof resultCondition === 'undefined' ? defaultCondition : resultCondition;
};

export default {
    or
};
