import type { AltGoslingSpec, AltTrackSingle,AltTrack, AltTrackOverlaid, AltTrackOverlaidByMark, AltTrackOverlaidByData } from './alt-gosling-schema';
import { attributeExists, attributeExistsReturn, attributeExistsAndChildHasValue, arrayToString, markToText, channelToText, capDesc } from './util';
import { IsChannelValue, IsChannelDeep } from '@gosling-lang/gosling-schema';
// import { SUPPORTED_CHANNELS } from './../core/mark/index';


export function addDescriptions(altGoslingSpec: AltGoslingSpec) {
    addTrackPositionDescriptions(altGoslingSpec);
    addTrackAppearanceDescriptions(altGoslingSpec);
    addTrackDataDescriptions(altGoslingSpec);
    addGlobalDescription(altGoslingSpec);
}




function addTrackPositionDescriptions(altGoslingSpec: AltGoslingSpec) {
    if (altGoslingSpec.composition.nTracks == 1) {
        altGoslingSpec.tracks[0].position.description = 'This is the only track.';
        if (altGoslingSpec.tracks[0].alttype === 'single') {
            altGoslingSpec.composition.description = 'There is one (' + altGoslingSpec.tracks[0].appearance.details.layout + ') track.';
        } else {
            altGoslingSpec.composition.description = 'There is one (overlaid) track.';
        }
    } else if (altGoslingSpec.composition.nTracks == 2) {
        addTrackPositionDescriptionsTwo(altGoslingSpec);      
    } else {
        addTrackPositionDescriptionsMulti(altGoslingSpec);
    }
}


function addTrackPositionDescriptionsTwo(altGoslingSpec: AltGoslingSpec) {
    let firstPlace = '';
    let secondPlace = '';
    let desc = '';

    if (altGoslingSpec.tracks[0].appearance.details.layout === 'circular' && altGoslingSpec.tracks[1].appearance.details.layout === 'circular') {
        
        switch(altGoslingSpec.composition.parentValues.arrangement) {
            case 'serial': 
                firstPlace = 'left half of ring';
                secondPlace = 'right half of ring';
                desc = 'Two circular tracks form one ring, with both the half of the ring.'
                break;
            case 'parallel': 
                firstPlace = 'outer ring';
                secondPlace = 'inner ring';
                desc = 'Two circular tracks form two rings, one around the other.'
            case 'horizontal':
                firstPlace = 'left';
                secondPlace = 'right';
                desc = 'Two circular tracks are shown next to each other.'
                break;
            default: 
                firstPlace = 'top';
                secondPlace = 'bottom';
                desc = 'Two circular tracks are shown below each other.'
        }
    } else {
        const bothLinear = altGoslingSpec.tracks[0].appearance.details.layout === altGoslingSpec.tracks[1].appearance.details.layout;
        switch(altGoslingSpec.composition.parentValues.arrangement) {
            case 'serial' || 'horizontal': 
                firstPlace = 'left';
                secondPlace = 'right';
                desc = ' are shown next to each other.'
            default: 
                firstPlace = 'top';
                secondPlace = 'bottom';
                desc = 'are shown below each other.'
        }
        if (bothLinear) {
            desc = ''.concat('Two linear tracks ', desc);
        } else {
            desc = ''.concat('One linear and one circular track ', desc);
        }
    }
    altGoslingSpec.tracks[0].position.description = 'This track is shown on the ' + firstPlace + '.';
    altGoslingSpec.tracks[1].position.description = 'This track is shown on the ' + secondPlace + '.';
    altGoslingSpec.composition.description = desc;
}


function addTrackPositionDescriptionsMulti(altGoslingSpec: AltGoslingSpec) {
    const positionWords = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];

    let desc = ''
    if (altGoslingSpec.composition.counter.totalRows === 1) {
        // all horizontal
        desc = desc.concat('There are ' + (altGoslingSpec.composition.counter.nTracks) + ' tracks, displayed next to each other.')

    } else if (altGoslingSpec.composition.counter.totalCols === 1) {
        // all vertical
        desc = desc.concat('There are ' + (altGoslingSpec.composition.counter.nTracks) + ' tracks, displayed below each other.')
    }

    else {
        desc = desc.concat('There are ' + (altGoslingSpec.composition.counter.nTracks) + ' tracks.')
        desc = desc.concat(' There are ' + (altGoslingSpec.composition.counter.totalRows) + ' rows.');

        const rowLengths = Object.keys(altGoslingSpec.composition.counter.matrix).map(t => Object.keys(altGoslingSpec.composition.counter.matrix[t as unknown as number]).length);
        const rowLengthsUnique = [...new Set(rowLengths)];
   
        if (rowLengthsUnique.length == 1) {
            desc = desc.concat(' Each row has ' + rowLengthsUnique[0] + ' tracks next to each other');
        } else if (rowLengthsUnique.length == 2) {
            let rowsWithFirstLength = [] as number[];
            let rowsWithSecondLength = [] as number[];
            for(let i = 0; i < rowLengths.length; i++) {
                if (rowLengths[i] === rowLengthsUnique[0]) {
                    rowsWithFirstLength.push(i);
                } else {
                    rowsWithSecondLength.push(i);
                }  
            }
            if (0 in rowsWithFirstLength) {
                desc = desc.concat(' Row(s) ' + arrayToString(rowsWithFirstLength.map(t => t+1)) + ' have ' + rowLengthsUnique[0] + ' column(s) each.');
                desc = desc.concat(' The other rows have ' + rowLengthsUnique[1] + ' column(s) each.');
            } else {
                desc = desc.concat(' Row(s) ' + arrayToString(rowsWithSecondLength.map(t => t+1)) + ' have ' + rowLengthsUnique[1] + ' column(s) each.');
                desc = desc.concat(' The other rows have ' + rowLengthsUnique[0] + ' column(s) each.');
            }
        }
        else {
            for (let i = 0; i < altGoslingSpec.composition.counter.totalRows; i++) {
                if (i > 9) {
                    desc = desc.concat(' Row number ' + i + ' has ' + altGoslingSpec.composition.counter.matrix[i].length + ' track(s) next to each other.')
                } else {
                    desc = desc.concat(' The ' + positionWords[i] + ' row has ' + altGoslingSpec.composition.counter.matrix[i].length + ' track(s) next to each other.')
                }
            }
        }
    }

    // add the description to altGoslingSpec
    altGoslingSpec.composition.description = desc;

    // if only 1 row / 1 column, dont do this
    for (const i in altGoslingSpec.tracks) {
        let descTrack = '';
        const trackPosition = altGoslingSpec.tracks[i].position.details;
        let counter = altGoslingSpec.composition.counter;

        // indication of row is only useful if there is more than 1 row
        if (altGoslingSpec.composition.counter.totalRows > 1) {
            if (trackPosition.rowNumber === 0) {
                descTrack = descTrack.concat('top row');
            } else if (trackPosition.rowNumber === counter.totalRows - 1) {
                descTrack = descTrack.concat('bottom row');
            } else if (trackPosition.rowNumber < 10) {
                descTrack = descTrack.concat(positionWords[trackPosition.rowNumber] + ' row');
            } else {
                descTrack = descTrack.concat('row ' + trackPosition.rowNumber + 1);
            }
        }
        // indication of column is only useful if there is more than 1 row
        if (altGoslingSpec.composition.counter.totalCols > 1) {
            if (descTrack.length > 1) {
                descTrack = descTrack.concat(', ');
            }
            if (counter.matrix[trackPosition.rowNumber].length > 1) {
                if (trackPosition.colNumber === 1) {
                    descTrack = descTrack.concat('left');
                } else if (trackPosition.colNumber === counter.matrix[trackPosition.rowNumber].length) {
                    descTrack = descTrack.concat('right');
                } else if (trackPosition.colNumber === 1 && counter.matrix[trackPosition.rowNumber].length === 3) {
                    descTrack = descTrack.concat('middle');
                } else {
                    descTrack = descTrack.concat(positionWords[trackPosition.colNumber] + ' from left');
                }
            }
        }
        altGoslingSpec.tracks[i].position.description = descTrack;
    }
}




function addTrackAppearanceDescriptions(altGoslingSpec: AltGoslingSpec) {
    //console.log('hereee')
    for (const i in altGoslingSpec.tracks) {
        const track = altGoslingSpec.tracks[i];
        //console.log('track', track)

        if (track.alttype === 'single') {
            //console.log('here')
            var desc = ''

            if (track.charttype) {
                desc = desc.concat(capDesc(track.charttype));
            } else {
                desc = desc.concat('Chart with ' + markToText.get(track.appearance.details.mark) + '.');
            }
    
            let encodingDescriptions = addEncodingDescriptions(track);
            console.log('encdesc', encodingDescriptions);

            desc = desc.concat(' ' + encodingDescriptions.desc);
        
            track.appearance.description = desc;
            track.appearance.details.encodingsDescList = encodingDescriptions.descList;
        } else if (track.alttype === 'ov-mark') {
            track.appearance.details.encodingsDescList = [[]]
        } else {

        }
    }   
}


function addEncodingDescriptions(track: AltTrackSingle) {
    const mark = track.appearance.details.mark as string;
    
    var descGenomic = '';
    var descQuantitative = '';
    var descNominal = '';
    var descValue = '';

    var descList = [] as string[][];

    // genomic encodings
    let genomicEncodingsI = track.appearance.details.encodings.encodingDeepGenomic.map(o => o.name);
    if (genomicEncodingsI.includes('x') && genomicEncodingsI.includes('y')) {
        descGenomic = descGenomic.concat('The genome is shown on both the x- and y-axes.')
        if (genomicEncodingsI.includes('xe') && genomicEncodingsI.includes('ye')) {
            descGenomic = descGenomic.concat(' Each displays genomic intervals.')
            descList.push(['x', 'The x-axis show genomic intervals.'])
            descList.push(['y', 'The y-axis show genomic intervals.'])
        } else if (genomicEncodingsI.includes('xe')) {
            descGenomic = descGenomic.concat(' The genome on the x-axis displays genomic intervals.')
            descList.push(['x', 'The x-axis show genomic intervals.'])
            descList.push(['y', 'The y-axis shows the genome.'])

        } else if (genomicEncodingsI.includes('ye')) {
            descGenomic = descGenomic.concat(' The genome on the y-axis displays genomic intervals.')
            descList.push(['x', 'The x-axis shows the genome.'])
            descList.push(['y', 'The y-axis show genomic intervals.'])
        } else {
            descList.push(['x', 'The x-axis shows the genome.'])
            descList.push(['y', 'The y-axis shows the genome.'])
        }
    } else {
        if (genomicEncodingsI.includes('x')) {
            let add = ''
            if (genomicEncodingsI.includes('xe')) {
                add = 'in intervals'
                descList.push(['x', 'The x-axis show genomic intervals.'])
            } else {
                descList.push(['x', 'The x-axis shows the genome.'])
            }
            descGenomic = descGenomic.concat('The genome is shown ' + add + ' on the x-axis.')
        }

        if (genomicEncodingsI.includes('y')) {
            let add = ''
            if (genomicEncodingsI.includes('ye')) {
                add = 'in intervals'
                descList.push(['y', 'The y-axis show genomic intervals.'])
            } else {
                descList.push(['y', 'The y-axis shows the genome.'])
            }
            descGenomic = descGenomic.concat('The genome is shown ' + add + ' on the y-axis.')
        }
    }
    // if (attributeExists(track.data.details.data, 'binSize')) {
    //     let bin = attributeExistsReturn(track.data.details.data, 'binSize') * 256;
    //     if (typeof bin === 'number') {
    //         descGenomic = descGenomic.concat(' Data is binned in intervals of ' +  + ' basepairs.');
    //     }
    // }

    // expression encodings
    let quantitativeEncodingsI = track.appearance.details.encodings.encodingDeepQuantitative.map(o => o.name);

    if (quantitativeEncodingsI.length > 1) {
        descQuantitative = descQuantitative.concat('The expression values are shown with ' + markToText.get(mark) + ' on the ' + arrayToString(quantitativeEncodingsI) + '-axes.');
        for (let q of quantitativeEncodingsI) {
            descList.push([q, 'The ' + q + ' of the ' + markToText.get(mark) + ' shows the expression values.'])
        }
    } else if (quantitativeEncodingsI.length === 1) {
        if (quantitativeEncodingsI.includes('y')) {
            descQuantitative = descQuantitative.concat('The expression is shown on the y-axis with ' + markToText.get(mark) + '.');
            descList.push(['y', 'The y-axis shows the expression with' + markToText.get(mark) + '.'])
        }
        else if (quantitativeEncodingsI.includes('color')) {
            descQuantitative = descQuantitative.concat('The height of the expression values is shown with color.');
            descList.push(['color', 'The color of the ' + markToText.get(mark) + ' shows the expression values.'])
        }
        else {
            descQuantitative = descQuantitative.concat('The height of the expression values is shown with the ' + quantitativeEncodingsI[0] + '-axis.');
            descList.push([channelToText.get(quantitativeEncodingsI[0]) as string, 'The ' + channelToText.get(quantitativeEncodingsI[0]) + ' of the ' + markToText.get(mark) + ' shows the expression values.'])
        }
    }

    // nominal encodings
    let nominalEncodingsI = track.appearance.details.encodings.encodingDeepNominal.map(o => o.name);

    if (nominalEncodingsI.length > 1) {
        if (nominalEncodingsI.includes('row')) {
            descNominal = descNominal.concat('The chart is stratified by rows for the categories.');
            let nominalEncodingsINames = nominalEncodingsI.filter(e => e !== 'row').map(e => channelToText.get(e)) as string[];
            descNominal = descNominal.concat(' The categories are also shown with the ' + arrayToString(nominalEncodingsINames) + ' of the ' + markToText.get(mark) + '.');
            descList.push(['row', 'The chart is stratified by rows for the categories.']);
            for (let q of nominalEncodingsINames) {
                descList.push([channelToText.get(q) as string, 'The ' + q + ' of the ' + markToText.get(mark) + ' show the different categories.']);
            }
        }
        else {
            let nominalEncodingsINames = nominalEncodingsI.map(e => channelToText.get(e)) as string[];
            descNominal = descNominal.concat('The categories are shown with the ' + arrayToString(nominalEncodingsINames) + ' of the ' + markToText.get(mark) + '.');
            for (let q of nominalEncodingsI) {
                descList.push([channelToText.get(q) as string, 'The ' + q + ' of the ' + markToText.get(mark) + ' show the different categories.']);
            }
        }
    }
    else {
        if (nominalEncodingsI.includes('row')) {
            descNominal = descNominal.concat('The chart is stratified by rows for the categories.');
            descList.push(['row', 'The chart is stratified by rows for the categories.']);
        }
        else {
            descNominal = descNominal.concat('The ' + channelToText.get(nominalEncodingsI[0]) + ' of the ' + markToText.get(mark) + ' indicates the different categories.');
            descList.push([channelToText.get(nominalEncodingsI[0]) as string, 'The ' + channelToText.get(nominalEncodingsI[0]) + ' of the ' + markToText.get(mark) + ' show the different categories.']);
        }
    }

    // value encodings
    for (let i = 0; i < track.appearance.details.encodings.encodingValue.length; i++) {
        const e = track.appearance.details.encodings.encodingValue[i];
        if (e.name === 'color') {
            descValue = descValue.concat('The color of the ' + markToText.get(mark) + ' is ' + e.details.value + '.');
            descList.push(['color', 'The color of the ' + markToText.get(mark) + ' is ' + e.details.value + '.']);
        }
    }

    const desc = ''.concat(descGenomic + ' ' + descQuantitative + ' ' + descNominal + ' ' + descValue);

    return {desc: desc, descList: descList};
}


// used in addTrackDataDescriptions
function addMinMaxDescription(values: number[], key: 'minimum' | 'maximum') {
    var descMinMax = ''
    if (values.length === 1 ) {
        descMinMax = descMinMax.concat(' The ' + key + ' expression is shown at genomic position ' + values[0] + ' bp.');
    } else if (values.length < 6 ) {
        descMinMax = descMinMax.concat( ' The ' + key + ' expression is shown at genomic positions ' + arrayToString(values) + ' bp.')
    } else {
        descMinMax = descMinMax.concat( ' The ' + key + ' expression is shown at ' + values.length + ' genomic positions.')
    }
    return descMinMax;
}

function addTrackDataDescriptions(altGoslingSpec: AltGoslingSpec) {
    for (const i in altGoslingSpec.tracks) {
        const track = altGoslingSpec.tracks[i];
        addTrackDataDescriptionsTrack(track);
    }
}

export function addTrackDataDescriptionsTrack(track: AltTrack) {
    if (track.alttype === 'single' || track.alttype === 'ov-mark') {
        if (track.data.details.dataStatistics) {
            var desc = '';

            // genomic and expression ranges
            if (track.data.details.dataStatistics?.genomicMin && track.data.details.dataStatistics?.genomicMax) {
                desc = desc.concat('The genomic range shown is from ' + track.data.details.dataStatistics?.genomicMin + ' to ' + track.data.details.dataStatistics?.genomicMax + ' basepairs.');
            }
            if (track.data.details.dataStatistics?.valueMin && track.data.details.dataStatistics?.valueMax) {
                desc = desc.concat(' The expression values range from ' + track.data.details.dataStatistics?.valueMin + ' to ' + track.data.details.dataStatistics?.valueMax + '.');
            }
            
            // where on the genome are the minimum and maximum expression
            if (track.data.details.dataStatistics?.valueMaxGenomic && track.data.details.dataStatistics?.valueMinGenomic) {
                desc = desc.concat(addMinMaxDescription(track.data.details.dataStatistics?.valueMaxGenomic, 'maximum'));
                desc = desc.concat(addMinMaxDescription(track.data.details.dataStatistics?.valueMinGenomic, 'minimum'));
            }
           
            // add category data information
            if (track.data.details.dataStatistics?.categories) {

                // number of categories
                desc = desc.concat(' There are ' + track.data.details.dataStatistics?.categories.length + ' categories.');

                // which category has the highest expression peak
                if (track.data.details.dataStatistics?.highestCategory) {
                    if (track.data.details.dataStatistics?.highestCategory.length === 1) {
                        desc = desc.concat(' The highest value is observed in sample ' + track.data.details.dataStatistics?.highestCategory[0] + '.');
                    } else {
                        desc = desc.concat(' The highest value is observed in samples ' + arrayToString(track.data.details.dataStatistics?.highestCategory) + '.');
                    }
                }    
                // See if genomic positions are the same for the min and max values of each category
            }
            track.data.description = desc;
        }
    }
}


function addGlobalDescription(altGoslingSpec: AltGoslingSpec) {

    let includePosition = true;
    if (altGoslingSpec.composition.nTracks === 1) {
        includePosition = false;
        for (const t of altGoslingSpec.tracks) {
            if (t.alttype === 'single' || t.alttype === 'ov-mark') {  
                if (includePosition) {
                    t.description = t.position.description;
                }
                t.description = t.description.concat(' ' + t.appearance.description + ' ' + t.data.description);
            } else {
                if (includePosition) {
                    t.description = t.position.description;
                }
                t.description = t.description.concat(' Overlaid track with different data sources. See individual tracks for details.');
            }
        }
    }
    

    altGoslingSpec.alt = 'Gosling visualization.';

    if (altGoslingSpec.composition.nTracks === 1) {
        altGoslingSpec.longDescription = altGoslingSpec.tracks[0].description;
    } else if (altGoslingSpec.composition.nTracks === 2) {
        var desc = '';
        desc = desc.concat('Figure with two charts.');
        altGoslingSpec.longDescription = desc;
    } else {
        var desc = '';
        desc = desc.concat('Figure with ' + altGoslingSpec.composition.nTracks + ' individual charts.');
        altGoslingSpec.longDescription = desc;
    }

    
    
}