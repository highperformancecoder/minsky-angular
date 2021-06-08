import { newLineCharacter } from './../constants/constants';

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

export const red = (anything: unknown): string => {
  return '\x1b[31m' + `${anything}`;
};

export const retrieveCommandValueFromStdout = ({ stdout, command }): string => {
  let response = stdout;

  if (response.includes(newLineCharacter)) {
    response = response
      .split(newLineCharacter)
      .filter((r) => Boolean(r))
      .find((r) => r.includes(command.split(' ')[0]));
  }

  if (response && response.includes(command.split(' ')[0])) {
    return response.split('=>').pop().trim();
  }
};
