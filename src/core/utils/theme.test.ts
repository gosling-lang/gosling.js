import { getTheme } from './theme';
import { ThemeDeep } from '../gosling.schema';

describe('Theme', () => {
    it('Defualt Themes', () => {
        expect(getTheme().base).toEqual('light');
        expect(getTheme().titleColor).toEqual('black');
    });
    it('Predefined Themes', () => {
        expect(getTheme('dark').base).toEqual('dark');
        expect(getTheme('dark').titleColor).toEqual('white');
    });
    it('Overriding Themes', () => {
        const custom: ThemeDeep = {
            base: 'dark',
            titleColor: 'yellow'
        };
        expect(getTheme('dark').titleColor).not.toEqual(getTheme(custom).titleColor);
        expect(getTheme(custom).titleColor).toEqual('yellow');
    });
});
