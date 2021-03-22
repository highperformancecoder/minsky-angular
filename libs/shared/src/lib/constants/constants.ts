export const rendererAppPort = 4200;
export const rendererAppURL = `http://localhost:${rendererAppPort}`;
export const rendererAppName = 'minsky-web';
export const electronAppName = 'minsky-electron';
export const backgroundColor = '#c1c1c1';
export const updateServerUrl = 'https://deployment-server-url.com'; // TODO: insert your update server url here

export const defaultBackgroundColor = '#ffffff';
export const newLineCharacter = '\n';

export const ZOOM_IN_FACTOR = 1.1;
export const ZOOM_OUT_FACTOR = 0.9;
export const RESET_ZOOM_FACTOR = 1;
export const ZOOM_TO_FIT_FACTOR = 1;

export const commandsMapping = {
  ADD_GODLEY: '/minsky/canvas/addGodley',
  ADD_GROUP: '/minsky/canvas/addGroup',
  ADD_OPERATION: '/minsky/canvas/addOperation',
  ADD_NOTE: '/minsky/canvas/addNote',
  ADD_PLOT: '/minsky/canvas/addPlot',
  ADD_RAVEL: '/minsky/canvas/addRavel',
  ADD_SHEET: '/minsky/canvas/addSheet',
  ADD_SWITCH: '/minsky/canvas/addSwitch',
  ADD_VARIABLE: '/minsky/canvas/addVariable',
  LIST: '/list',
  LOAD: '/minsky/load',
  mousedown: '/minsky/canvas/mouseDown',
  mousemove: `/minsky/canvas/mouseMove`,
  mouseup: '/minsky/canvas/mouseUp',
  PLAY: '/minsky/step',
  RECORD: '',
  RECORDING_REPLAY: '',
  RENDER_FRAME: '/minsky/canvas/renderFrame',
  RESET_ZOOM: `/minsky/canvas/model/zoom`,
  RESET: '/minsky/reset',
  SET_GODLEY_ICON_RESOURCE: '/minsky/setGodleyIconResource',
  SET_GROUP_ICON_RESOURCE: '/minsky/setGroupIconResource',
  SIMULATION_SPEED: '/minsky/nSteps',
  STEP: '/minsky/step',
  ZOOM_IN: `/minsky/canvas/model/zoom`,
  ZOOM_OUT: `/minsky/canvas/model/zoom`,
  UNDO: `/minsky/undo`,
  CUT: `/minsky/cut`,
  COPY: `/minsky/copy`,
  PASTE: `/minsky/paste`,
  GROUP_SELECTION: `/minsky/canvas/groupSelection`,
  REVERSE_CHECKBOX: `/minsky/reverse`,
  T: `/minsky/t`,
  ADD_BOOKMARK: '/minsky/model/addBookmark',
  BOOKMARK_LIST: '/minsky/model/bookmarkList',
  DELETE_BOOKMARK: '/minsky/model/deleteBookmark',
  GOTO_BOOKMARK: '/minsky/model/gotoBookmark',
  DIMENSIONAL_ANALYSIS: '/minsky/dimensionalAnalysis',
};

export const minskyProcessReplyIndicators = {
  T: '/minsky/t=>',
  DELTA_T: '/minsky/t0=>', //TODO: implement the calculation required for deltaT
  BOOKMARK_LIST: '/minsky/model/bookmarkList=>',
};

export const availableOperations = {
  TIME: 'time',
  INTEGRATE: 'integrate',
  DIFFERENTIATE: 'differentiate',
  EULER: 'euler',
  PI: 'pi',
  ZERO: 'zero',
  ONE: 'one',
  INF: 'inf',
  PERCENT: 'percent',
  ADD: 'add',
  SUBTRACT: 'subtract',
  MULTIPLY: 'multiply',
  DIVIDE: 'divide',
  MIN: 'min',
  MAX: 'max',
  AND_: 'and_',
  OR_: 'or_',
  LOG: 'log',
  POW: 'pow',
  POLYGAMMA: 'polygamma',
  LT: 'lt',
  LE: 'le',
  EQ: 'eq',
  SQRT: 'sqrt',
  EXP: 'exp',
  LN: 'ln',
  SIN: 'sin',
  COS: 'cos',
  TAN: 'tan',
  ASIN: 'asin',
  ACOS: 'acos',
  ATAN: 'atan',
  SINH: 'sinh',
  COSH: 'cosh',
  TANH: 'tanh',
  ABS: 'abs',
  FLOOR: 'floor',
  FRAC: 'frac',
  NOT_: 'not_',
  GAMMA: 'gamma',
  FACT: 'fact',
  SUM: 'sum',
  PRODUCT: 'product',
  INFIMUM: 'infimum',
  SUPREMUM: 'supremum',
  ANY: 'any',
  ALL: 'all',
  INF_INDEX: 'infIndex',
  SUP_INDEX: 'supIndex',
  RUNNING_SUM: 'runningSum',
  RUNNING_PRODUCT: 'runningProduct',
  DIFFERENCE: 'difference',
  INNER_PRODUCT: 'innerProduct',
  OUTER_PRODUCT: 'outerProduct',
  INDEX: 'index',
  GATHER: 'gather',
  RAVEL: 'ravel',
  DATA: 'data',
  CONSTANT: 'constant',
  USER_FUNCTION: 'userFunction',
  COPY: 'copy',
  NUM_OPS: 'numOps',
};

export const events = {
  ipc: {
    SET_BACKGROUND_COLOR: 'set-background-color',
    CREATE_MENU_POPUP: 'create-menu-popup',
    MINSKY_PROCESS: 'minsky-process',
    GET_MINSKY_COMMANDS: 'get-minsky-commands',
    APP_LAYOUT_CHANGED: 'app-layout-changed',
    POPULATE_BOOKMARKS: 'populate-bookmarks',
    ADD_RECENT_FILE: 'add-recent-file',
    GET_APP_VERSION: 'get-app-version',
    MINSKY_PROCESS_REPLY: 'minsky-process-reply',
    TOGGLE_MINSKY_SERVICE: 'toggle-minsky-service',
  },
};
