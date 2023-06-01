/**
 * Manage IDs of Gosling tracks and compiled HiGlass views.
 */
export default class IdManager {
    /** A mapping table between Gosling track IDs to HiGlass view IDs */
    #idTable: Record<string, string> = {};

    getTable() {
        return this.#idTable;
    }
    addId(gtId: string, hvId: string) {
        if(this.#idTable[gtId]) {
            console.warn('The given track ID already exists.');
        }
        this.#idTable[gtId] = hvId;
    }
    getGoslingIds() {
        return Object.keys(this.#idTable);
    }
    getHiGlassId(gtId: string) {
        return this.#idTable[gtId];
    }
    getSiblingIds(HiGlassId: string) {
        return Object.entries(this.#idTable).filter(([gtId, hvId]) => hvId === HiGlassId).map(([gtId]) => gtId);
    }
}