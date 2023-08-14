import { isArray } from 'lodash';
import type { AltGoslingSpec, AltTrack } from './alt-gosling-schema';
import { attributeExists, attributeExistsReturn, attributeExistsAndChildHasValue, arrayToString } from './util';

export function addDescriptions(altGoslingSpec: AltGoslingSpec) {
    addTrackPositionDescriptions(altGoslingSpec);
    addTrackAppearanceDescriptions(altGoslingSpec);
    addTrackDataDescriptions(altGoslingSpec);
    addGlobalDescription(altGoslingSpec);
}




function addTrackPositionDescriptions(altGoslingSpec: AltGoslingSpec) {
    if (altGoslingSpec.composition.nTracks == 1) {
        altGoslingSpec.tracks[0].position.description = 'This is the only track.'
        altGoslingSpec.composition.description = 'There is one (' + altGoslingSpec.tracks[0].appearance.details.layout + ') track.'
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
            if (trackPosition.rowNumber === 1) {
                descTrack = descTrack.concat('top row');
            } else if (trackPosition.rowNumber === counter.totalRows - 1) {
                descTrack = descTrack.concat('bottom row');
            } else if (trackPosition.rowNumber < 10) {
                descTrack = descTrack.concat(positionWords[trackPosition.rowNumber] + 'row');
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
    for (const i in altGoslingSpec.tracks) {
        const track = altGoslingSpec.tracks[i];
        addTrackAppearanceDescription(track);
    }
    
}


function addTrackAppearanceDescription(altTrack: AltTrack) {
    //altTrack.description = 'Nu echt iets.'
    const appearanceDet = altTrack.appearance.details;
    var desc = ''


    if (altTrack.type !== 'unknown') {
        trackAppearanceKnownType(altTrack);
    } else {
        trackAppearanceUnknownType(altTrack);
    }



    
}


function trackAppearanceKnownType(altTrack: AltTrack) {
    var desc = ''

    switch(altTrack.type) {
        case 'bar chart': {
    
            var binSize = 1;
            if (attributeExists(altTrack.appearance.details.encodings.encodingStatic, 'size')) {
                var size = attributeExistsReturn(altTrack.appearance.details.encodings.encodingStatic, 'size');
                binSize = size.value;
            } else {
                binSize = 1
            }
            desc = desc.concat('Bar chart.') 

            if (altTrack.appearance.details.layout == 'linear') {
                desc = desc.concat(' On the x-axis, the genome is shown. There are vertical bars, with a width of ', (binSize * 256).toString(), ' bp, which height corresponds to the expression on that section of the genome. ')
            } else {
                desc = desc.concat(' On the circular x-axis, the genome is shown. The height of the bars (pointing outwards of the circel), correspond to the expression on that section of the genome. The width of the bars is ', (binSize * 256).toString(), ' bp. ')
            }

            // // altTrack.appearance.details.encodings.encodingField // nominal field? 
            // for {let i in Object.keys(altTrack.appearance.details.encodings.encodingField)} {
            // }

            if (altTrack.data.details.dataStatistics?.categories) {
                desc = desc.concat(' There are ' + altTrack.data.details.dataStatistics?.categories.length + ' categories visible, spread ')
            }
            //categories
            //if ()

            break;
        }

        case 'line chart': {
            break;
        }

        case 'heat map': {
            break;
        }

        default: {
            // move unknowntype here?
        }

    }

    altTrack.description = desc;
}

function trackAppearanceUnknownType(altTrack: AltTrack) {
    var desc = ''

    desc = desc.concat('Visualization.')

    if (altTrack.title !== 'unknown') {
        //desc = desc.concat(' titled: ' + altTrack.title + '.');
    }

    var appearanceDet = altTrack.appearance.details;
   
    const encodingImportant = ['x', 'y', 'row', 'color']
    let _first = true;
    for (let encoding of encodingImportant) {
        if (attributeExists(appearanceDet.encodings.encodingField, encoding)) {
            let encodingObj = appearanceDet.encodings.encodingField[encoding];
            if (_first) {
                desc = desc.concat(' with ')
                _first = false;
            } else {
                desc = desc.concat(', ')
            }
            desc = desc.concat(encodingObj.type + ' ' + encoding + '-axis')
        }
    }

    if (attributeExistsAndChildHasValue(appearanceDet.encodings.encodingField, 'x', 'type', 'genomic') || (attributeExistsAndChildHasValue(appearanceDet.encodings.encodingField, 'y', 'type', 'genomic'))) {
        desc = desc.concat(',  with ' + appearanceDet.layout + ' genome,')
    }
        

    if (attributeExists(altTrack.data.details.data, 'binSize')) {
        desc = desc.concat(' Data is binned in intervals of ' + altTrack.data.details.data.binSize * 256 + ' bp.');
    }

    
    if (attributeExists(altTrack.data.details.data, 'categories')) {
        if (altTrack.data.details.data.categories.length === 1) {
            //desc = desc.concat(' The only category shown is ' + altTrack.data.details.data.categories[0] + '.');
        } else {
            desc = desc.concat(' The ' + altTrack.data.details.data.categories.length + ' different categories shown are: ' + altTrack.data.details.data.categories.slice(0, -1).join(', ') + ' and ' + altTrack.data.details.data.categories.slice(-1) + '.');
        }
    }

    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
        
    return desc;

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
        if (track.data.details.dataStatistics) {
            var desc = '';

            // genomic and expression ranges
            desc = desc.concat('The genomic range shown is from ' + track.data.details.dataStatistics?.genomicMin + ' to ' + track.data.details.dataStatistics?.genomicMax + ' basepairs.');
            desc = desc.concat(' The expression values range from ' + track.data.details.dataStatistics?.valueMin + ' to ' + track.data.details.dataStatistics?.valueMax + '.');
            
            // where on the genome are the minimum and maximum expression
            desc = desc.concat(addMinMaxDescription(track.data.details.dataStatistics?.valueMaxGenomic, 'maximum'));
            desc = desc.concat(addMinMaxDescription(track.data.details.dataStatistics?.valueMinGenomic, 'minimum'));
            
            // add category data information
            if (track.data.details.dataStatistics?.categories) {

                // number of categories
                desc = desc.concat(' There are ' + track.data.details.dataStatistics?.categories.length + ' samples.');

                // which category has the highest expression peak
                if (track.data.details.dataStatistics?.highestCategory.length === 1) {
                    desc = desc.concat(' The highest value is observed in sample ' + track.data.details.dataStatistics?.highestCategory[0] + '.');
                } else {
                    desc = desc.concat(' The highest value is observed in samples ' + arrayToString(track.data.details.dataStatistics?.highestCategory) + '.');
                }
                     
                // Are genomic positions are the same for the min and max values of each category
                // todo

            }
            altGoslingSpec.tracks[i].data.description = desc;
        }
    }

    // retrieve global information somehow
}


function addGlobalDescription(altGoslingSpec: AltGoslingSpec) {

    if (altGoslingSpec.composition.nTracks == 1) {
        altGoslingSpec.longDescription = altGoslingSpec.tracks[0].description;
    }
    
}


// export function altSingleView(altSpec: GoslingSpecAlt) {
    
//     var altText = '';
    
//     var trackSingle = altSpec.structure[0];
//     if (attributeExists(trackSingle, 'specialDesc')) {
//         altText = altText.concat(trackSingle.specialDesc)
//     } else {
//         altText = altText.concat('Visualization')
//     }
//     const encodingImportant = ['x', 'y', 'row', 'color']
//     let _first = true;
//     for (let encoding of encodingImportant) {
//         if (attributeExists(trackSingle.encodingSeparated.encodingField, encoding)) {
//             let encodingObj = trackSingle.encodingSeparated.encodingField[encoding];
//             if (_first) {
//                 altText = altText.concat(' with ')
//                 _first = false;
//             } else {
//                 altText = altText.concat(', ')
//             }
//             altText = altText.concat(encodingObj.type + ' ' + encoding + '-axis')
//         }
//     }

//     if (attributeExistsAndChildHasValue(trackSingle.encodingSeparated.encodingField, 'x', 'type', 'genomic') || (attributeExistsAndChildHasValue(trackSingle.encodingSeparated.encodingField, 'y', 'type', 'genomic'))) {
//         altText = altText.concat(',  with ' + trackSingle.layout + ' genome,')
//     }
      

//     altText = altText.concat(' titled: ' + altSpec.title + '.');

//     if (attributeExists(trackSingle.data, 'binSize')) {
//         altText = altText.concat(' Data is binned in intervals of ' + trackSingle.data.binSize * 256 + ' bp.');
//     }

    
//     if (attributeExists(trackSingle.data, 'categories')) {
//         if (trackSingle.data.categories.length === 1) {
//             altText = altText.concat(' The only category shown is ' + trackSingle.data.categories[0] + '.');
//         } else {
//             altText = altText.concat(' The ' + trackSingle.data.categories.length + ' different categories shown are: ' + trackSingle.data.categories.slice(0, -1).join(', ') + ' and ' + trackSingle.data.categories.slice(-1) + '.');
//         }
//     }

//     altText = altText.charAt(0).toUpperCase() + altText.slice(1);
        
//     return altText;

// }