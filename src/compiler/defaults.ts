import type { CommonViewDef, InternalView } from '@gosling-lang/gosling-schema';

export const DEFAULT_VISUAL_PROPERTIES = {
    opacity: 1
};

export const DEFAULT_TITLE_HEIGHT = 20; // deprecated
export const DEFAULT_SUBTITLE_HEIGHT = 20; // deprecated
export const DEWFAULT_TITLE_PADDING_ON_TOP_AND_BOTTOM = 6;

// default track size
export const DEFAULT_TRACK_HEIGHT_LINEAR = 130;
export const DEFAULT_TRACK_WIDTH_LINEAR = 600;
export const DEFAULT_TRACK_SIZE_2D = 600;

// gab between views
export const DEFAULT_VIEW_SPACING = 10;

// empty space inside the visualization for circular layouts
export const DEFAULT_INNER_RADIUS_PROP = 0.3;

// padding around a circular view
export const DEFAULT_CIRCULAR_VIEW_PADDING = 0; // TODO: this is not properly considered in determining the arrangement of views

// default color when cannot parse
export const DEFAULT_BACKUP_COLOR = 'gray';

export const DEFAULT_VIEW_PROPERTIES: CommonViewDef & Pick<InternalView, 'arrangement'> = {
    arrangement: 'vertical',
    assembly: 'hg38',
    layout: 'linear',
    orientation: 'horizontal',
    static: false,
    zoomLimits: [1, null],
    centerRadius: DEFAULT_INNER_RADIUS_PROP,
    spacing: DEFAULT_VIEW_SPACING,
    xOffset: 0,
    yOffset: 0
};
