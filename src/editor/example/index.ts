import { GeminiSpec } from '../../core/gemini.schema';
import { EXMAPLE_BASIC_MARKS } from './basic-marks';
import { EXAMPLE_SUPERPOSE } from './superpose';
import { EXAMPLE_IDEOGRAM } from './ideogram';
import { EXAMPLE_GENE_ANNOTATION } from './gene-annotation';
import { EXAMPLE_LINKS } from './links';
import { EXAMPLE_OVERVIEW_DEATIL } from './overview-plus-detail-views';
import { EXAMPLE_PERIPHERAL_PLOT } from './peripheral-plot';
import { EXAMPLE_SEMANTIC_ZOOMING } from './semantic-zoom';
import { EXAMPLE_DATA_FETCHER } from './data-fetcher';
import { EXMAPLE_BASIC_LINKING } from './linking';

export const examples: ReadonlyArray<{
    name: string;
    spec: GeminiSpec;
    underDevelopment?: boolean;
}> = [
    {
        name: 'Basic Marks',
        spec: EXMAPLE_BASIC_MARKS
    },
    {
        name: 'Superposed Tracks',
        spec: EXAMPLE_SUPERPOSE
    },
    {
        name: 'Ideograms (Static)',
        spec: EXAMPLE_IDEOGRAM
    },
    {
        name: 'Custom Gene Annotation Tracks',
        spec: EXAMPLE_GENE_ANNOTATION
    },
    {
        name: 'Between and Within Links',
        spec: EXAMPLE_LINKS,
        underDevelopment: true
    },
    {
        name: 'Semantic Zooming',
        spec: EXAMPLE_SEMANTIC_ZOOMING
    },
    {
        name: 'Semantic Zooming with Multiple Tilesets',
        spec: EXAMPLE_DATA_FETCHER,
        underDevelopment: true
    },
    {
        name: 'Basic Linking',
        spec: EXMAPLE_BASIC_LINKING
    },
    {
        name: 'Overview + Detail views',
        spec: EXAMPLE_OVERVIEW_DEATIL,
        underDevelopment: true
    },
    {
        name: 'Peripheral Plot',
        spec: EXAMPLE_PERIPHERAL_PLOT,
        underDevelopment: true
    }
] as const;
