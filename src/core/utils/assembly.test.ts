import type { Assembly } from '@gosling-lang/gosling-schema';
import {
    getChromInterval,
    getChromTotalSize,
    getRelativeGenomicPosition,
    computeChromSizes,
    GenomicPositionHelper
} from './assembly';
import { CHROM_SIZE_HG38 } from './chrom-size';

describe('Assembly', () => {
    it('Missing chromosome name', () => {
        expect(computeChromSizes().total).toBeDefined();
    });
    it('hg38 ChromSizes', () => {
        expect(computeChromSizes('hg38').size).toEqual(CHROM_SIZE_HG38);
    });
    it('Custom ChromSizes', () => {
        expect(
            computeChromSizes([
                ['foo', 100],
                ['bar', 1000]
            ]).total
        ).toEqual(1100);
        // use default assembly instead when the size is zero
        expect(computeChromSizes([]).total).toEqual(computeChromSizes().total);
    });
    it('Chromosome total size calculation', () => {
        expect(getChromTotalSize({ 1: 1, 2: 999 })).toEqual(1000);
    });
    it('Chromosome interval calculation', () => {
        expect(getChromInterval({ 1: 111, 2: 222 })).toEqual({ 1: [0, 111], 2: [111, 333] });
    });
    it('Absolute to relative genomic position', () => {
        expect(getRelativeGenomicPosition(CHROM_SIZE_HG38.chr1 + 1, 'hg38')).toEqual({
            chromosome: 'chr2',
            position: 1
        });
        const outOfPos = computeChromSizes('hg38').total + 1;
        expect(getRelativeGenomicPosition(outOfPos, 'hg38')).toEqual({
            chromosome: 'unknown',
            position: outOfPos
        });
        expect(getRelativeGenomicPosition(outOfPos, 'hg38', true)).toMatchInlineSnapshot(`
          {
            "chromosome": "chrY",
            "position": 3088269832,
          }
        `);
        expect(getRelativeGenomicPosition(-1, 'hg38', true)).toMatchInlineSnapshot(`
          {
            "chromosome": "chr1",
            "position": 0,
          }
        `);
    });
    it('Parse string to genomic positions', () => {
        const customChromSizes: Assembly = [
            ['foo', 10],
            ['bar', 20],
            ['barz', 30]
        ];
        const padding = 10;

        // edge cases
        expect(() => GenomicPositionHelper.fromString('random-string').toAbsoluteCoordinates()).toThrow(); // not existing chromosome names
        expect(GenomicPositionHelper.fromString('bar:12').toAbsoluteCoordinates(customChromSizes)).toEqual([11, 30]); // only start position
        expect(GenomicPositionHelper.fromString('foo:100-200').toAbsoluteCoordinates(customChromSizes)).toEqual([
            100, 200
        ]); // out of range

        // single chromosome
        expect(GenomicPositionHelper.fromString('foo').toAbsoluteCoordinates(customChromSizes)).toEqual([1, 10]);
        expect(GenomicPositionHelper.fromString('foo:1-2').toAbsoluteCoordinates(customChromSizes)).toEqual([1, 2]);
        expect(GenomicPositionHelper.fromString('foo').toAbsoluteCoordinates(customChromSizes, padding)).toEqual([
            1 - padding,
            10 + padding
        ]); // padding
    });
});
