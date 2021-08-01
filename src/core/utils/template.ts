import assign from 'lodash/assign';
import {
    CustomChannelDef,
    DataTransform,
    DataTransformWithBase,
    GoslingSpec,
    OverlaidTracks,
    TemplateTrackDef,
    TemplateTrackMappingDef,
    Track
} from '../gosling.schema';
import { IsTemplateTrack } from '../gosling.schema.guards';
import { traverseTracks } from './spec-preprocess';

/**
 * Track templates officially supported by Gosling.js.
 */
export const GoslingTemplates: TemplateTrackDef[] = [
    {
        name: 'gene',
        channels: [
            { name: 'startPosition', type: 'genomic', required: true },
            { name: 'endPosition', type: 'genomic', required: true },
            { name: 'strandColor', type: 'nominal', required: true }, // TODO: how to redefine bound colors?
            { name: 'geneHeight', type: 'value', required: false },
            { name: 'geneLabel', type: 'nominal', required: true }, // TODO: can this be false and not show if undefined?
            { name: 'type', type: 'nominal', required: true } // either 'gene' or 'exon'
        ],
        mapping: [
            {
                dataTransform: [{ type: 'filter', base: 'type', oneOf: ['gene'] }],
                mark: 'text',
                text: { base: 'geneLabel', type: 'nominal' }, // TODO: add dy here
                x: { base: 'startPosition', type: 'genomic' },
                xe: { base: 'endPosition', type: 'genomic' },
                row: { base: 'strandColor', type: 'nominal', domain: ['+', '-'] },
                color: { base: 'strandColor', type: 'nominal', domain: ['+', '-'], range: ['blue', 'red'] },
                opacity: { value: 0.4 },
                // stroke: { value: 'white' },
                // strokeWidth: { value: 2 },
                style: { textStrokeWidth: 2, textStroke: 'white' },
                // style: { dy: -30 }, // TODO: how to redefine style from the users' side?
                visibility: [
                    {
                        operation: 'less-than',
                        measure: 'width',
                        threshold: '|xe-x|',
                        transitionPadding: 10,
                        target: 'mark'
                    }
                ]
            },
            {
                dataTransform: [
                    { type: 'filter', base: 'type', oneOf: ['gene'] },
                    { type: 'filter', base: 'strandColor', oneOf: ['-'] }
                ],
                mark: 'triangleLeft',
                x: { base: 'startPosition', type: 'genomic' },
                size: { base: 'geneHeight', value: 12 },
                row: { base: 'strandColor', type: 'nominal', domain: ['+', '-'] },
                color: { base: 'strandColor', type: 'nominal', domain: ['+', '-'], range: ['blue', 'red'] },
                opacity: { value: 0.4 },
                style: { align: 'right' }
            },
            {
                dataTransform: [
                    { type: 'filter', base: 'type', oneOf: ['gene'] },
                    { type: 'filter', base: 'strandColor', oneOf: ['+'] }
                ],
                mark: 'triangleRight',
                x: { base: 'endPosition', type: 'genomic' },
                size: { base: 'geneHeight', value: 12 },
                row: { base: 'strandColor', type: 'nominal', domain: ['+', '-'] },
                color: { base: 'strandColor', type: 'nominal', domain: ['+', '-'], range: ['blue', 'red'] },
                opacity: { value: 0.4 },
                style: { align: 'left' }
            },
            {
                dataTransform: [{ type: 'filter', base: 'type', oneOf: ['exon'] }],
                mark: 'rect',
                x: { base: 'startPosition', type: 'genomic' },
                xe: { base: 'endPosition', type: 'genomic' },
                size: { base: 'geneHeight', value: 12 },
                row: { base: 'strandColor', type: 'nominal', domain: ['+', '-'] },
                color: { base: 'strandColor', type: 'nominal', domain: ['+', '-'], range: ['blue', 'red'] },
                opacity: { value: 0.4 }
            },
            {
                dataTransform: [
                    { type: 'filter', base: 'type', oneOf: ['gene'] },
                    { type: 'filter', base: 'strandColor', oneOf: ['+'] }
                ],
                mark: 'rect',
                x: { base: 'startPosition', type: 'genomic' },
                xe: { base: 'endPosition', type: 'genomic' },
                row: { base: 'strandColor', type: 'nominal', domain: ['+', '-'] },
                color: { base: 'strandColor', type: 'nominal', domain: ['+', '-'], range: ['blue', 'red'] },
                opacity: { value: 0.4 },
                size: { value: 3 }
                // style: {
                //     linePattern: { type: 'triangleRight', size: 5 }
                // }
            },
            {
                dataTransform: [
                    { type: 'filter', base: 'type', oneOf: ['gene'] },
                    { type: 'filter', base: 'strandColor', oneOf: ['-'] }
                ],
                mark: 'rect',
                x: { base: 'startPosition', type: 'genomic' },
                xe: { base: 'endPosition', type: 'genomic' },
                row: { base: 'strandColor', type: 'nominal', domain: ['+', '-'] },
                color: { base: 'strandColor', type: 'nominal', domain: ['+', '-'], range: ['blue', 'red'] },
                opacity: { value: 0.4 },
                size: { value: 3 }
                // style: {
                //     linePattern: { type: 'triangleLeft', size: 5 }
                // }
            }
        ]
    }
];

/**
 * Replace track templetes to low-level gosling specs.
 * @param spec
 */
export function replaceTrackTemplates(spec: GoslingSpec, templates: TemplateTrackDef[]) {
    traverseTracks(spec, (t, i, ts) => {
        if (!IsTemplateTrack(t)) {
            // If this is not a template track, no point to replace templates.
            return;
        }

        const { template: name } = t;
        const templateDef = templates.find(d => d.name === name);

        /* Validation */
        if (!templateDef) {
            // No idea what this template is, so set a flag and remove it from the spec when compiling.
            t._invalidTrack = true;
            console.warn(`There is no track template named '${name}'`);
            return;
        }

        let isValid = true;
        templateDef.channels.forEach((d: CustomChannelDef) => {
            if (d.required && (!t.encoding || !(d.name in t.encoding))) {
                // Required channels are not defined
                isValid = false;
                console.warn(`A template spec ('${name}') does not contain a required channel, ${d.name}`);
            }
        });

        if (!isValid) {
            // The template spec is not valid for given template definition
            t._invalidTrack = true;
            return;
        }

        /* conversion */
        const convertedView: OverlaidTracks = {
            alignment: 'overlay',
            tracks: [],
            width: t.width ?? 100,
            height: t.height ?? 100
        };
        templateDef.mapping.forEach((singleTrackMappingDef: TemplateTrackMappingDef) => {
            // Set required properties
            const convertedTrack: Partial<Track> = {
                data: t.data,
                mark: singleTrackMappingDef.mark
            };

            // Handle data transform
            const { dataTransform } = singleTrackMappingDef;
            if (dataTransform) {
                const newDataTransform: DataTransform[] = [];
                dataTransform.map((dataTramsformMap: DataTransformWithBase) => {
                    const baseChannelName = dataTramsformMap.base;
                    if (
                        baseChannelName &&
                        t.encoding &&
                        baseChannelName in t.encoding &&
                        'field' in t.encoding[baseChannelName]
                    ) {
                        delete dataTramsformMap.base;
                        (dataTramsformMap as any).field = (t.encoding[baseChannelName] as any).field;
                        newDataTransform.push(dataTramsformMap as DataTransform);
                    } else {
                        // TODO: JUST ADD?
                    }
                });
            }

            // Handle encoding
            const encodingSpec = t.encoding;
            if (!encodingSpec) {
                // This means we do not need to override anything, so use default encodings
                Object.keys(singleTrackMappingDef)
                    .filter(k => k !== 'mark')
                    .forEach(channelKey => {
                        // Iterate all channels
                        const channelMap = (singleTrackMappingDef as any)[channelKey];
                        if ('base' in channelMap) {
                            delete channelMap.base;
                        }
                        convertedTrack[channelKey as keyof TemplateTrackMappingDef] = channelMap;
                    });
            } else {
                Object.keys(singleTrackMappingDef)
                    .filter(k => k !== 'mark')
                    .forEach(channelKey => {
                        // Iterate all channels
                        const channelMap = (singleTrackMappingDef as any)[channelKey];
                        if ('base' in channelMap) {
                            const baseChannelName = channelMap.base;
                            if (baseChannelName in encodingSpec) {
                                // This means we need to override a user's spec for this channel
                                const base = JSON.parse(JSON.stringify(encodingSpec[baseChannelName]));
                                delete channelMap.base;
                                const newChannelSpec = assign(channelMap, JSON.parse(JSON.stringify(base)));
                                convertedTrack[channelKey as keyof TemplateTrackMappingDef] = newChannelSpec;
                            } else {
                                // This means a user did not specify a optional custom channel, so just remove a `base` property.
                                delete channelMap.base;
                                convertedTrack[channelKey as keyof TemplateTrackMappingDef] = channelMap;
                            }
                        } else {
                            // This means we use encoding that is constant.
                            convertedTrack[channelKey as keyof TemplateTrackMappingDef] = channelMap;
                        }
                    });
            }

            convertedView.tracks.push(convertedTrack);
        });

        ts[i] = convertedView;
    });

    // DEBUG
    // console.log('After replaceTrackTemplates()', JSON.parse(JSON.stringify(spec)));
}
