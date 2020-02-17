/**
 * applyValue
 *
 * TODO : Document applyValue
 */
export const applyValue = (subjectObj, value) =>
    Object.keys(subjectObj).reduce(
        (newState, currentKey) => ({ ...newState, [currentKey]: value }),
        {}
    );

/**
 * chooseKeys
 *
 * chooseKeys takes 'subjectObj' and returns a copy that only has the subset of white listed 'keys' that are both a key of 'subjectObj' and contained within 'keys'
 *
 * @param subjectObj (object) - The object you want to use as a baseline
 * @param keys (string[]) - The only keys you want the object to have
 *
 * @return (object) - A clone of 'subjectObj' that only has keys from 'keys'
 */
export const chooseKeys = (subjectObj, keys) =>
    Object.keys(subjectObj).reduce(
        (newObj, currentKey) =>
            keys.indexOf(currentKey) < 0
                ? newObj
                : { ...newObj, [currentKey]: subjectObj[currentKey] },
        {}
    );

/**
 * removeKeys
 *
 * removeKeys takes 'subjectObj' and returns a copy that has any 'keys' that are keys of 'subjectObj' removed
 *
 * @param subjectObj (object) - The object you want to use as a baseline
 * @param keys (string[]) - The keys you want to remove
 *
 * @return (object) - A clone of 'subjectObj' with 'keys' removed
 */
export const removeKeys = (subjectObj, keys) =>
    Object.keys(subjectObj).reduce(
        (newObj, currentKey) =>
            keys.indexOf(currentKey) > -1
                ? newObj
                : { ...newObj, [currentKey]: subjectObj[currentKey] },
        {}
    );

export default {
    applyValue,
    chooseKeys,
    removeKeys
};
