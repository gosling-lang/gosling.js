import { AREA } from './area';
import { BAR } from './bar';
import { BRUSH } from './brush';
import { LINE } from './line';
import { LINK } from './link';
import { LINKING_TRACKS } from './linking-tracks';
import { OVERLAY_TRACKS_BAR_POINT } from './overlay-tracks-bar-point';
import { OVERLAY_TRACKS_LINE_POINT } from './overlay-tracks-line-point';
import { OVERLAY_TRACKS_RECT_TEXT } from './overlay-tracks-rect-text';
import { POINT } from './point';
import { RECT } from './rect';
import { SEMANTIC_ZOOM_SEQUENCE } from './semantic-zoom-sequence';
import { SEMANTIC_ZOOM_CYTO } from './semantic-zoom-cyto';
import { TEXT } from './text';
import { TRIANGLE } from './triangle';

export const DOC_EXAMPLES = {
    doc_area: {
        id: 'doc_area',
        name: 'Basic Example: Area Mark',
        spec: AREA,
        hidden: true
    },
    doc_bar: {
        id: 'doc_bar',
        name: 'Basic Example: Bar Mark',
        spec: BAR,
        hidden: true
    },
    doc_brush: {
        id: 'doc_brush',
        name: 'Basic Example: Brush Mark',
        spec: BRUSH,
        hidden: true
    },
    doc_line: {
        id: 'doc_line',
        name: 'Basic Example: Line Mark',
        spec: LINE,
        hidden: true
    },
    doc_link: {
        id: 'doc_link',
        name: 'Basic Example: Link Mark',
        spec: LINK,
        hidden: true
    },
    doc_linking_tracks: {
        id: 'doc_linking_tracks',
        name: 'Basic Example: Linking Tracks',
        spec: LINKING_TRACKS,
        hidden: true
    },
    doc_point: {
        id: 'doc_point',
        name: 'Basic Example: Point Mark',
        spec: POINT,
        hidden: true
    },
    doc_rect: {
        id: 'doc_rect',
        name: 'Basic Example: React Mark',
        spec: RECT,
        hidden: true
    },
    doc_text: {
        id: 'doc_text',
        name: 'Basic Example: Text Mark',
        spec: TEXT,
        hidden: true
    },
    doc_triangle: {
        id: 'doc_triangle',
        name: 'Basic Example: Triangle Mark',
        spec: TRIANGLE,
        hidden: true
    },
    doc_overlay_bar_point: {
        id: 'doc_overlay_bar_point',
        name: 'Overlay Tracks: Bar + Point',
        spec: OVERLAY_TRACKS_BAR_POINT,
        hidden: true
    },
    doc_overlay_rect_text: {
        id: 'doc_overlay_rect_text',
        name: 'Overlay Tracks: Rect + Text',
        spec: OVERLAY_TRACKS_RECT_TEXT,
        hidden: true
    },
    doc_overlay_line_point: {
        id: 'doc_overlay_line_point',
        name: 'Overlay Tracks: Line + Point',
        spec: OVERLAY_TRACKS_LINE_POINT,
        hidden: true
    },
    doc_semantic_zoom_sequence: {
        id: 'doc_semantic_zoom_sequence',
        name: 'Semantic Zoom: A Sequence Example',
        spec: SEMANTIC_ZOOM_SEQUENCE,
        hidden: true
    },
    doc_semantic_zoom_cyto: {
        id: 'doc_semantic_zoom_cyto',
        name: 'Semantic Zoom: Cyto',
        spec: SEMANTIC_ZOOM_CYTO,
        hidden: true
    }
};
