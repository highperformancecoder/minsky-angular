export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const green = (anything: unknown): string => {
  return '\x1b[32m' + `${anything}`;
};

export const red = (anything: unknown): string => {
  return '\x1b[31m' + `${anything}`;
};

export const isPackaged = () => {
  // https://github.com/ganeshrvel/npm-electron-is-packaged/blob/master/lib/index.js

  let isPackaged = false;

  if (
    process.mainModule &&
    process.mainModule.filename.indexOf('app.asar') !== -1
  ) {
    isPackaged = true;
  } else if (
    process.argv.filter((a) => a.indexOf('app.asar') !== -1).length > 0
  ) {
    isPackaged = true;
  }

  return isPackaged;
};
