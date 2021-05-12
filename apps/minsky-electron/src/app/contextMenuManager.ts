/* eslint-disable no-case-declarations */
import { ClassType, isEmptyObject } from '@minsky/shared';
import { Menu, MenuItem } from 'electron';
import { CommandsManager } from './commandsManager';
import { WindowManager } from './windowManager';

/*
bind .wiring.canvas <<contextMenu>> {
    if {[getWireAt %x %y] && [minsky.canvas.wire.visible]} {    # prevents wire context menu from being accessed when group contents are not transparent. for ticket 1225.
		wireContextMenu %X %Y
    } elseif [getItemAt %x %y] {
        switch [minsky.canvas.item.classType] {
            GodleyIcon {rightMouseGodley %x %y %X %Y}
            Group {rightMouseGroup %x %y %X %Y}
            default {contextMenu %x %y %X %Y}
		}
    } else {
        canvasContext %x %y %X %Y
    }
}

*/
export class ContextMenuManager {
  public static initContextMenu() {
    const mainWindow = WindowManager.getMainWindow();

    mainWindow.webContents.on('context-menu', async (event, params) => {
      const { x, y } = params;

      const cairoTopOffset = y - WindowManager.topOffset;

      const wire = await CommandsManager.getWireAt(x, cairoTopOffset);

      const isWirePresent = !isEmptyObject(wire);

      if (isWirePresent /* TODO: && isWireVisible */) {
        ContextMenuManager.buildAndDisplayContextMenu(
          ContextMenuManager.wireContextMenu(),
          mainWindow,
          x,
          y
        );
        return;
      }

      const classTypeRes = (
        await CommandsManager.getItemClassType(x, cairoTopOffset)
      ).slice(1, -1);

      const classType = classTypeRes.includes(':')
        ? classTypeRes.split(':')[0]
        : classTypeRes;

      console.log(
        '🚀 ~ file: contextMenuManager.ts ~ line 168 ~ ContextMenuManager ~ mainWindow.webContents.on ~ classType',
        classType
      );

      if (classType) {
        switch (classType) {
          case ClassType.GodleyIcon:
            ContextMenuManager.buildAndDisplayContextMenu(
              await ContextMenuManager.rightMouseGodley(x, cairoTopOffset),
              mainWindow,
              x,
              y
            );
            break;

          // case ClassType.Group:
          //   ContextMenuManager.buildAndDisplayContextMenu(
          //     ContextMenuManager.rightMouseGroup(),
          //     mainWindow,
          //     x,
          //     y
          //   );
          //   break;

          default:
            ContextMenuManager.buildAndDisplayContextMenu(
              ContextMenuManager.contextMenu(classType),
              mainWindow,
              x,
              y
            );

            break;
        }

        return;
      }

      ContextMenuManager.buildAndDisplayContextMenu(
        ContextMenuManager.canvasContext(),
        mainWindow,
        x,
        y
      );

      return;
    });
  }

  private static async rightMouseGodley(
    x: number,
    y: number
  ): Promise<MenuItem[]> {
    /*
    proc rightMouseGodley {x y X Y} {
    if [selectVar $x $y] {
        .wiring.context delete 0 end
        .wiring.context add command -label "Copy" -command canvas.copyItem
        .wiring.context add command -label "Rename all instances" -command renameVariableInstances
        .wiring.context post $X $Y
    } else {
        contextMenu $x $y $X $Y
    }
}
    */

    if (await CommandsManager.selectVar(x, y)) {
      const menuItems: MenuItem[] = [
        new MenuItem({ label: 'Copy' }),
        new MenuItem({ label: 'Rename all instances' }),
      ];

      return menuItems;
    } else {
      return ContextMenuManager.contextMenu(ClassType.GodleyIcon);
    }
  }

  // private static rightMouseGroup(): MenuItem[] {
  //   return [];
  // }

  private static wireContextMenu(): MenuItem[] {
    /*
    proc wireContextMenu {x y} {
    .wiring.context delete 0 end
    .wiring.context add command -label Help -command {help Wires}
    .wiring.context add command -label Description -command "postNote wire"
    .wiring.context add command -label "Straighten" -command "minsky.canvas.wire.straighten"
#    .wiring.context add command -label "Raise" -command "raiseItem wire$id"
#    .wiring.context add command -label "Lower" -command "lowerItem wire$id"
    .wiring.context add command -label "Browse object" -command "obj_browser minsky.canvas.wire.*"
    .wiring.context add command -label "Delete wire" -command "canvas.deleteWire"
    tk_popup .wiring.context $x $y
}
    */

    const menuItems = [
      new MenuItem({ label: 'Help' }),
      new MenuItem({ label: 'Description' }),
      new MenuItem({ label: 'Straighten' }),
      new MenuItem({ label: 'Raise' }),
      new MenuItem({ label: 'Lower' }),
      new MenuItem({ label: 'Browse object' }),
      new MenuItem({ label: 'Delete wire' }),
    ];

    return menuItems;
  }

  private static canvasContext(): MenuItem[] {
    /*
    proc canvasContext {x y X Y} {
    .wiring.context delete 0 end
    .wiring.context add command -label Help -command {help DesignCanvas}
    .wiring.context add command -label "Cut" -command cut
    .wiring.context add command -label "Copy selection" -command "minsky.copy"
    .wiring.context add command -label "Save selection as" -command saveSelection
    .wiring.context add command -label "Paste selection" -command pasteAt
    if {[getClipboard]==""} {
        .wiring.context entryconfigure end -state disabled
    }
    .wiring.context add command -label "Hide defining groups of selected variables" -command "minsky.canvas.pushDefiningVarsToTab"
    .wiring.context add command -label "Show all defining groups on canvas" -command "minsky.canvas.showDefiningVarsOnCanvas"
    .wiring.context add command -label "Show all plots on tab" -command "minsky.canvas.showPlotsOnTab"
    .wiring.context add command -label "Bookmark here" -command "bookmarkAt $x $y $X $Y"
    .wiring.context add command -label "Group" -command "minsky.createGroup"
    .wiring.context add command -label "Lock selected Ravels" -command "minsky.canvas.lockRavelsInSelection"
    .wiring.context add command -label "Unlock selected Ravels" -command "minsky.canvas.unlockRavelsInSelection"
    .wiring.context add command -label "Open master group" -command "openModelInCanvas"
    tk_popup .wiring.context $X $Y
}
    */

    const menuItems = [
      new MenuItem({ label: 'Help' }),
      new MenuItem({ label: 'Cut' }),
      new MenuItem({ label: 'Copy selection' }),
      new MenuItem({ label: 'Save selection as' }),
      new MenuItem({ label: 'Paste selection' }),
      new MenuItem({ label: 'Hide defining groups' }),
      new MenuItem({ label: 'Show all defining' }),
      new MenuItem({ label: 'Show all plots' }),
      new MenuItem({ label: 'Bookmark here' }),
      new MenuItem({ label: 'Group' }),
      new MenuItem({ label: 'Lock selected Ravels' }),
      new MenuItem({ label: 'Unlock selected Ravels' }),
      new MenuItem({ label: 'Open master group' }),
    ];

    return menuItems;
  }

  private static buildAndDisplayContextMenu(
    menuItems: MenuItem[],
    mainWindow: Electron.BrowserWindow,
    x: number,
    y: number
  ) {
    if (menuItems.length) {
      const menu = Menu.buildFromTemplate(menuItems);

      menu.popup({ window: mainWindow, x, y });
    }
  }

  private static contextMenu(classType: string) {
    /*
#
# context menu
proc contextMenu {x y X Y} {
    set item minsky.canvas.item
    .wiring.context delete 0 end
    .wiring.context add command -label Help -command "help [$item.classType]"
    .wiring.context add command -label Description -command "postNote item"
    # find out what type of item we're referring to
    switch -regex [$item.classType] {
        "Variable*|VarConstant" {
            catch {
                if {[llength [minsky.canvas.item.dims]]==0} {
                    .wiring.context add command -label "Value [minsky.canvas.item.value]"
                } else {
                    .wiring.context add command -label "Dims [minsky.canvas.item.dims]"
                }
            }
            .wiring.context add command -label "Find definition" -command "findDefinition"
            .wiring.context add command -label "Select all instances" -command {
                canvas.selectAllVariables
            }
            .wiring.context add command -label "Find all instances" -command {
                findAllInstances
            }
            .wiring.context add command -label "Rename all instances" -command {
                renameVariableInstances
            }
            .wiring.context add command -label "Edit" -command "editItem"
            .wiring.context add command -label "Copy item" -command "canvas.copyItem"
            if {![inputWired [$item.valueId]]} {
                .wiring.context add command -label "Add integral" -command "addIntegral"
            }
            if {[$item.defined]} {
                 global varTabDisplay
                 set varTabDisplay [$item.varTabDisplay]
                .wiring.context add checkbutton -label "Display variable on tab" -command "$item.toggleVarTabDisplay" -variable varTabDisplay
            }
            .wiring.context add command -label "Flip" -command "$item.flip; flip_default"
            if {[$item.type]=="parameter"} {
                .wiring.context add command -label "Import CSV" -command {CSVImportDialog}
                .wiring.context add command -label "Display CSV values on tab" -command {setupPickDimMenu}
            }
            .wiring.context add command -label "Export as CSV" -command exportItemAsCSV
        }
        "Operation*|IntOp|DataOp" {
            set portValues "unknown"
            catch {set portValues [$item.portValues]}
            .wiring.context add command -label "Port values $portValues"
            .wiring.context add command -label "Edit" -command "editItem"
            if {[$item.type]=="data"} {
               .wiring.context add command -label "Import Data" \
                    -command "importData"
               .wiring.context add command -label "Initialise Random" \
                    -command "initRandom"
            }
            .wiring.context add command -label "Copy item" -command "canvas.copyItem"
            .wiring.context add command -label "Flip" -command "$item.flip; flip_default"
            if {[$item.type]=="integrate"} {
               .wiring.context add command -label "Toggle var binding" -command "minsky.canvas.item.toggleCoupled; canvas.requestRedraw"
            .wiring.context add command -label "Select all instances" -command {
                canvas.selectAllVariables
            }
            .wiring.context add command -label "Rename all instances" -command {
				renameIntegralInstances
			}
            }
        }
        "PlotWidget" {
            .wiring.context add command -label "Expand" -command "plotDoubleClick [TCLItem]"
            .wiring.context add command -label "Make Group Plot" -command "$item.makeDisplayPlot"
            .wiring.context add command -label "Options" -command "doPlotOptions $item"
            .wiring.context add command -label "Pen Styles" -command "penStyles $item"
             global plotTabDisplay
             set plotTabDisplay [$item.plotTabDisplay]
            .wiring.context add checkbutton -label "Display plot on tab" -command "$item.togglePlotTabDisplay" -variable plotTabDisplay
            .wiring.context add command -label "Export as CSV" -command exportItemAsCSV
            .wiring.context add command -label "Export as Image" -command exportItemAsImg
        }
        "GodleyIcon" {
            .wiring.context add command -label "Open Godley Table" -command "openGodley [minsky.openGodley]"
            .wiring.context add command -label "Title" -command {
                textEntryPopup .editGodleyTitle [minsky.canvas.item.table.title] {minsky.canvas.item.table.title [.editGodleyTitle.entry get]; canvas.requestRedraw}
            }
            .wiring.context add command -label "Set currency" -command {
                textEntryPopup .godleyCurrency {} {minsky.canvas.item.setCurrency [.godleyCurrency.entry get]}
            }
            global editorMode buttonDisplay variableDisplay
            set editorMode [$item.editorMode]
            set buttonDisplay [$item.buttonDisplay]
            set variableDisplay [$item.variableDisplay]
            .wiring.context add checkbutton -label "Editor mode" -command "$item.toggleEditorMode" -variable editorMode
            .wiring.context add checkbutton -label "Row/Col buttons" -command "$item.toggleButtons" -variable buttonDisplay
            .wiring.context add checkbutton -label "Display variables" -command "$item.toggleVariableDisplay" -variable variableDisplay
            .wiring.context add command -label "Copy flow variables" -command "canvas.copyAllFlowVars"
            .wiring.context add command -label "Copy stock variables" -command "canvas.copyAllStockVars"
            .wiring.context add command -label "Export to file" -command "godley::export"
        }
        "Group" {
            .wiring.context add command -label "Edit" -command "groupEdit"
            .wiring.context add command -label "Open in canvas" -command "openGroupInCanvas"
            .wiring.context add command -label "Zoom to display" -command "canvas.zoomToDisplay"
            .wiring.context add command -label "Remove plot icon" -command "$item.removeDisplayPlot"
            .wiring.context add command -label "Copy" -command "canvas.copyItem"
            .wiring.context add command -label "Save group as" -command "group::save"
            .wiring.context add command -label "Flip" -command "$item.flip; flip_default"
            .wiring.context add command -label "Flip Contents" -command "$item.flipContents; canvas.requestRedraw"
            .wiring.context add command -label "Ungroup" -command "canvas.ungroupItem; canvas.requestRedraw"
        }
        "Item" {
            .wiring.context delete 0 end
            .wiring.context add command -label "Copy item" -command "canvas.copyItem"
        }
        SwitchIcon {
            .wiring.context add command -label "Add case" -command "incrCase 1"
            .wiring.context add command -label "Delete case" -command "incrCase -1"
            .wiring.context add command -label "Flip" -command "$item.flipped [expr ![minsky.canvas.item.flipped]]; canvas.requestRedraw"
        }
        Ravel {
            .wiring.context add command -label "Export as CSV" -command exportItemAsCSV
            global sortOrder
            if {[minsky.canvas.item.handleSortableByValue] && [minsky.canvas.item.sortByValue]!="none"} {
                set sortOrder [minsky.canvas.item.sortByValue]
            } else {
                set sortOrder [minsky.canvas.item.sortOrder]
            }
            .wiring.context add cascade -label "Axis properties" -menu .wiring.context.axisMenu
            if [llength [info commands minsky.canvas.item.lockGroup]] {
                .wiring.context add command -label "Lock specific handles" -command lockSpecificHandles
                .wiring.context add command -label "Unlock" -command {
                    minsky.canvas.item.leaveLockGroup; canvas.requestRedraw
                }
            }
        }
        Lock {
            if [$item.locked] {
                .wiring.context add command -label "Unlock" -command $item.toggleLocked
            } else {
                .wiring.context add command -label "Lock" -command $item.toggleLocked
            }
        }
    }

    # common trailer
#            .wiring.context add command -label "Raise" -command "raiseItem $tag"
#            .wiring.context add command -label "Lower" -command "lowerItem $tag"
    .wiring.context add command -label "Browse object" -command "obj_browser minsky.canvas.item.*"
    .wiring.context add command -label "Delete [minsky.canvas.item.classType]" -command "canvas.deleteItem"
    tk_popup .wiring.context $X $Y
}
*/

    let menuItems: MenuItem[] = [
      new MenuItem({ label: 'Help' }),
      new MenuItem({ label: 'Description' }),
    ];

    switch (classType) {
      case ClassType.Variable:
      case ClassType.VarConstant:
        menuItems = [
          ...menuItems,
          new MenuItem({ label: 'Variable*|VarConstant' }),
        ];
        break;

      case ClassType.Operation:
      case ClassType.IntOp:
      case ClassType.DataOp:
        menuItems = [
          ...menuItems,
          new MenuItem({ label: 'Operation*|IntOp|DataOp' }),
        ];
        break;

      case ClassType.PlotWidget:
        menuItems = [...menuItems, new MenuItem({ label: 'PlotWidget' })];
        break;

      case ClassType.GodleyIcon:
        const godleyMenuItems = [
          new MenuItem({
            label: 'Open Godley Table',
            click: () => console.log('Open Godley Table'),
          }),
          new MenuItem({
            label: 'Title',
            click: () => console.log('Title'),
          }),
          new MenuItem({
            label: 'Set currency',
            click: () => console.log('Set currency'),
          }),
          new MenuItem({
            label: 'Editor mode',
            click: () => console.log('Editor mode'),
          }),
          new MenuItem({
            label: 'Row/Col buttons',
            click: () => console.log('Row/Col buttons'),
          }),
          new MenuItem({
            label: 'Display variables',
            click: () => console.log('Display variables'),
          }),
          new MenuItem({
            label: 'Copy flow variables',
            click: () => console.log('Copy flow variables'),
          }),
          new MenuItem({
            label: 'Copy stock variables',
            click: () => console.log('Copy stock variables'),
          }),
          new MenuItem({
            label: 'Export to file',
            click: () => console.log('Export to file'),
          }),
        ];

        menuItems = [...menuItems, ...godleyMenuItems];

        break;

      case ClassType.Group:
        menuItems = [...menuItems, new MenuItem({ label: 'Group' })];
        break;

      case ClassType.Item:
        menuItems = [...menuItems, new MenuItem({ label: 'Item' })];

        break;

      case ClassType.SwitchIcon:
        menuItems = [...menuItems, new MenuItem({ label: 'SwitchIcon' })];

        break;

      case ClassType.Ravel:
        menuItems = [...menuItems, new MenuItem({ label: 'Ravel' })];

        break;

      case ClassType.Lock:
        menuItems = [...menuItems, new MenuItem({ label: 'Lock' })];

        break;

      default:
        break;
    }

    menuItems = [
      ...menuItems,
      new MenuItem({ label: 'Browse Object' }),
      new MenuItem({ label: `Delete ${classType}` }),
    ];

    return menuItems;
  }
}
