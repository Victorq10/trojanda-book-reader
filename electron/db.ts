const Database = require('better-sqlite3');
import * as fs from 'fs';

import { APP_DB_FILEPATH, APP_DATA_DIR } from './Constants';


export function initDb() {
    testCreateDb();
    if (fs.existsSync(APP_DB_FILEPATH)) {
        return;
    }
    const db = new Database(APP_DB_FILEPATH);
    
    db.exec(`CREATE TABLE Authors ( author_id INTEGER PRIMARY KEY, 
            name TEXT NOT NULL, 
            sort_key TEXT NOT NULL, 
            CONSTRAINT Authors_Unique UNIQUE (name, sort_key) )`);
    db.exec(`CREATE TABLE Series ( series_id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL )`);
    db.exec(`CREATE TABLE Tags ( tag_id INTEGER PRIMARY KEY, 
            name TEXT NOT NULL, 
            parent_id INTEGER REFERENCES Tags (tag_id), 
            CONSTRAINT Tags_Unique UNIQUE (parent_id, name) )`);
    db.exec(`CREATE TABLE Files ( file_id INTEGER PRIMARY KEY, 
            name TEXT NOT NULL, 
            parent_id INTEGER REFERENCES Files (file_id), 
            size INTEGER, 
            CONSTRAINT Files_Unique UNIQUE (name, parent_id) )`);
    db.exec(`CREATE TABLE Books ( book_id INTEGER PRIMARY KEY, 
            encoding TEXT, 
            language TEXT, 
            title TEXT NOT NULL, 
            file_id INTEGER UNIQUE NOT NULL REFERENCES Files (file_id) )`);
    db.exec(`CREATE TABLE BookAuthor ( author_id INTEGER NOT NULL REFERENCES Authors (author_id), 
            book_id INTEGER NOT NULL REFERENCES Books (book_id), 
            author_index INTEGER NOT NULL, 
            CONSTRAINT BookAuthor_Unique0 UNIQUE (author_id, book_id), 
            CONSTRAINT BookAuthor_Unique1 UNIQUE (book_id, author_index) )`);
    db.exec(`CREATE TABLE BookSeries ( book_id INTEGER UNIQUE NOT NULL REFERENCES Books (book_id), 
            series_id INTEGER NOT NULL REFERENCES Series (series_id), 
            book_index INTEGER )`);
    db.exec(`CREATE TABLE BookTag ( book_id INTEGER NOT NULL REFERENCES Books (book_id), 
            tag_id INTEGER NOT NULL REFERENCES Tags (tag_id), 
            CONSTRAINT BookTag_Unique UNIQUE (book_id, tag_id) )`);
    db.exec(`CREATE TRIGGER Books_Delete BEFORE DELETE ON Books FOR EACH ROW BEGIN DELETE FROM BookAuthor WHERE book_id = OLD.book_id; DELETE FROM BookSeries WHERE book_id = OLD.book_id; DELETE FROM BookTag WHERE book_id = OLD.book_id; DELETE FROM StackPosition WHERE book_id = OLD.book_id; DELETE FROM BookStateStack WHERE book_id = OLD.book_id; DELETE FROM RecentBooks WHERE book_id = OLD.book_id; DELETE FROM BookList WHERE book_id = OLD.book_id; END`);
    db.exec(`CREATE TRIGGER Files_ArchEntry_Insert BEFORE INSERT ON Files FOR EACH ROW WHEN NEW.parent_id IS NOT NULL AND 0 != (SELECT count(*) FROM Files AS f WHERE f.file_id = NEW.parent_id AND f.parent_id IS NOT NULL) AND NEW.size IS NOT NULL BEGIN SELECT RAISE(ABORT, "size is not null for Archive Entry entry"); END`);
    db.exec(`CREATE TRIGGER Files_ArchEntry_Update BEFORE UPDATE ON Files FOR EACH ROW WHEN NEW.parent_id IS NOT NULL AND 0 != (SELECT count(*) FROM Files AS f WHERE f.file_id = NEW.parent_id AND f.parent_id IS NOT NULL) AND NEW.size IS NOT NULL BEGIN SELECT RAISE(ABORT, "size is not null for Archive Entry entry"); END`);
    db.exec(`CREATE TRIGGER Files_Delete BEFORE DELETE ON Files FOR EACH ROW BEGIN DELETE FROM Books WHERE file_id = OLD.file_id; DELETE FROM PalmType WHERE file_id = OLD.file_id; DELETE FROM NetFiles WHERE file_id = OLD.file_id; END`);
    db.exec(`CREATE TRIGGER Files_Directory_Insert BEFORE INSERT ON Files FOR EACH ROW WHEN NEW.parent_id IS NULL AND NEW.size IS NOT NULL BEGIN SELECT RAISE(ABORT, "size is not null for Directory entry"); END`);
    db.exec(`CREATE TRIGGER Files_Directory_Update BEFORE UPDATE ON Files FOR EACH ROW WHEN NEW.parent_id IS NULL AND NEW.size IS NOT NULL BEGIN SELECT RAISE(ABORT, "size is not null for Directory entry"); END`);
    db.exec(`CREATE TRIGGER Files_Unique_Insert BEFORE INSERT ON Files FOR EACH ROW WHEN NEW.parent_id IS NULL AND 0 != (SELECT count(*) FROM Files AS f WHERE f.parent_id IS NULL AND f.name = NEW.name) BEGIN SELECT RAISE(ABORT, "columns name, parent_id are not unique"); END`);
    db.exec(`CREATE TRIGGER Files_Unique_Update BEFORE UPDATE ON Files FOR EACH ROW WHEN NEW.parent_id IS NULL AND 0 != (SELECT count(*) FROM Files AS f WHERE f.parent_id IS NULL AND f.name = NEW.name AND f.file_id != NEW.file_id) BEGIN SELECT RAISE(ABORT, "columns name, parent_id are not unique"); END`);

    db.close();
}

// test
export function testCreateDb() {
    const db = new Database(APP_DATA_DIR + '/testBooks.db');

    db.exec("CREATE TABLE IF NOT EXISTS lorem (info TEXT)");

    var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (var i = 0; i < 1; i++) {
        stmt.run("Ipsum " + i + ': ' + new Date());
    }

    const all = db.prepare("SELECT rowid AS id, info FROM lorem").all();
    for (const row of all) {
        console.log(row.id + ": " + row.info);
    };
    
    db.close();
}