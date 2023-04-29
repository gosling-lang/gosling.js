import type { VcfRecord, VcfTile } from './vcf-data-fetcher';

export const getMutationType = (ref: string, alt?: string) => {
    if (!alt) return 'unknown';
    if (ref.length === alt.length) return 'substitution';
    if (ref.length > alt.length) return 'deletion';
    if (ref.length < alt.length) return 'insertion';
    return 'unknown';
};

export const getSubstitutionType = (ref: string, alt?: string) => {
    switch (ref + alt) {
        case 'CA':
        case 'GT':
            return 'C>A';
        case 'CG':
        case 'GC':
            return 'C>G';
        case 'CT':
        case 'GA':
            return 'C>T';
        case 'TA':
        case 'AT':
            return 'T>A';
        case 'TC':
        case 'AG':
            return 'T>C';
        case 'TG':
        case 'AC':
            return 'T>G';
        default:
            return 'unknown';
    }
};

/**
 * Convert a VCF record to a tile data
 * @param vcfRecord A row of a VCF files loaded
 * @param chrPos Cumulative start position of a chromosome
 * @param prevPos Previous position of a point mutation for calculating 'distance to previous'
 */
export function recordToTile(vcfRecord: VcfRecord, chrPos: number, prevPos?: number) {
    const POS = chrPos + vcfRecord.POS + 1;

    let ALT: string | undefined;
    if (Array.isArray(vcfRecord.ALT) && vcfRecord.ALT.length > 0) {
        ALT = vcfRecord.ALT[0];
    }

    // Additionally inferred values
    const DISTPREV = !prevPos ? null : vcfRecord.POS - prevPos;
    const DISTPREVLOGE = !prevPos ? null : Math.log(vcfRecord.POS - prevPos);
    const MUTTYPE = getMutationType(vcfRecord.REF, ALT);
    const SUBTYPE = getSubstitutionType(vcfRecord.REF, ALT);
    const POSEND = POS + vcfRecord.REF.length;

    // Create key values
    const data: VcfTile = {
        ...vcfRecord,
        ALT,
        MUTTYPE,
        SUBTYPE,
        INFO: JSON.stringify(vcfRecord.INFO),
        ORIGINALPOS: vcfRecord.POS,
        POS,
        POSEND,
        DISTPREV,
        DISTPREVLOGE
    };

    // Add optional INFO columns
    Object.keys(vcfRecord.INFO).forEach(key => {
        const val = vcfRecord.INFO[key];
        if (Array.isArray(val)) {
            data[key] = val.join(', ');
        } else {
            data[key] = val;
        }
    });
    return data;
}
