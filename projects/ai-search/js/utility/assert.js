export function assertHandler(name, fn) {
  if (typeof fn !== 'function') {
    throw new Error(`"${name}" must be a function`);
  }
}

export function assertNotUndefined(name, value) {
  if (typeof value === 'undefined') {
    throw new Error(`"${name}" is undefined`);
  }
}