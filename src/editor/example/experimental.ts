import { GoslingSpec } from '../../core/gosling.schema';
// import bed from './bed.json';

export const EXAMPLE_OF_EXPERIMENT: GoslingSpec = {
    layout: 'linear',
    arrangement: { direction: 'horizontal', columnSizes: 800 },
    tracks: [
        {
            data: {
                type: 'json',
                // values: bed,
                values: [
                    { column1: 'chr10', column2: 1675492158, column3: 1675492349, column4: 'peak5', column5: 8.09199 },
                    { column1: 'chr1', column2: 197354819, column3: 197355017, column4: 'peak3', column5: 16.59866 },
                    { column1: 'chr1', column2: 1988820, column3: 1989013, column4: 'peak1', column5: 10.37344 },
                    { column1: 'chr1', column2: 206906930, column3: 206907124, column4: 'peak4', column5: 14.71685 },
                    { column1: 'chr12', column2: 1994241310, column3: 1994241502, column4: 'peak6', column5: 8.86495 },
                    { column1: 'chr14', column2: 2251226715, column3: 2251226907, column4: 'peak7', column5: 11.24377 },
                    { column1: 'chr14', column2: 2290828101, column3: 2290828293, column4: 'peak8', column5: 11.59765 },
                    { column1: 'chr1', column2: 7334981, column3: 7335172, column4: 'peak2', column5: 7.74302 },
                    { column1: 'chr19', column2: 2658902534, column3: 2658902726, column4: 'peak9', column5: 10.88678 },
                    { column1: 'chr2', column2: 402178574, column3: 402178768, column4: 'peak11', column5: 13.89448 },
                    { column1: 'chr2', column2: 443133037, column3: 443133228, column4: 'peak12', column5: 8.07263 },
                    { column1: 'chr2', column2: 281872500, column3: 281873014, column4: 'peak10', column5: 13.99521 },
                    { column1: 'chr3', column2: 584620282, column3: 584620721, column4: 'peak13', column5: 14.68924 },
                    { column1: 'chr5', column2: 959272251, column3: 959272447, column4: 'peak14', column5: 15.45138 },
                    { column1: 'chr9', column2: 1615304825, column3: 1615305022, column4: 'peak15', column5: 16.80942 },
                    { column1: 'chr9', column2: 1621778737, column3: 1621778929, column4: 'peak16', column5: 11.17822 },
                    { column1: 'chrKI270752.1', column2: '19', column3: '358', column4: 'peak17', column5: 5.68613 },
                    {
                        column1: 'chrKI270752.1',
                        column2: '20483',
                        column3: '20810',
                        column4: 'peak18',
                        column5: 10.67836
                    },
                    { column1: 'chrX', column2: 2919283987, column3: 2919284179, column4: 'peak19', column5: 11.59765 },
                    { column1: 'chrX', column2: 2920007474, column3: 2920007672, column4: 'peak20', column5: 14.53432 },
                    { column1: '', column5: NaN }
                ],
                chromosomeField: 'column1',
                genomicFields: ['column2', 'column3'],
                quantitativeFields: ['column5']
            },
            tooltip: [{ field: 'column4', type: 'nominal' }],
            superpose: [
                { mark: 'point', size: { value: 3 }, opacity: { value: 1 } },
                { mark: 'bar', size: { value: 1 } }
            ],
            color: { value: 'gray' },
            x: {
                field: 'column2',
                type: 'genomic',
                axis: 'bottom'
            },
            xe: {
                field: 'column3',
                type: 'genomic'
            },
            y: { field: 'column5', type: 'quantitative' }
        }
    ]
};
