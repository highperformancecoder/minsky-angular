export const toBoolean = (booleanString: string) => {
  if (booleanString === '{}') {
    return false;
  }

  if (booleanString === 'true') {
    return true;
  }

  if (booleanString === 'false') {
    return false;
  }

  throw new Error(`${booleanString} is not a boolean string`);
};

export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const green = (anything: unknown): string => {
  return '\x1b[32m' + `${anything}`;
};
