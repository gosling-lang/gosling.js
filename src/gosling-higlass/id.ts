/**
 * Manage IDs of Gosling tracks and compiled HiGlass views.
 */
export default class IdMapper {
    /** A mapping table between Gosling track IDs to HiGlass view IDs */
    #mappingTable: Record<string, string> = {};

    getMappingTable() {
        return this.#mappingTable;
    }
    addMapping(gtId: string, hvId: string) {
        if(this.#mappingTable[gtId]) {
            console.warn('The given track ID already exists.');
        }
        this.#mappingTable[gtId] = hvId;
    }
    getGoslingIds() {
        return Object.keys(this.#mappingTable);
    }
    getHiGlassId(gtId: string) {
        return this.#mappingTable[gtId];
    }

    /**
     * Get IDs of Gosling tracks that became the same HiGlass view.
     * @param HiGlassId 
     * @returns 
     */
    getSiblingGoslingIds(HiGlassId: string) {
        return Object.entries(this.#mappingTable).filter(([gtId, hvId]) => hvId === HiGlassId).map(([gtId]) => gtId);
    }
}