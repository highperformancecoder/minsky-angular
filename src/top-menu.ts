import { Menu, BrowserWindow } from 'electron';

export const template = Menu.buildFromTemplate([
  {
    label: 'File',
    submenu: [
      {
        label: 'About Minsky'
      },
      {
        label: 'Upgrade'
      },
      {
        label: 'New System'
      },
      {
        label: 'Open'
      },
      {
        label: 'Recent Files',
        submenu: [
          {
            label: 'TestFile'
          }
        ]
      },
      {
        label: 'Library'
      },
      {
        label: 'Save'
      },
      {
        label: 'SaveAs'
      },
      {
        label: 'Insert File as Group'
      },
      {
        label: 'Dimensional Analysis'
      },
      {
        label: 'Export Canvas'
      },
      {
        label: 'Export Plots',
        submenu: [
          {
            label: 'as SVG'
          },
          {
             label: 'as CSV'
          }
        ]
      },
      {
        label: 'Log simulation'
      },
      {
        label: 'Recording'
      },
      {
        label: 'Replay recording'
      },
      {
        label: 'Quit'
      },
      {
        type: 'separator'
      },
      {
        label: 'Debugging Use'
      },
      {
       label: 'Redraw'
      },
      {
       label: 'Object Browser'
      },
      {
       label: 'Select items'
      },
      {
       label: 'Command'
      }
    ]
  },
  {
     label: 'Edit',
     submenu: [
        {
          label: 'Undo',
          role: 'undo'
        },
        {
          label: 'Redo',
          role: 'redo'
        },
        {
          label: 'Cut',
          role: 'cut'
        },
        {
          label: 'Copy',
          role: 'copy'
        },
        {
          label: 'Paste',
          role: 'paste'
        },
        {
          label: 'Group selection'
        },
        {
          label: 'Dimensions'
        }
     ]
  },
  {
    label: 'Bookmarks',
    submenu: [
      {
        label: 'Bookmark this position'
      },
      {
        label: 'Delete...',
        submenu: [
        ]
      },
      {
        type: 'separator'
      }
    ]
  },
  {
    label: 'Insert',
    submenu: [
      {
        label: 'Godley Table'
      },
      {
        label: 'Variable',
        submenu: [
          {
            type: 'separator'
          },
          {
            label: 'variable',
            click () {
              const { BrowserWindow } = require('electron')
              const win = new BrowserWindow({ width: 300, height: 600 })
    
              // Load a remote URL
              win.loadURL(`file://${__dirname}/static_popups/create_variable.html`)
    
            }
          },
          {
            label: 'constant'
          },
          {
            label: 'parameter'
          }
        ]
      },
      {
        label: 'Binary Ops',
        submenu: [
          {
            label: 'add'
          },
          {
            label: 'subtract'
          },
          {
            label: 'multiple'
          },
          {
            label: 'divide'
          },
          {
            label: 'min'
          },
          {
            label: 'max'
          },
          {
            label: 'and'
          },
          {
            label: 'or'
          },
          {
            label: 'log'
          },
          {
            label: 'pow'
          },
          {
            label: 'lt'
          },
          {
            label: 'le'
          },
          {
            label: 'eq'
          }
        ]
      },
      {
        label: 'Functions',
        submenu: [
          {
            label: 'copy'
          },
          {
            label: 'sqrt'
          },
          {
            label: 'exp'
          },
          {
            label: 'ln'
          },
          {
            label: 'sin'
          },
          {
            label: 'cos'
          },
          {
            label: 'tan'
          },
          {
            label: 'asin'
          },
          {
            label: 'acos'
          },
          {
            label: 'atan'
          },
          {
            label: 'sinh'
          },
          {
            label: 'cosh'
          },
          {
            label: 'tanh'
          },
          {
            label: 'abs'
          },
          {
            label: 'floor'
          },
          {
            label: 'frac'
          },
          {
            label: 'not'
          }
        ]
      }, 
      {
        label: 'Reductions',
        submenu: [
          {
            label: 'sum'
          },
          {
            label: 'product'
          },
          {
            label: 'infimum'
          },
          {
            label: 'supremum'
          },
          {
            label: 'any'
          },
          {
            label: 'all'
          },
          {
            label: 'infIndex'
          },
          {
            label: 'supIndex'
          }
        ]
      }, 
      {
        label: 'Scans',
        submenu: [
          {
            label: 'runningSum'
          },
          {
            label: 'runningProduct'
          },
          {
            label: 'difference'
          }
        ]
      },
      {
        label: 'Tensor operations',
        submenu: [
          {
            label: 'innerProduct'
          },
          {
            label: 'outerProduct'
          },
          {
            label: 'index'
          },
          {
            label: 'gather'
          }
        ]
      },
      {
        label: 'time'
      },
      {
        label: 'integrate'
      },
      {
        label: 'differentiate'
      },
      {
        label: 'data'
      },
      {
        label: 'ravel'
      },
      {
        label: 'plot'
      }
    ]
  },
  {
    label: 'Options',
    submenu: [
      {
        label: 'Preferences'
      },
      {
        label: 'Background Color'
      }
    ]
  },
  {
    label: 'Runge Kutta',
    submenu: [
      {
        label: 'Runge Kutta'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Minsky Documentation'
      }
    ]
  }
]);





