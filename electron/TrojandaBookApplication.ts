import { BrowserWindow, Menu, MenuItem, Tray, OpenDialogReturnValue, dialog } from "electron"
import * as path from 'path'
import * as fs from 'fs'

import './Constants'
import { APP_ASSETS_DIR, APP_HOME_DIR, APPLICATION_INDEX_FILE } from "./Constants";
import { TrojandaBook } from './TrojandaBook'
import { testCreateDb, initDb } from "./db";


export class TrojandaBookApplication {
    currentBook: TrojandaBook;
    private win: BrowserWindow;
    private tray: Tray;

    initApp() {
        this.createApplicationMenu();
        this.createWindow();
        initDb();
    }

    recreateWindow() {
        this.createWindow();
    }

    private createApplicationMenu() {
        const existedMenu = Menu.getApplicationMenu();
        const open_ePub_book_menuItem = new MenuItem({
            label: 'Open ePub Book',
            accelerator: 'CmdOrCtrl+O',
            click: (item: any, focusedWindow: any) => { // TODO check types
                this.open_ePub_book();
            }
        });
        if (existedMenu != null && existedMenu.items.length > 0 && existedMenu.items[0].submenu != null) {
            existedMenu.items[0].submenu.insert(0, open_ePub_book_menuItem);
        }
    }

    private createWindow() {
        let appIcon = path.join(APP_ASSETS_DIR, 'trojanda-book-reader.png')

        // Create a new tray
        this.tray = new Tray(appIcon)
        this.tray.on('right-click', this.toggleWindow)
        this.tray.on('double-click', this.toggleWindow)
        this.tray.on('click', () => {
            this.toggleWindow()
        })

        console.log("__dirname: " + __dirname)
        const windowOptions: any = {
            width: 800,
            height: 600,
            backgroundColor: '#000',
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, 'preload.js'),
                defaultFontFamily: 'sansSerif',
                defaultFontSize: '28px',
                defaultMonospaceFontSize: '28px',
                minimumFontSize: '16px'
            }
        };

        if (process.platform === 'linux') {
            windowOptions.icon = appIcon
        }

        // Create the browser window.
        this.win = new BrowserWindow(windowOptions);
        this.win.title = 'Trojanda Reader'
        // and load the index.html of the app.
        this.win.loadFile(path.join(APP_ASSETS_DIR, 'index.html'))

        this.win.webContents.on('did-finish-load', () => {
            this.win.webContents.send('ping', 'whoooooooh!')
            //this.win.maximize();
        })
        // Open the DevTools.
        //win.webContents.openDevTools()

        this.win.once('ready-to-show', () => {
            const position = this.getWindowPosition();
            this.win.setPosition(position.x, position.y, false);
            this.win.show();
            this.win.focus();
            //async () => this.win.maximize();
        })

        this.win.on('enter-full-screen', () => {
            // TODO: hide buttons “Open ePub Book” etc. Header and fotter
        });
        this.win.on('leave-full-screen', () => {
            // TODO: show buttons “Open ePub Book” etc. Header and fotter
        });

        /* 
        // Hide the window when it loses focus
        win.on('blur', () => {
            this.win.hide()
        })
        */
    }

    open_ePub_book() {
        let book_dir = __dirname + '/../books';
        if (fs.existsSync(book_dir) && !fs.statSync(book_dir).isDirectory()) {
            book_dir = __dirname;
        }
        dialog.showOpenDialog(this.win,
            {
                title: "Select ePub book",
                defaultPath: book_dir,
                properties: ['openFile'],
                filters: [
                    { name: 'ePub Book file (.epub) ', extensions: ['epub'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
                //}).then(this.after_file_selected.bind(this));
            }).then((event) => this.after_file_selected(event));
    }

    private after_file_selected(event: OpenDialogReturnValue) {
        // fileNames is an array that contains all the selected
        if (event.canceled || event.filePaths.length === 0) {
            console.log("No file selected");
            return;
        }

        for (const filepath of event.filePaths) {
            // Change how to handle the file content
            console.log("Opening “" + filepath + "” book ...");
            this.currentBook = new TrojandaBook(filepath, (book) => {
                this.win.loadFile(APPLICATION_INDEX_FILE).then(() => {
                    this.win.webContents.send('display-book', book);
                });

            });
            break;
        }
    }


    private getWindowPosition() {
        const windowBounds = this.win.getBounds()
        const trayBounds = this.tray.getBounds()

        // Center window horizontally below the tray icon
        const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

        // Position window 4 pixels vertically below the tray icon
        const y = Math.round(trayBounds.y + trayBounds.height + 4)

        return { x: x, y: y }
    }

    // toggle window
    private toggleWindow() {
        if (this.win.isVisible()) {
            this.win.hide()
        } else {
            this.showWindow()
        }
    }

    private showWindow() {
        const position = this.getWindowPosition()
        this.win.setPosition(position.x, position.y, false)
        this.win.show()
        //this.win.maximize();
        this.win.focus()
    }

}

//globalThis.trojandaBookApplicationTest = new TrojandaBookApplication();

export const trojandaBookApplicationTest3 = new TrojandaBookApplication();

//export const trojandaBookApplication = new TrojandaBookApplication();

/* const global = require('./global');

// create a unique, global symbol name
// -----------------------------------
const TROJANDA_BOOK_APPLICATION_KEY = Symbol.for("TrojandaBookApplicationKey");

// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------
const globalSymbols = Object.getOwnPropertySymbols(global);
const hasFoo = (globalSymbols.indexOf(TROJANDA_BOOK_APPLICATION_KEY) > -1);
if (!hasFoo){
  global[TROJANDA_BOOK_APPLICATION_KEY] = new TrojandaBookApplication();
}

// define the singleton API
// ------------------------
export const trojandaBookApplicationApi = {
//    instance :TrojandaBookApplication = global[TROJANDA_BOOK_APPLICATION_KEY]
    instance() : TrojandaBookApplication {
        return global[TROJANDA_BOOK_APPLICATION_KEY];
    }
};
// ensure the API is never changed
// -------------------------------
Object.freeze(trojandaBookApplicationApi);

// export the singleton API only
// -----------------------------
//module.exports = trojandaBookApplicationApi;
 */
