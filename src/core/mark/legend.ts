import { GeminidTrackModel } from '../geminid-track-model';
import { IsChannelDeep } from '../geminid.schema.guards';

export const LEGEND_LABEL_STYLE = {
    fontSize: '12px',
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fill: 'black',
    background: 'white',
    lineJoin: 'round'
    // stroke: '#ffffff',
    // strokeThickness: 2
};

export function drawColorLegend(HGC: any, trackInfo: any, tile: any, tm: GeminidTrackModel) {
    /* track spec */
    const spec = tm.spec();
    if (!IsChannelDeep(spec.color) || spec.color.type !== 'nominal' || !spec.color.legend) {
        // TODO: only support categorical color
        // we do not need to draw legend
        return;
    }

    /* helper */
    const { colorToHex } = HGC.utils;

    /* color separation */
    const colorCategories: string[] = (tm.getChannelDomainArray('color') as string[]) ?? ['___SINGLE_COLOR___'];
    if (colorCategories.length === 0) {
        // We do not need to draw a legend for only one color
        return;
    }

    /* render */
    const graphics = trackInfo.pBorder; // use pBorder not to affected by zoomming

    const paddingX = 10;
    const paddingY = 4;
    let cumY = paddingY;
    let maxWidth = 0;

    const recipe: { x: number; y: number; color: string }[] = [];

    colorCategories.forEach(category => {
        if (cumY > trackInfo.dimensions[1]) {
            // We do not draw labels overflow
            return;
        }

        const color = tm.encodedValue('color', category);

        const textGraphic = new HGC.libraries.PIXI.Text(category, { ...LEGEND_LABEL_STYLE });
        textGraphic.anchor.x = 1;
        textGraphic.anchor.y = 0;
        textGraphic.position.x = trackInfo.position[0] + trackInfo.dimensions[0] - paddingX;
        textGraphic.position.y = trackInfo.position[1] + cumY;

        graphics.addChild(textGraphic);

        const textStyleObj = new HGC.libraries.PIXI.TextStyle(LEGEND_LABEL_STYLE);
        const textMetrics = HGC.libraries.PIXI.TextMetrics.measureText(category, textStyleObj);

        if (maxWidth < textMetrics.width + paddingX * 3) {
            maxWidth = textMetrics.width + paddingX * 3;
        }

        recipe.push({
            x: trackInfo.position[0] + trackInfo.dimensions[0] - textMetrics.width - paddingX * 2,
            y: trackInfo.position[1] + cumY + textMetrics.height / 2.0,
            color
        });

        cumY += textMetrics.height + paddingY * 2;
    });

    graphics.beginFill(colorToHex('white'), 0.7);
    graphics.lineStyle(
        1,
        colorToHex('#DBDBDB'),
        0.7, // alpha
        0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    graphics.drawRect(
        trackInfo.position[0] + trackInfo.dimensions[0] - maxWidth,
        trackInfo.position[1] + 1,
        maxWidth,
        cumY - paddingY
    );

    recipe.forEach(r => {
        graphics.beginFill(colorToHex(r.color), 1);
        graphics.drawCircle(r.x, r.y, 4);
    });
}

export function drawYLegend(HGC: any, trackInfo: any, tile: any, tm: GeminidTrackModel) {
    /* track spec */
    const spec = tm.spec();
    if (
        !IsChannelDeep(spec.row) ||
        spec.row.type !== 'nominal' ||
        !spec.row.legend
        // || (!IsChannelDeep(spec.y) || spec.y.type !== 'nominal' || !spec.y.legend)
    ) {
        // we do not need to draw a legend
        return;
    }

    /* helper */
    const { colorToHex } = HGC.utils;

    /* track size */
    // const trackHeight = trackInfo.dimensions[1];

    /* row separation */
    const rowCategories: string[] = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    // const rowHeight = trackHeight / rowCategories.length;
    if (rowCategories.length === 0) {
        // We do not need to draw a legend for only one category
        return;
    }

    /* render */
    const graphics = trackInfo.pBorder; // use pBorder not to affected by zoomming

    const paddingX = 4;
    const paddingY = 2;

    rowCategories.forEach(category => {
        const rowPosition = tm.encodedValue('row', category);

        const textGraphic = new HGC.libraries.PIXI.Text(category, { ...LEGEND_LABEL_STYLE });
        textGraphic.anchor.x = 0;
        textGraphic.anchor.y = 0;
        textGraphic.position.x = trackInfo.position[0] + paddingX;
        textGraphic.position.y = trackInfo.position[1] + rowPosition + paddingY;

        graphics.addChild(textGraphic);

        const textStyleObj = new HGC.libraries.PIXI.TextStyle(LEGEND_LABEL_STYLE);
        const textMetrics = HGC.libraries.PIXI.TextMetrics.measureText(category, textStyleObj);

        graphics.beginFill(colorToHex('white'), 0.7);
        graphics.lineStyle(
            1,
            colorToHex('#DBDBDB'),
            0, // alpha
            0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        graphics.drawRect(
            trackInfo.position[0] + 1,
            trackInfo.position[1] + rowPosition + 1,
            textMetrics.width + paddingX * 2,
            textMetrics.height + paddingY * 2
        );
    });
}
