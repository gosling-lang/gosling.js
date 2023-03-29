import { type ThemeDeep, getTheme } from './theme';

describe('Theme', () => {
    it('Defualt Themes', () => {
        expect(getTheme().base).toEqual('light');
        expect(getTheme().root.titleColor).toEqual('black');
    });
    it('Predefined Themes', () => {
        expect(getTheme('dark').base).toEqual('dark');
        expect(getTheme('dark').root.titleColor).toEqual('white');
    });
    it('Overriding Themes', () => {
        const custom: ThemeDeep = {
            base: 'dark',
            root: { titleColor: 'yellow' }
        };
        expect(getTheme('dark').root.titleColor).not.toEqual(getTheme(custom).root.titleColor);
        expect(getTheme(custom).root.titleColor).toEqual('yellow');
    });
});
