import type { AltTrack } from './alt-gosling-schema';

export function determineSpecialCases(altTrack: AltTrack): string | undefined {
    let _mark = altTrack.appearance.details.mark;
    let _genomicEncodings = altTrack.appearance.details.encodings.encodingDeepGenomic.map(o => o.name);
    let _quantitativeEncodings = altTrack.appearance.details.encodings.encodingDeepQuantitative.map(o => o.name);
    let _nominalEncodings = altTrack.appearance.details.encodings.encodingDeepNominal.map(o => o.name);

    if (_mark === 'point' && _quantitativeEncodings.includes('x') && _quantitativeEncodings.includes('y')) {
        return 'scatter plot';
    }
    if (_mark === 'line' && _genomicEncodings.includes('x') && _quantitativeEncodings.includes('y')) {
        return 'line chart';
    }
    if (_mark === 'line' && _quantitativeEncodings.includes('x') && _genomicEncodings.includes('y')) {
        return 'line chart';
    }
    if (_mark === 'bar' && _genomicEncodings.includes('x') && _quantitativeEncodings.includes('y')) {
        return 'bar chart';
    }
    if (_mark === 'rect' && _genomicEncodings.includes('x') && _genomicEncodings.includes('xe') && _quantitativeEncodings.includes('color')) {
        return 'heat map';
    }
    if (_mark === 'rect' && _genomicEncodings.includes('x') && _genomicEncodings.includes('xe') && _nominalEncodings.includes('color')) {
        return 'ideogram';
    }
    return;
}