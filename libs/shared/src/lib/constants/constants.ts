export const rendererAppPort = 4200;
export const rendererAppURL = `http://localhost:${rendererAppPort}`;
export const rendererAppName = 'minsky-web';
export const electronAppName = 'minsky-electron';
export const backgroundColor = '#c1c1c1';
export const updateServerUrl = 'https://deployment-server-url.com'; // TODO: insert your update server url here

export const defaultBackgroundColor = '#ffffff';
export const newLineCharacter = '\n';

export const ZOOM_IN_FACTOR = 1.1;
export const ZOOM_OUT_FACTOR = 0.91;
export const RESET_ZOOM_FACTOR = 1;

export const commandsMapping = {
  ADD_BOOKMARK: '/minsky/model/addBookmark',
  ADD_GODLEY: '/minsky/canvas/addGodley',
  ADD_GROUP: '/minsky/canvas/addGroup',
  ADD_NOTE: '/minsky/canvas/addNote',
  ADD_OPERATION: '/minsky/canvas/addOperation',
  ADD_PLOT: '/minsky/canvas/addPlot',
  ADD_RAVEL: '/minsky/canvas/addRavel',
  ADD_SHEET: '/minsky/canvas/addSheet',
  ADD_SWITCH: '/minsky/canvas/addSwitch',
  ADD_VARIABLE: '/minsky/canvas/addVariable',
  BOOKMARK_LIST: '/minsky/model/bookmarkList',
  COPY: `/minsky/copy`,
  CUT: `/minsky/cut`,
  DELETE_BOOKMARK: '/minsky/model/deleteBookmark',
  DELTA_T: `/minsky/deltaT`,
  DIMENSIONAL_ANALYSIS: '/minsky/dimensionalAnalysis',
  EPS_ABS: '/minsky/epsAbs',
  EPS_REL: '/minsky/epsRel',
  EXPORT_ALL_PLOTS_AS_CSV: '/minsky/exportAllPlotsAsCSV',
  GOTO_BOOKMARK: '/minsky/model/gotoBookmark',
  GROUP_SELECTION: `/minsky/canvas/groupSelection`,
  IMPLICIT: '/minsky/implicit',
  LIST: '/list',
  LOAD: '/minsky/load',
  mousedown: '/minsky/canvas/mouseDown',
  mousemove: `/minsky/canvas/mouseMove`,
  mouseup: '/minsky/canvas/mouseUp',
  ORDER: '/minsky/order',
  PASTE: `/minsky/paste`,
  PLAY: '/minsky/step',
  RECORD: 'startRecording',
  RECORDING_REPLAY: 'startRecordingReplay',
  REDO: `/minsky/undo`,
  REDRAW: '/minsky/canvas/redraw',
  REMOVE_UNITS: '/minsky/deleteAllUnits',
  RENDER_ALL_PLOTS_AS_SVG: '/minsky/renderAllPlotsAsSVG',
  RENDER_CANVAS_TO_EMF: '/minsky/renderCanvasToEMF',
  RENDER_CANVAS_TO_PDF: '/minsky/renderCanvasToPDF',
  RENDER_CANVAS_TO_PNG: '/minsky/renderCanvasToPNG',
  RENDER_CANVAS_TO_PS: '/minsky/renderCanvasToPS',
  RENDER_CANVAS_TO_SVG: '/minsky/renderCanvasToSVG',
  RENDER_FRAME: '/minsky/canvas/renderFrame',
  RESET_ZOOM: `/minsky/model/setZoom`,
  RESET: '/minsky/reset',
  REVERSE_CHECKBOX: `/minsky/reverse`,
  SAVE: '/minsky/save',
  SET_GODLEY_ICON_RESOURCE: '/minsky/setGodleyIconResource',
  SET_GROUP_ICON_RESOURCE: '/minsky/setGroupIconResource',
  SIMULATION_SPEED: '/minsky/nSteps',
  START_MINSKY_PROCESS: 'startMinskyProcess',
  STEP_MAX: '/minsky/stepMax',
  STEP_MIN: '/minsky/stepMin',
  STEP: '/minsky/step',
  T_MAX: '/minsky/tmax',
  T_ZERO: '/minsky/t0',
  T: `/minsky/t`,
  TIME_UNIT: '/minsky/timeUnit',
  UNDO: `/minsky/undo`,
  MOVE_TO: `/minsky/model/moveTo`,
  ZOOM_IN: `/minsky/canvas/model/zoom`,
  ZOOM_OUT: `/minsky/canvas/model/zoom`,
  ZOOM_TO_FIT: `/minsky/canvas/model/zoom`,
  INSERT_GROUP_FROM_FILE: '/minsky/insertGroupFromFile',
  PUSH_HISTORY: '/minsky/doPushHistory',
  CLEAR_ALL_MAPS: '/minsky/clearAllMaps',
  PUSH_FLAGS: '/minsky/pushFlags',
  CLEAR_HISTORY: '/minsky/clearHistory',
  ZOOM_FACTOR: '/minsky/model/zoomFactor',
  REL_ZOOM: '/minsky/model/relZoom',
  SET_ZOOM: '/minsky/model/setZoom',
  RECENTER: '/minsky/canvas/recentre',
  POP_FLAGS: '/minsky/popFlags',
  EDITED: '/minsky/edited',
  MARK_EDITED: '/minsky/markEdited',
  AUTO_LAYOUT: '/minsky/canvas/selection/autoLayout',
  RANDOM_LAYOUT: '/minsky/canvas/selection/randomLayout',
  KEY_PRESS: '/minsky/canvas/keyPress',
  C_BOUNDS: '/minsky/model/cBounds',
  X: '/minsky/model/x',
  Y: '/minsky/model/y',
};

export const minskyProcessReplyIndicators = {
  T: '/minsky/t=>',
  DELTA_T: '/minsky/deltaT=>',
  BOOKMARK_LIST: '/minsky/model/bookmarkList=>',
  DIMENSIONAL_ANALYSIS: '/minsky/dimensionalAnalysis=>{}',
  T_ZERO: '/minsky/t0=>',
  T_MAX: '/minsky/tmax=>',
  EPS_ABS: '/minsky/epsAbs=>',
  TIME_UNIT: '/minsky/timeUnit=>',
  STEP_MIN: '/minsky/stepMin=>',
  STEP_MAX: '/minsky/stepMax=>',
  EPS_REL: '/minsky/epsRel=>',
  ORDER: '/minsky/order=>',
  IMPLICIT: '/minsky/implicit=>',
  SIMULATION_SPEED: '/minsky/nSteps=>',
  EDITED: '/minsky/edited=>',
  C_BOUNDS: '/minsky/model/cBounds=>',
  MINSKY_PROCESS_START: '/minsky/setGodleyIconResource',
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
    GET_COMMAND_OUTPUT: 'get-command-output',
    APP_LAYOUT_CHANGED: 'app-layout-changed',
    POPULATE_BOOKMARKS: 'populate-bookmarks',
    ADD_RECENT_FILE: 'add-recent-file',
    GET_APP_VERSION: 'get-app-version',
    MINSKY_PROCESS_REPLY: 'minsky-process-reply',
    TOGGLE_MINSKY_SERVICE: 'toggle-minsky-service',
    KEY_PRESS: 'key-press',
  },
};
