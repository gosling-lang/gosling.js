import BED from '@gmod/bed';
import type { BedTile } from './bed-worker';

/**
 * Used in BedParser to associate column names with data types
 */
type FieldInfo = [type: string, fieldName: string];

/**
 * From gmod/bed-js
 */
const DEFAULT_BED_SCHEMA = `table defaultBedSchema
"BED12"
    (
    string chrom;      "The name of the chromosome (e.g. chr3, chrY, chr2_random) or scaffold (e.g. scaffold10671)."
    uint   chromStart; "The starting position of the feature in the chromosome or scaffold. The first base in a chromosome is numbered 0."
    uint   chromEnd;   "The ending position of the feature in the chromosome or scaffold. The chromEnd base is not included in the display of the feature. For example, the first 100 bases of a chromosome are defined as chromStart=0, chromEnd=100, and span the bases numbered 0-99."
    string   name;   "Defines the name of the BED line."
    float   score;   "Feature score, doesn't care about the 0-1000 limit as in bed"
    char   strand;   "Defines the strand. Either '.' (=no strand) or '+' or '-'"
    uint thickStart; "The starting position at which the feature is drawn thickly (for example, the start codon in gene displays). When there is no thick part, thickStart and thickEnd are usually set to the chromStart position."
    uint thickEnd; "The ending position at which the feature is drawn thickly (for example the stop codon in gene displays)."
    string itemRgb; "An RGB value of the form R,G,B (e.g. 255,0,0). "
    uint blockCount; " The number of blocks (exons) in the BED line."
    uint[blockCount] blockSizes; " A comma-separated list of the block sizes. The number of items in this list should correspond to blockCount."
    uint[blockCount] blockStarts; "A comma-separated list of block starts. All of the blockStart positions should be calculated relative to chromStart. The number of items in this list should correspond to blockCount."
    )`;

/**
 * A class to create a BED file parser
 */
class BedParser {
    #customFields?: string[];
    #n_columns?: number;
    #parser: BED;

    /**
     * Constructor for BedParser
     * @param customFields An array of strings, where each string is the name of a custom column
     * @param n_columns A number which is the number of columns in the Bed File
     */
    constructor(opt?: { customFields: string[]; n_columns: number }) {
        this.#customFields = opt?.customFields;
        this.#n_columns = opt?.n_columns;
        if (this.#customFields) {
            const customAutoSqlSchema = this.constructBedAutoSql();
            this.#parser = new BED({ autoSql: customAutoSqlSchema });
        } else {
            this.#parser = new BED({ autoSql: DEFAULT_BED_SCHEMA });
        }
    }
    /**
     * Parses a single BED file line
     * @returns An object which contains the parsed data from the line
     */
    parseLine(line: string, chromStart: number) {
        /** Helper function to calculate cumulative chromosome positions */
        function relativeToCumulative(pos: number, chromStart: number) {
            return chromStart + pos + 1;
        }
        const bedRecord: BedTile = this.#parser.parseLine(line) as BedTile;
        const fieldsToConvert = ['chromStart', 'chromEnd', 'thickEnd', 'thickStart'];
        fieldsToConvert.forEach(field => {
            if (bedRecord[field]) bedRecord[field] = relativeToCumulative(bedRecord[field] as number, chromStart);
        });
        return bedRecord;
    }
    /**
     * Generates an autoSql schema for a BED file that has custom columns
     * @returns A string which is the autoSql spec
     */
    constructBedAutoSql() {
        const AUTO_SQL_HEADER = `table customBedSchema\n"BED12"\n    (\n`;
        const AUTO_SQL_FOOTER = '\n    )';

        const autoSqlFields = this.#generateAutoSQLFields();
        return String.prototype.concat(AUTO_SQL_HEADER, autoSqlFields, AUTO_SQL_FOOTER);
    }
    /**
     * Generates the fields used in the autoSql schema. For custom column names.
     * @returns A string which is are the fields in the autoSql schema
     */
    #generateAutoSQLFields() {
        const BED12Fields: FieldInfo[] = [
            ['string', 'chrom'],
            ['uint', 'chromStart'],
            ['uint', 'chromEnd'],
            ['string', 'name'],
            ['float', 'score'],
            ['char', 'strand'],
            ['uint', 'thickStart'],
            ['uint', 'thickEnd'],
            ['string', 'itemRgb'],
            ['uint', 'blockCount'],
            ['uint[blockCount]', 'blockSizes'],
            ['uint[blockCount]', 'blockStarts']
        ];
        if (!this.#n_columns) throw new Error('Number of columns was not able to be determined');
        if (!this.#customFields) return ''; // This function should never be called if there are no custom fields
        const customFieldType = 'string';
        const customFieldsWithTypes = this.#customFields.map(column => [customFieldType, column] as FieldInfo);

        let allFields: FieldInfo[];
        const REQUIRED_COLS = 3;
        if (this.#n_columns > BED12Fields.length) {
            // BED12+m so we just want to concat on the extra fields.
            // But first we make sure that we have the expected number of columns.
            if (this.#n_columns !== BED12Fields.length + this.#customFields.length) {
                throw new Error(`BED file error: unexpected number of custom fields. Found ${this.#n_columns} columns 
                    which is different from the expected ${BED12Fields.length + this.#customFields.length}`);
            }
            allFields = BED12Fields.concat(customFieldsWithTypes);
        } else if (this.#n_columns >= REQUIRED_COLS + this.#customFields.length) {
            // BEDn or BEDn+. We make sure that the required columns are not removed when we do the slice.
            allFields = BED12Fields.slice(0, this.#n_columns - this.#customFields.length).concat(customFieldsWithTypes);
        } else {
            throw new Error(
                `Expected ${REQUIRED_COLS + this.#customFields.length} columns (${REQUIRED_COLS} required columns and ${
                    this.#customFields.length
                } custom columns) but found ${this.#n_columns} columns`
            );
        }

        const fieldDescription = 'custom input'; // A genetic description to satisfy the autoSQL parser
        const autoSqlFields = allFields
            .map(fieldInfo => `    ${fieldInfo[0]} ${fieldInfo[1]}; "${fieldDescription}"`)
            .join('\n');

        return autoSqlFields;
    }
}

export default BedParser;
