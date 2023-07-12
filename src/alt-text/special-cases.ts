import type { TrackSingleAlt } from './alt-gosling-schema';
import { attributeExists, attributeExistsAndChildHasValue } from './util';

export function determineSpecialCases(trackSingle: TrackSingleAlt): string | undefined {
    let _mark = trackSingle.mark;
    let _encodingField = trackSingle.encodingSeparated.encodingField;

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
