const NOMINAL_COLOR = ['#ED7D31', '#4472C4', '#FFC207', '#76AE4F', '#9E480E', '#A5A5A5', '#4472C4', '#264378', '#76AE4F','#5B9CD5' /*'#000000'*/];

const ExcelThemeMarkCommonStyle = {
    color: NOMINAL_COLOR[0],
    size: 1,
    stroke: '#5A5A5A',
    strokeWidth: 0,
    opacity: 1,
    nominalColorRange: NOMINAL_COLOR,
    quantitativeSizeRange: [2, 6]
};

export const excel = {
    base: 'excel',

    root: {
        background: 'white',
        titleColor: '#5A5A5A',
        titleFontSize:30,
        titleFontFamily:'Calibri',
        titleAlign:'middle',
        titleFontWeight:'bold',
        titleBackgroundColor:'white',
        subtitleColor: '#5A5A5A',
        subtitleFontSize:22,
        subtitleFontFamily:'Calibri',
        subtitleAlign:'middle',
        subtitleFontWeight:'bold',
        subtitleBackgroundColor:'white',
        showMousePosition: true,
        mousePositionColor: '#000000'
    },

    track: {
        background:'white',
        alternatingBackground:'#f5f5f5',
        titleColor: '#5A5A5A',
        titleBackground: 'white',
        //titleFontSize:'',
        //titleAlign:'',
        outline: '#5A5A5A',
        outlineWidth: 1
    },

    legend: {
        position:'right',
        tickColor: '#5A5A5A',
        labelColor: '#5A5A5A',
        labelFontSize: 12,
        labelFontWeight: 'bold',
        labelFontFamily: 'Calibri',
        background: 'white',
        backgroundOpacity: 0.7,
        backgroundStroke: '#5A5A5A',
        
    },

    axis: {
        tickColor: '#5A5A5A',
        labelColor: '#5A5A5A',
        //labelFontSize: '',
        //labelFontWeight: '',
        labelFontFamily: 'Calibri',
        baselineColor: '#5A5A5A',
        gridColor: '#5A5A5A',
        gridStrokeWidth: 1,
        //gridStrokeType: '',
        //gridStrokeDash: 

    },

    markCommon: {
        ...ExcelThemeMarkCommonStyle
    },
    point: {
        ...ExcelThemeMarkCommonStyle,
        size: 3
    },
    rect: {
        ...ExcelThemeMarkCommonStyle
    },
    triangle: {
        ...ExcelThemeMarkCommonStyle
    },
    area: {
        ...ExcelThemeMarkCommonStyle
    },
    line: {
        ...ExcelThemeMarkCommonStyle
    },
    bar: {
        ...ExcelThemeMarkCommonStyle
    },
    rule: {
        ...ExcelThemeMarkCommonStyle,
        strokeWidth: 1
    },
    link: {
        ...ExcelThemeMarkCommonStyle,
        strokeWidth: 1
    },
    text: {
        ...ExcelThemeMarkCommonStyle,
        textAnchor: 'middle',
        textFontWeight: 'normal'
    },
    brush: {
        ...ExcelThemeMarkCommonStyle,
        color: '#5A5A5A',
        opacity: 0.3,
        stroke: '#5A5A5A',
        strokeWidth: 1
    }
}
