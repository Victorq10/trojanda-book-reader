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
        initApp(): void;
        recreateWindow(): void;
        open_ePub_book(): void;
    }
}


//declare var trojandaBookApplicationInstance: TrojandaBookApplication;