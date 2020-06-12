import * as path from 'path';
import * as fs from 'fs';

export const APP_HOME_DIR = path.resolve(__dirname, '..');
export const APP_ASSETS_DIR = APP_HOME_DIR + '/assets'
export const APP_DATA_DIR = APP_HOME_DIR + '/data'
export const CURRENT_BOOK_PATH = path.resolve(APP_DATA_DIR, 'currentBook');
export const APPLICATION_INDEX_FILE = path.join(APP_ASSETS_DIR, 'index.html');
export const APP_DB_FILEPATH = APP_DATA_DIR + '/books.db';

if (!fs.existsSync(CURRENT_BOOK_PATH)) {
    fs.mkdirSync(CURRENT_BOOK_PATH, {recursive: true});
}
