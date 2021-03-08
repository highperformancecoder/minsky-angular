export const ZOOM_IN_FACTOR = 1.5;
export const ZOOM_OUT_FACTOR = 0.66;
export const RESET_ZOOM_FACTOR = 0;
export const ZOOM_TO_FIT_FACTOR = 1;

export const newLineCharacter = '\n';

export const commandsMapping = {
  ADD_GODLEY: '/minsky/canvas/addGodley',
  ADD_GROUP: '/minsky/canvas/addGroup',
  ADD_PLOT: '/minsky/canvas/addPlot',
  LIST: '/list',
  mousedown: '/minsky/canvas/mouseDown',
  mousemove: `/minsky/canvas/mouseMove`,
  mouseup: '/minsky/canvas/mouseUp',
  PLAY: '/list',
  RECORD: '/list',
  RECORDING_REPLAY: '/list',
  RENDER_FRAME: '/minsky/canvas/renderFrame',
  RESET_ZOOM: `/minsky/canvas/model/zoom`,
  RESET: '/list',
  REVERSE_CHECKBOX: '/list',
  SET_GODLEY_ICON_RESOURCE: '/minsky/setGodleyIconResource',
  SET_GROUP_ICON_RESOURCE: '/minsky/setGroupIconResource',
  SIMULATION_SPEED: '/list',
  STEP: '/list',
  ZOOM_IN: `/minsky/canvas/model/zoom`,
  ZOOM_OUT: `/minsky/canvas/model/zoom`,
};
