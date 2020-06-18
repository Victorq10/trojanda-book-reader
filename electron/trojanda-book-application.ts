import { BrowserWindow, Menu, MenuItem, Tray, OpenDialogReturnValue, dialog } from "electron"
import * as path from 'path'
import * as fs from 'fs'

import './constants'
import { APP_ASSETS_DIR, APP_HOME_DIR, APPLICATION_INDEX_FILE } from "./constants";
import { TrojandaBook } from './trojanda-book'
import { test_create_db, init_db } from "./db";


export class TrojandaBookApplication {
    current_book: TrojandaBook;
    private win: BrowserWindow;
    private tray: Tray;

    init_app() {
        this.create_application_menu();
        this.create_window();
        init_db();
    }

    recreate_window() {
        this.init_app()
    }

    private create_application_menu() {
        const existed_menu = Menu.getApplicationMenu();
        const open_ePub_book_menuItem = new MenuItem({
            label: 'Open ePub Book',
            accelerator: 'CmdOrCtrl+O',
            click: (item: any, focusedWindow: any) => { // TODO check types
                this.open_epub_book();
            }
        });
        if (existed_menu != null && existed_menu.items.length > 0 && existed_menu.items[0].submenu != null) {
            existed_menu.items[0].submenu.insert(0, open_ePub_book_menuItem);
        }
    }

    private create_window() {
        let app_icon = path.join(APP_ASSETS_DIR, 'trojanda-book-reader.png')

        // Create a new tray
        this.tray = new Tray(app_icon)
        this.tray.on('right-click', this.toggle_window)
        this.tray.on('double-click', this.toggle_window)
        this.tray.on('click', () => {
            this.toggle_window()
        })

        console.log("__dirname: " + __dirname)
        const window_options: any = {
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
            window_options.icon = app_icon
        }

        // Create the browser window.
        this.win = new BrowserWindow(window_options);
        this.win.title = 'Trojanda Book Reader'
        // and load the index.html of the app.
        this.win.loadFile(path.join(APP_ASSETS_DIR, 'index.html'))

        this.win.webContents.on('did-finish-load', () => {
            this.win.webContents.send('ping', 'whoooooooh!')
            //this.win.maximize();
        })
        // Open the DevTools.
        //this.win.webContents.openDevTools()

        this.win.once('ready-to-show', () => {
            const position = this.get_window_position();
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

    open_epub_book() {
        console.log(`isFullScreen: ${this.win.isFullScreen()}`)
        this.win.setFullScreen(!this.win.isFullScreen());
        return;
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
            this.read_book(filepath);
            break;
        }
    }

    private read_book(filepath: string) {
        console.log("Opening “" + filepath + "” book ...");
        this.current_book = new TrojandaBook(filepath, (book) => {
            this.win.webContents.send('display-book', book);
        });
    }

    open_previous_book() {
        this.current_book = TrojandaBook.open_current_book((book) => {
            this.win.webContents.send('display-book', book);
        })
    }

    private get_window_position() {
        const window_bounds = this.win.getBounds()
        const tray_bounds = this.tray.getBounds()

        // Center window horizontally below the tray icon
        const x = Math.round(tray_bounds.x + (tray_bounds.width / 2) - (window_bounds.width / 2))

        // Position window 4 pixels vertically below the tray icon
        const y = Math.round(tray_bounds.y + tray_bounds.height + 4)

        return { x: x, y: y }
    }

    // toggle window
    private toggle_window() {
        if (this.win.isVisible()) {
            this.win.hide()
        } else {
            this.show_window()
        }
    }

    private show_window() {
        const position = this.get_window_position()
        this.win.setPosition(position.x, position.y, false)
        this.win.show()
        //this.win.maximize();
        this.win.focus()
    }

}

//globalThis.trojandaBookApplicationTest = new TrojandaBookApplication();

//export const trojandaBookApplicationTest3 = new TrojandaBookApplication();

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
