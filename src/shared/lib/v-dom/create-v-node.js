export const createVNode = (type, props, children) => ({
  type,
  props,
  children: children
    .flat(Infinity)
    .filter((value) => value === 0 || Boolean(value)),
});
