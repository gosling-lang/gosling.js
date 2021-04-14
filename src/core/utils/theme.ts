import { Theme } from '../gosling.schema';

export function getThemeColors(theme: Theme = 'light') {
    return {
        main: theme === 'light' ? 'black' : 'white',
        sub: theme === 'dark' ? 'lightgray' : 'gray'
    };
}
