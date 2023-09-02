import { DEFAULT_BACKUP_COLOR } from '../../compiler/defaults';
import colorToHex from './color-to-hex';

describe('Color-To-Hex', () => {
    it('Random string should return a default color w/o errors', () => {
        expect(colorToHex('random')).toEqual(colorToHex(DEFAULT_BACKUP_COLOR));
    });
});
