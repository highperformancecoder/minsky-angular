export const template = [
    {
      label: 'Menu',
      submenu: [
        {
          label: 'About Minsky',
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
              label: 'test'
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
        }
      ]
    },
    {
       label: 'Edit',
       submenu: [
          {
             role: 'undo'
          },
          {
             role: 'redo'
          },
          {
             type: 'separator'
          },
          {
             role: 'cut'
          },
          {
             role: 'copy'
          },
          {
             role: 'paste'
          }
       ]
    },
    
    {
       label: 'View',
       submenu: [
          {
             role: 'reload'
          },
          {
             role: 'toggledevtools'
          },
          {
             type: 'separator'
          },
          {
             role: 'resetzoom'
          },
          {
             role: 'zoomin'
          },
          {
             role: 'zoomout'
          },
          {
             type: 'separator'
          },
          {
             role: 'togglefullscreen'
          }
       ]
    },
    
    {
       role: 'window',
       submenu: [
          {
             role: 'minimize'
          },
          {
             role: 'close'
          }
       ]
    },
    
    {
       role: 'help',
       submenu: [
          {
             label: 'Learn More'
          }
       ]
    }
  ]