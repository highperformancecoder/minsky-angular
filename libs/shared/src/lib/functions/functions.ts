export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const green = (anything: unknown): string => {
  return '\x1b[32m' + `${anything}`;
};

export const red = (anything: unknown): string => {
  return '\x1b[31m' + `${anything}`;
};
