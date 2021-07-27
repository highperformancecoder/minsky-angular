export const rendererAppPort = 4200;
export const rendererAppURL = `http://localhost:${rendererAppPort}`;
export const rendererAppName = 'minsky-web';
export const electronAppName = 'minsky-electron';
export const backgroundColor = '#c1c1c1';
export const updateServerUrl = 'https://deployment-server-url.com'; // TODO: insert your update server url here

export const defaultBackgroundColor = '#ffffff';

export const ZOOM_IN_FACTOR = 1.1;
export const ZOOM_OUT_FACTOR = 0.91;
export const RESET_ZOOM_FACTOR = 1;

export const USE_MINSKY_SYSTEM_BINARY = true;
export const USE_FRONTEND_DRIVEN_RENDERING = false;

export const MINSKY_SYSTEM_HTTP_SERVER_PATH = 'minsky-httpd';
export const MINSKY_HTTP_SERVER_PORT = 4444;
export const MINSKY_HTTP_PROXY_SERVER_PORT = 5555;

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
  LIST_V2: '/minsky/@list',
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
  AUTO_LAYOUT: '/minsky/autoLayout',
  RANDOM_LAYOUT: '/minsky/randomLayout',
  KEY_PRESS: '/minsky/canvas/keyPress',
  C_BOUNDS: '/minsky/model/cBounds',
  X: '/minsky/model/x',
  Y: '/minsky/model/y',
  CANVAS_SELECTION_EMPTY: '/minsky/canvas/selection/empty',
  CANVAS_DELETE_ITEM: '/minsky/canvas/deleteItem',
  CANVAS_DELETE_WIRE: '/minsky/canvas/deleteWire',
  CANVAS_GET_ITEM_AT_FOCUS: '/minsky/canvas/getItemAtFocus',
  CANVAS_GET_ITEM_AT: '/minsky/canvas/getItemAt',
  CANVAS_GET_WIRE_AT: '/minsky/canvas/getWireAt',
  CANVAS_ITEM: '/minsky/canvas/item',
  CANVAS_WIRE: '/minsky/canvas/wire',
  CANVAS_REQUEST_REDRAW: '/minsky/canvas/requestRedraw',
  CANVAS_ITEM_ID: '/minsky/canvas/item/id',
  CANVAS_ITEM_CLASS_TYPE: '/minsky/canvas/item/classType',
  CANVAS_SELECT_VAR: '/minsky/canvas/selectVar',
  CANVAS_PUSH_DEFINING_VARS_TO_TAB: '/minsky/canvas/pushDefiningVarsToTab',
  CANVAS_SHOW_DEFINING_VARS_ON_CANVAS:
    '/minsky/canvas/showDefiningVarsOnCanvas',
  CANVAS_SHOW_ALL_PLOTS_ON_TAB: '/minsky/canvas/showPlotsOnTab',
  CANVAS_LOCK_RAVELS_IN_SELECTION: '/minsky/canvas/lockRavelsInSelection',
  CANVAS_UNLOCK_RAVELS_IN_SELECTION: '/minsky/canvas/unlockRavelsInSelection',
  CANVAS_WIRE_STRAIGHTEN: '/minsky/canvas/wire/straighten',
  CANVAS_COPY_ITEM: '/minsky/canvas/copyItem',
  CANVAS_SELECT_ALL_VARIABLES: '/minsky/canvas/selectAllVariables',
  CANVAS_COPY_ALL_FLOW_VARS: '/minsky/canvas/copyAllFlowVars',
  CANVAS_COPY_ALL_STOCK_VARS: '/minsky/canvas/copyAllStockVars',
  CANVAS_ZOOM_TO_DISPLAY: '/minsky/canvas/zoomToDisplay',
  CANVAS_UNGROUP_ITEM: '/minsky/canvas/ungroupItem',
  CANVAS_WIRE_VISIBLE: '/minsky/canvas/wire/visible',
  CANVAS_ITEM_VALUE: '/minsky/canvas/item/value',
  CANVAS_ITEM_NAME: '/minsky/canvas/item/name',
  CANVAS_ITEM_DESCRIPTION: '/minsky/canvas/item/description',
  CANVAS_REMOVE_ITEM_FROM_ITS_GROUP: '/minsky/canvas/removeItemFromItsGroup',
  CANVAS_DEFAULT_ROTATION: '/minsky/canvas/defaultRotation',
  CANVAS_ITEM_FLIP: '/minsky/canvas/item/flip',
  CANVAS_RENAME_ALL_INSTANCES: '/minsky/canvas/renameAllInstances',
  CANVAS_EXPORT_AS_CSV: '/minsky/canvas/item/exportAsCSV',
  CANVAS_ITEM_RENDER_TO_SVG: '/minsky/canvas/item/renderToSVG',
  CANVAS_ITEM_RENDER_TO_PDF: '/minsky/canvas/item/renderToPDF',
  CANVAS_ITEM_RENDER_TO_EMF: '/minsky/canvas/item/renderToEMF',
  CANVAS_ITEM_RENDER_TO_PS: '/minsky/canvas/item/renderToPS',
  CANVAS_ITEM_DIMS: '/minsky/canvas/item/dims',
  CANVAS_ITEM_TOGGLE_LOCKED: '/minsky/canvas/item/toggleLocked',
  CANVAS_ITEM_NUM_CASES: '/minsky/canvas/item/numCases',
  CANVAS_ITEM_SET_NUM_CASES: '/minsky/canvas/item/setNumCases',
  CANVAS_ITEM_LOCK_GROUP: '/minsky/canvas/item/lockGroup',
  CANVAS_ITEM_LEAVE_LOCK_GROUP: '/minsky/canvas/item/leaveLockGroup',
  SAVE_SELECTION_AS_FILE: '/minsky/saveSelectionAsFile',
  CANVAS_FIND_VARIABLE_DEFINITION: '/minsky/canvas/findVariableDefinition',
  CANVAS_ITEM_INDICATOR: '/minsky/canvas/itemIndicator',
  CANVAS_ADD_INTEGRAL: '/minsky/addIntegral',
  CANVAS_ITEM_DEFINED: '/minsky/canvas/item/defined',
  CANVAS_ITEM_TYPE: '/minsky/canvas/item/type',
  CANVAS_ITEM_VAR_TAB_DISPLAY: '/minsky/canvas/item/varTabDisplay',
  CANVAS_ITEM_TOGGLE_VAR_TAB_DISPLAY: '/minsky/canvas/item/toggleVarTabDisplay',
  CANVAS_OPEN_GROUP_IN_CANVAS: '/minsky/openGroupInCanvas',
  CANVAS_OPEN_MODEL_IN_CANVAS: '/minsky/openModelInCanvas',
  CANVAS_ITEM_REMOVE_DISPLAY_PLOT: '/minsky/canvas/item/removeDisplayPlot',
  CANVAS_ITEM_FLIP_CONTENTS: '/minsky/canvas/item/flipContents',
  CANVAS_SAVE_GROUP_AS_FILE: '/minsky/saveGroupAsFile',
  CANVAS_TOGGLE_COUPLED: '/minsky/toggleCoupled',
  CANVAS_ITEM_READ_DATA: '/minsky/canvas/item/readData',
  CANVAS_ITEM_PORT_VALUES: '/minsky/canvas/item/portValues',
  CANVAS_WIRE_DETAILED_TEXT: '/minsky/canvas/wire/detailedText',
  CANVAS_WIRE_TOOLTIP: '/minsky/canvas/wire/tooltip',
  CANVAS_ITEM_TOGGLE_EDITOR_MODE: '/minsky/canvas/item/toggleEditorMode',
  CANVAS_ITEM_TOGGLE_BUTTONS: '/minsky/canvas/item/toggleButtons',
  CANVAS_ITEM_TOGGLE_VARIABLE_DISPLAY:
    '/minsky/canvas/item/toggleVariableDisplay',
  CANVAS_ITEM_MAKE_DISPLAY_PLOT: '/minsky/canvas/item/makeDisplayPlot',
  CANVAS_ITEM_TOGGLE_PLOT_TAB_DISPLAY:
    '/minsky/canvas/item/togglePlotTabDisplay',
  CANVAS_ITEM_TABLE_TITLE: '/minsky/canvas/item/table/title',
  CANVAS_ITEM_SET_CURRENCY: '/minsky/canvas/item/setCurrency',
  ECOLAB_VERSION: '/minsky/ecolabVersion',
  MINSKY_VERSION: '/minsky/minskyVersion',
  RAVEL_VERSION: '/minsky/ravelVersion',
  MATLAB: '/minsky/matlab',
  LATEX: '/minsky/latex',
  SIMULATION_SPEED: '/minsky/nSteps',
  AVAILABLE_OPERATIONS: '/minsky/availableOperations',
  CLASSIFY_OPERATION: '/minsky/classifyOp',
  AVAILABLE_OPERATIONS_MAPPING: 'availableOperationsMapping',
  LIST_FONTS: '/minsky/listFonts',
  STOP_REPLAY: 'stopReplay',
  CANVAS_ITEM_FLIPPED: '/minsky/canvas/item/flipped',
  DEFAULT_EXTENSION: '/minsky/model/defaultExtension',
  SAVE_CANVAS_ITEM_AS_FILE: '/minsky/saveCanvasItemAsFile',
  EXPORT_GODLEY_TO_LATEX: '/minsky/canvas/item/table/exportToLaTeX',
  EXPORT_GODLEY_TO_CSV: '/minsky/canvas/item/table/exportToCSV',
  CANVAS_PLOT_PALETTE: '/minsky/canvas/item/palette',
  SET_AUTO_SAVE_FILE: '/minsky/setAutoSaveFile',
  DIMENSIONS: '/minsky/dimensions',
  DEFAULT_FONT: '/minsky/defaultFont',
  MULTIPLE_EQUITIES: '/minsky/multipleEquities',
  SET_GODLEY_DISPLAY_VALUE: '/minsky/setGodleyDisplayValue',
  LIST_ALL_INSTANCES: '/minsky/listAllInstances',
  VARIABLE_INSTANCE_LIST_NAMES: '/minsky/variableInstanceList/names',
  VARIABLE_INSTANCE_LIST_GOTO_INSTANCE:
    '/minsky/variableInstanceList/gotoInstance',
  CANVAS_ITEM_RETYPE: '/minsky/canvas/item/retype',
  RENAME_ITEM: '/minsky/renameItem',
  CANVAS_ITEM_INIT: '/minsky/canvas/item/init',
  CANVAS_ITEM_TOOLTIP: '/minsky/canvas/item/tooltip',
  CANVAS_ITEM_DETAILED_TEXT: '/minsky/canvas/item/detailedText',
  CANVAS_ITEM_SLIDER_MAX: '/minsky/canvas/item/sliderMax',
  CANVAS_ITEM_SLIDER_MIN: '/minsky/canvas/item/sliderMin',
  CANVAS_ITEM_SLIDER_STEP: '/minsky/canvas/item/sliderStep',
  CANVAS_ITEM_SLIDER_STEP_REL: '/minsky/canvas/item/sliderStepRel',
  CANVAS_ITEM_ROTATION: '/minsky/canvas/item/rotation',
  CANVAS_ITEM_SET_UNITS: '/minsky/canvas/item/setUnits',
  ITEM_FOCUS_INIT: '/minsky/canvas/itemFocus/init',
  ITEM_FOCUS_TOOLTIP: '/minsky/canvas/itemFocus/tooltip',
  ITEM_FOCUS_DETAILED_TEXT: '/minsky/canvas/itemFocus/detailedText',
  ITEM_FOCUS_SLIDER_MAX: '/minsky/canvas/itemFocus/sliderMax',
  ITEM_FOCUS_SLIDER_MIN: '/minsky/canvas/itemFocus/sliderMin',
  ITEM_FOCUS_SLIDER_STEP: '/minsky/canvas/itemFocus/sliderStep',
  ITEM_FOCUS_SLIDER_STEP_REL: '/minsky/canvas/itemFocus/sliderStepRel',
  ITEM_FOCUS_ROTATION: '/minsky/canvas/itemFocus/rotation',
  ITEM_FOCUS_SET_UNITS: '/minsky/canvas/itemFocus/setUnits',
  CANVAS_ITEM_TITLE: '/minsky/canvas/item/title',
  CANVAS_ITEM_AXIS: '/minsky/canvas/item/axis',
  CANVAS_ITEM_ARG: '/minsky/canvas/item/arg',
  CANVAS_ITEM_EXPRESSION: '/minsky/canvas/item/expression',
  VARIABLE_VALUES_KEYS: '/minsky/variableValues/@keys',
  OPEN_LOG_FILE: '/minsky/openLogFile',
  LOG_VAR_LIST: '/minsky/logVarList',
  LOG_VAR_LIST_INSERT: '/minsky/logVarList/@insert',
  LOG_VAR_LIST_ERASE: '/minsky/logVarList/@erase',
  CANVAS_ITEM_INT_VAR_INIT: '/minsky/canvas/item/intVar/init',
  CANVAS_ITEM_INT_VAR_SET_UNITS: '/minsky/canvas/item/intVar/setUnits',
  CANVAS_ITEM_INT_VAR_UNITS_STR: '/minsky/canvas/item/intVar/unitsStr',
  CANVAS_ITEM_UNITS_STR: '/minsky/canvas/item/unitsStr',
  CANVAS_ITEM_INT_VAR_SLIDER_STEP_REL: '/minsky/canvas/item/intVar/sliderStepRel',
  ADD_ENTRY_TO_NAMED_ITEMS_MAP : '/minsky/nameCurrentItem',
  REMOVE_ENTRY_FROM_NAMED_ITEMS_MAP : '/minsky/namedItems/@erase', // TODO:: Check syntax, call when any item is deleted
  GET_NAMED_ITEM: '/minsky/namedItems/@elem'
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
  GAMMA: 'Gamma',
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
  SET_BACKGROUND_COLOR: 'set-background-color',
  CREATE_MENU_POPUP: 'create-menu-popup',
  MINSKY_PROCESS: 'minsky-process',
  MINSKY_PROCESS_FOR_IPC_MAIN: 'minsky-process-for-ipc-main',
  APP_LAYOUT_CHANGED: 'app-layout-changed',
  POPULATE_BOOKMARKS: 'populate-bookmarks',
  ADD_RECENT_FILE: 'add-recent-file',
  GET_APP_VERSION: 'get-app-version',
  MINSKY_PROCESS_REPLY: 'minsky-process-reply',
  KEY_PRESS: 'key-press',
  TOGGLE_MINSKY_SERVICE: 'toggle-minsky-service',
  NEW_SYSTEM: 'new-system',
  AUTO_START_MINSKY_SERVICE: 'auto-start-minsky-service',
  RECORDING_STATUS_CHANGED: 'recording-status-changed',
  GET_PREFERENCES: 'get-preferences',
  UPDATE_PREFERENCES: 'update-preferences',
  CONTEXT_MENU: 'context-menu',
  REPLAY_RECORDING: 'replay-recording',
  DISPLAY_MOUSE_COORDINATES: 'display-mouse-coordinates',
  DOUBLE_CLICK: 'double-click',
  LOG_SIMULATION: 'log-simulation',
};

// add non exposed commands here to get intellisense on the terminal popup
export const unExposedTerminalCommands = [
  '/minsky/model/cBounds',
  '/minsky/model/zoomFactor',
  '/minsky/model/relZoom',
  '/minsky/model/setZoom',
  '/minsky/canvas/itemFocus/initValue',
  '/minsky/canvas/itemFocus/tooltip',
  '/minsky/canvas/itemFocus/detailedText',
  '/minsky/canvas/itemFocus/sliderMax',
  '/minsky/canvas/itemFocus/sliderMin',
  '/minsky/canvas/itemFocus/sliderStep',
  '/minsky/canvas/itemFocus/sliderStepRel',
  '/minsky/canvas/itemFocus/rotation',
  '/minsky/canvas/itemFocus/setUnits',
];
