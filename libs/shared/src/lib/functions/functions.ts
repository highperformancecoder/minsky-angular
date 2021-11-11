export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const green = (anything: unknown): string => {
  return '\x1b[32m' + `${anything}`;
};

export const red = (anything: unknown): string => {
  return '\x1b[31m' + `${anything}`;
};

export const getBackgroundStyle = (color) => {
  // Variables for red, green, blue values

  let colorArray;
  let r, g, b;

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If RGB --> store the red, green, blue values in separate variables
    colorArray = color.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
    );

    r = color[1];
    g = color[2];
    b = color[3];
  } else {
    // If hex --> Convert it to RGB: http://gist.github.com/983661
    colorArray = +(
      '0x' + color.slice(1).replace(color.length < 5 && /./g, '$&$&')
    );

    r = colorArray >> 16;
    g = (colorArray >> 8) & 255;
    b = colorArray & 255;
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, determine whether the color is light or dark
  if (hsp > 127.5) {
    return 'body { background-color: ' + color + '; color: black; }';
  }

  return 'body { background-color: ' + color + '; color: white; }';
};

export const isWindows = () =>
  process && process.platform === 'win32' ? true : false;

export const normalizeFilePathForPlatform = (filePath: string) => {
  if (isWindows()) {
    // quoted special characters for JSON encoding

    const character = {
      '\\': '\\\\',
      '"': '\\"',
    };

    const normalizedFilePath = filePath.replace(/[\\"]/g, function (c) {
      return character[c];
    });

    return normalizedFilePath;
  }

  return filePath;
};
