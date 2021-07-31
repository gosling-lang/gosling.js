import { GoslingSpec, OverlaidTracks, TemplateTrackDef, TemplateTrackMappingDef, Track } from '../gosling.schema';
import { IsTemplateTrack } from '../gosling.schema.guards';
import { traverseTracks } from './spec-preprocess';

/**
 * Track templates officially supported by Gosling.js.
 */
export const GoslingTemplates: TemplateTrackDef[] = [
    {
        name: 'empty',
        customChannels: [],
        mapping: []
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
            // We do not know about this template, so set a flag and remove it from the spec when compiling.
            t._invalidTrack = true;
            return;
        }

        let isValid = true;
        templateDef.customChannels.forEach(d => {
            if (d.required && !(d.channel in t)) {
                // Required channels are not defined
                isValid = false;
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
        templateDef.mapping.forEach((m: TemplateTrackMappingDef) => {
            const convertedTrack: Partial<Track> = {
                mark: m.mark
            };
            convertedView.tracks.push(convertedTrack);
        });

        ts[i] = convertedView;
    });

    // DEBUG
    // console.log('After replaceTrackTemplates()', JSON.parse(JSON.stringify(spec)));
}
