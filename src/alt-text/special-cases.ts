import type { AltTrack } from './alt-gosling-schema';
import { attributeExists, attributeExistsAndChildHasValue } from './util';

export function determineSpecialCases(altTrack: AltTrack): string | undefined {
    let _mark = altTrack.appearance.details.mark;
    let _encodingField = altTrack.appearance.details.encodings.encodingField;

    if (_mark === 'point' && attributeExistsAndChildHasValue(_encodingField, 'x', 'type', 'quantitative') && attributeExistsAndChildHasValue(_encodingField, 'y', 'type', 'quantitative')) {
        return 'scatter plot';
    }
    if (_mark === 'line' && attributeExistsAndChildHasValue(_encodingField, 'x', 'type', 'genomic') && attributeExistsAndChildHasValue(_encodingField, 'y', 'type', 'quantitative')) {
        return 'line chart';
    }
    if (_mark === 'line' && attributeExistsAndChildHasValue(_encodingField, 'x', 'type', 'quantitative') && attributeExistsAndChildHasValue(_encodingField, 'y', 'type', 'genomic')) {
        return 'line chart';
    }
    if (_mark === 'bar' && attributeExistsAndChildHasValue(_encodingField, 'x', 'type', 'genomic') && attributeExistsAndChildHasValue(_encodingField, 'y', 'type', 'quantitative')) {
        return 'bar chart';
    }
    if (_mark === 'rect' && attributeExistsAndChildHasValue(_encodingField, 'x', 'type', 'genomic') && attributeExistsAndChildHasValue(_encodingField, 'xe', 'type', 'genomic') && attributeExistsAndChildHasValue(_encodingField, 'color', 'type', 'quantitative')) {
        return 'heat map';
    }
    if (_mark === 'rect' && attributeExistsAndChildHasValue(_encodingField, 'x', 'type', 'genomic') && attributeExistsAndChildHasValue(_encodingField, 'xe', 'type', 'genomic') && attributeExistsAndChildHasValue(_encodingField, 'color', 'type', 'nominal')) {
        return 'ideogram';
    }
    return;
}
