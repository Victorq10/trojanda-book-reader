//import { TrojandaBookApplication } from "../TrojandaBookApplication";

/**
 * IMPORTANT - do not use imports in this file!
 * It will break global definition.
 */
declare namespace NodeJS {
    export interface Global {
        trojandaBookApplicationInstance: TrojandaBookApplicationInterface;
    }
    export interface TrojandaBookApplicationInterface {
        init_app(): void;
        recreate_window(): void;
        open_epub_book(): void;
    }
}


//declare var trojandaBookApplicationInstance: TrojandaBookApplication;