import { scaleLinear } from 'd3';

export function drawTextSequence(HGC: any, trackInfo: any, tile: any) {
    if (!tile.textGraphics) {
        tile.textGraphics = new HGC.libraries.PIXI.Graphics();
        tile.graphics.addChild(tile.textGraphics);
    }

    const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(
        tile.tileData.zoomLevel,
        tile.tileData.tilePos,
        trackInfo.tilesetInfo.tile_size
    );
    const trackHeight = trackInfo.dimensions[1];
    const data = tile.tabularData as { [k: string]: number | string }[];
    const uniqueCategories = Array.from(new Set(data.map(d => d['__N__'])));
    const uniquePositions = Array.from(new Set(data.map(d => d['__G__'])));
    const xScale = trackInfo._xScale.copy();
    const width = (xScale(tileX + tileWidth) - xScale(tileX)) / uniquePositions.length;
    const margin = width - 10;

    let alphaSeq = 1.0;

    if (margin < 2) {
        return;
    } else if (trackHeight < 10) {
        alphaSeq = 0;
    } else if (margin < 5 && margin >= 2) {
        // gracefully fade out
        const alphaScale = scaleLinear().domain([2, 5]).range([0, 1]).clamp(true);
        alphaSeq = alphaScale(width - 10);
    }

    tile.textGraphics.alpha = alphaSeq;

    data.forEach(d => {
        // jth vertical bar in the graph
        const x = (d['__Q__'] as number) * width;

        const text = new HGC.libraries.PIXI.Text(d['__N__'], {
            fontSize: '12px',
            fontFamily: 'Arial',
            fill: 'black',
            fontWeight: 'bold'
        });
        text.width = 10;
        text.height = 10;
        text.letter = d['__N__'];

        const txStart = xScale(tileX) + x;
        const txMiddle = txStart + width / 2 - text.width / 2;
        const tyMiddle = uniqueCategories.length / 2 - text.height / 2;

        text.position.x = txMiddle;
        text.position.y = tyMiddle;

        // pixi
        tile.textGraphics.addChild(text);

        // svg
        // obj.addSVGInfoText(
        //     tile,
        //     txMiddle,
        //     tyMiddle,
        //     d['__N__'],
        //     alphaSeq
        // );
    });
}
