
export function deepClone(obj) {
    let cloneObj = {};
    for (let key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        cloneObj[key] = deepClone(obj[key]);
      } else {
        cloneObj[key] = obj[key];
      }
    }
    return cloneObj;
  }