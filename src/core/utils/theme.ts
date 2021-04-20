import { assign } from 'lodash';
import { CHANNEL_DEFAULTS } from '../channel';
import { Theme, ThemeDeep, Themes } from '../gosling.schema';

export function getTheme(theme: Theme = 'light'): Required<ThemeDeep> {
    if (theme === 'dark' || theme === 'light') {
        return THEMES[theme];
    } else {
        return assign(JSON.parse(JSON.stringify(THEMES[theme.base])), JSON.parse(JSON.stringify(theme)));
    }
}

/* ----------------------------- THEME PRESETS ----------------------------- */
export const THEMES: { [key in Themes]: Required<ThemeDeep> } = {
    light: {
        base: 'light',

        backgroundColor: 'white',
        titleColor: 'black',
        subtitleColor: 'gray',

        trackOutlineColor: 'gray',
        trackOutlineWidth: 1,
        axisColor: 'black',

        markColor: CHANNEL_DEFAULTS.NOMINAL_COLOR[0],
        nominalColors: CHANNEL_DEFAULTS.NOMINAL_COLOR,
        useExtendedNominalColors: false,
        nominalColorsExtended: CHANNEL_DEFAULTS.NOMINAL_COLOR_EXTENDED,
        markStrokeColor: 'black',
        markStrokeWidth: 0,
        markOpacity: 1,

        pointSize: 3,
        pointSizeRangeQuantitative: [2, 6],
        lineSize: 1,
        ruleStrokeWidth: 1,
        linkStrokeWidth: 1,
        brushColor: 'gray',
        brushStrokeColor: 'black',
        brushStrokeWidth: 1
    },
    dark: {
        base: 'dark',

        backgroundColor: 'black',
        titleColor: 'white',
        subtitleColor: 'lightgray',

        trackOutlineColor: 'lightgray',
        trackOutlineWidth: 1,
        axisColor: 'white',

        markColor: CHANNEL_DEFAULTS.NOMINAL_COLOR[0],
        nominalColors: CHANNEL_DEFAULTS.NOMINAL_COLOR,
        useExtendedNominalColors: false,
        nominalColorsExtended: CHANNEL_DEFAULTS.NOMINAL_COLOR_EXTENDED,
        markStrokeColor: 'white',
        markStrokeWidth: 0,
        markOpacity: 1,

        pointSize: 3,
        pointSizeRangeQuantitative: [2, 6],
        lineSize: 1,
        ruleStrokeWidth: 1,
        linkStrokeWidth: 1,
        brushColor: 'lightgray',
        brushStrokeColor: 'white',
        brushStrokeWidth: 1
    }
};
