import { app, BrowserWindow, ipcMain } from "electron"
import { TrojandaBookApplication } from "./trojanda-book-application";


const trojanda_book_application = new TrojandaBookApplication();
global.trojandaBookApplicationInstance = trojanda_book_application;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    trojanda_book_application.init_app();

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) trojanda_book_application.recreate_window()
    })
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('open-book', () => {
    trojanda_book_application.open_epub_book();
    //event.reply('asynchronous-reply', 'pong')
})
