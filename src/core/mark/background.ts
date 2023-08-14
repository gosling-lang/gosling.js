import { isUndefined } from 'lodash-es';
import type { GoslingTrackModel } from '../../tracks/gosling-track/gosling-track-model';
import { IsChannelDeep } from '@gosling-lang/gosling-schema';
import colorToHex from '../utils/color-to-hex';
import type { CompleteThemeDeep } from '../utils/theme';

export function drawBackground(trackInfo: any, tm: GoslingTrackModel, theme: Required<CompleteThemeDeep>) {
    // size and position
    const [l, t] = trackInfo.position;
    const [w, h] = trackInfo.dimensions;

    // refer to https://github.com/higlass/higlass/blob/f82c0a4f7b2ab1c145091166b0457638934b15f3/app/scripts/PixiTrack.js#L129
    const g = trackInfo.pBackground;

    if (tm.spec().style?.background || (theme.track.background && theme.track.background !== 'transparent')) {
        g.clear();

        const bg = tm.spec().style?.background ?? theme.track.background;
        const alpha = isUndefined(tm.spec().style?.backgroundOpacity) ? 1 : tm.spec().style?.backgroundOpacity;
        // background
        g.lineStyle(
            1,
            colorToHex('white'),
            0, // alpha
            0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        g.beginFill(colorToHex(bg), alpha);
        g.drawRect(l, t, w, h);
    }

    if (theme.track.alternatingBackground && theme.track.alternatingBackground !== 'transparent') {
        const spec = tm.spec();

        if (!IsChannelDeep(spec.row) || spec.row.type !== 'nominal') {
            // we do not use a `row` channel, so no need to draw alternating backgrounds
            return;
        }

        /* row separation */
        const rowCategories: string[] = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
        if (rowCategories.length === 0) {
            // We do not need to fill alternating colors for only one category
            return;
        }

        /* render */
        rowCategories.forEach((category, i) => {
            if (i % 2 === 0) {
                // we only draw even rows
                return;
            }
            const rowPosition = tm.encodedValue('row', category);

            const bg = tm.spec().style?.background ?? theme.track.alternatingBackground;
            const alpha = isUndefined(tm.spec().style?.backgroundOpacity) ? 1 : tm.spec().style?.backgroundOpacity;
            // background
            g.lineStyle(
                1,
                colorToHex('white'),
                0, // alpha
                0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );
            g.beginFill(colorToHex(bg), alpha);
            g.drawRect(trackInfo.position[0], trackInfo.position[1] + rowPosition, w, h / rowCategories.length);
        });
    }
}
