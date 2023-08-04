import type { AltGoslingSpec, AltTrack } from "./alt-gosling-schema";

export function addDescriptions(altGoslingSpec: AltGoslingSpec) {
    addTrackPositionDescriptions(altGoslingSpec);
    addTrackAppearanceDescriptions(altGoslingSpec);
    addTrackDataDescriptions(altGoslingSpec);
    addGlobalPositionDescriptions(altGoslingSpec);
    addGlobalDescription(altGoslingSpec);
}


export function addTrackPositionDescriptions(altGoslingSpec: AltGoslingSpec) {
    if (altGoslingSpec.composition.nTracks == 1) {
        altGoslingSpec.tracks[0].position.description = 'This is the only track.'
    }
}

export function addTrackAppearanceDescriptions(altGoslingSpec: AltGoslingSpec) {
    for (const i in altGoslingSpec.tracks) {
        var track = altGoslingSpec.tracks[i];
        addTrackAppearanceDescription(track);
    }
    
}

export function addTrackAppearanceDescription(altTrack: AltTrack) {
    altTrack.description = "Nu echt iets."
}


export function addTrackDataDescriptions(altGoslingSpec: AltGoslingSpec) {

}

export function addGlobalPositionDescriptions(altGoslingSpec: AltGoslingSpec) {

}

export function addGlobalDescription(altGoslingSpec: AltGoslingSpec) {
    altGoslingSpec.longDescription = 'fun'
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
//         altText = altText.concat(" Data is binned in intervals of " + trackSingle.data.binSize * 256 + " bp.");
//     }

    
//     if (attributeExists(trackSingle.data, 'categories')) {
//         if (trackSingle.data.categories.length === 1) {
//             altText = altText.concat(" The only category shown is " + trackSingle.data.categories[0] + ".");
//         } else {
//             altText = altText.concat(" The " + trackSingle.data.categories.length + " different categories shown are: " + trackSingle.data.categories.slice(0, -1).join(", ") + " and " + trackSingle.data.categories.slice(-1) + ".");
//         }
//     }

//     altText = altText.charAt(0).toUpperCase() + altText.slice(1);
        
//     return altText;

// }