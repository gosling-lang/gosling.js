import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';

import type { AltGoslingSpec, AltTrack, AltTrackOverlaidByData, AltTrackOverlaidByMark, AltTrackSingle } from 'src/alt-text/alt-gosling-schema';
import type { Datum } from '@gosling-lang/gosling-schema';
import { arrayToString } from './util';


export function createAltTree(data: AltGoslingSpec) {
    return createTreeMUI(data)
    // try {
    //     createTreeMUI(data)
    // } catch {
    //     return <></>
    // }
}


function createTreeMUI(data: AltGoslingSpec) {
    return (
        <TreeView
            className = 'tree-view'
            aria-label="Hierarchical tree describing displayed Gosling visualization."
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpanded={['root', 'tree']}
            defaultExpandIcon={<ChevronRightIcon />}
        >
            <TreeItem key='tree' nodeId='tree' label='Automatic description'>

                <TreeItem key={'alt'} nodeId={'alt'} label={'Alt-text'}>
                    <TreeItem key={'alt-desc'} nodeId={'alt-desc'} label={data.alt}></TreeItem>
                </TreeItem>

                <TreeItem key={'long'} nodeId={'long'} label={'Description'}>
                    <TreeItem key={'long-desc'} nodeId={'long-desc'} label={data.longDescription}></TreeItem>
                </TreeItem>
                
                <TreeItem key={'global-details'} nodeId={'global-details'} label={'Details'}>
        
                    {data.title ? (
                        <TreeItem key={'title'} nodeId={'title'} label={'Title'}>
                            <TreeItem key={'title-desc'} nodeId={'title-desc'} label={data.title}></TreeItem>
                        </TreeItem>
                    ): null}

                    {data.subtitle ? (
                        <TreeItem key={'subtitle'} nodeId={'titsubtitlele'} label={'Subtitle'}>
                            <TreeItem key={'subtitle-desc'} nodeId={'subtitle-desc'} label={data.subtitle}></TreeItem>
                        </TreeItem>
                    ): null}
                    
                    <TreeItem key={'composition'} nodeId={'composition'} label={'Composition'}>
                        <TreeItem key={'composition-desc'} nodeId={'composition-desc'} label={data.composition.description}></TreeItem>
                    </TreeItem>

                    <TreeItem key='tracks' nodeId='tracks' label={'Tracks'}>
                        {Object.keys(data.tracks).map(t => (createTreeTrackMUI(data.tracks[t as any])))}
                    </TreeItem>
                    
                </TreeItem>
            
            </TreeItem>
    
        </TreeView>
    );
}


// function createTreeTrackMUI(t: AltTrack) {
//     // if (t.alttype === 'ov-data') {
//     //     return createTreeTrackMUIOverlaidData(t);
//     // } else {
//     //     return createTreeTrackMUISingle(t);
//     // }
// }



function createTreeTrackMUI(t: AltTrack) {
    var uid = t.position.details.trackNumber as any as string;
    
    return (
        <TreeItem key={'T-'+uid} nodeId={'T-'+uid} label={'Track: '+ t.position.description}>
            {createTreeItemLeaf('T-'+uid+'-desc', 'Description', t.description, true)}
            <TreeItem key={'T-'+uid+'-details'} nodeId={'T-'+uid+'details'} label={'Details'}>  
                {createTreeTrackTitle(t, uid)}
                {createTreeTrackPosition(t, uid)}
                {createTreeTrackChartType(t, uid)}
                {createTreeTrackAppearance(t, uid)}
                {createTreeTrackDataStatistics(t, uid)}
            </TreeItem>
        </TreeItem>
    );
}

// function createTreeTrackMUIOverlaidData(t: AltTrackOverlaidByData) {
//     return (
//         <></>
//     )
// }



function createTreeTrackTitle(t: AltTrack, uid: string) {
    if (t.title) {
        return(
           <TreeItem key={'T-'+uid+'details-title'} nodeId={'T-'+uid+'details-title'} label={'Title: '+t.title}></TreeItem>
        )
    }
    // return(
    //     <>
    //         {t.title ? (
    //                 <TreeItem key={'T-'+uid+'details-title'} nodeId={'T-'+uid+'details-title'} label={'Title: '+t.title}></TreeItem>
    //             ): null}   
    //     </>
    // )
}

function createTreeTrackChartType(t: AltTrack, uid: string) {
    if (t.alttype === 'single') {
        return(
            <>
                {t.charttype ? (
                    <TreeItem key={'T-'+t.uid+'details-type'} nodeId={'T-'+t.uid+'details-type'} label={'Type: '+t.charttype}></TreeItem>
                ): null}
            </>
        )
    } else if (t.alttype === 'ov-mark') {
        return(
            <>
                {t.charttype ? (
                    <TreeItem key={'T-'+t.uid+'details-type'} nodeId={'T-'+t.uid+'details-type'} label={'Type: '+arrayToString(t.charttype)}></TreeItem>
                ): null}
            </>
        )
    } else {
        return (<></>)
    }
}

function createTreeTrackPosition(t: AltTrack, uid: string) {
    return(
        <TreeItem key={'T-'+uid+'-details-pos'} nodeId={'T-'+uid+'-details-pos'} label={'Position'}>
            {createTreeItemLeaf('T-'+uid+'-details-pos-desc', 'Description', t.position.description, true)}
            {createTreeItemLeaf('T-'+uid+'-details-pos-number', 'Track number', t.position.details.trackNumber, true)}
        </TreeItem>
    )
}



function createTreeTrackAppearance(t: AltTrack, uid: string) {
    if (t.alttype === 'single' || t.alttype === 'ov-mark') {
        return(
            <TreeItem key={'T-'+uid+'details-app'} nodeId={'T-'+uid+'details-app'} label={'Appearance'}>
                {createTreeItemLeaf('T-'+uid+'-details-app-desc', 'Description', t.appearance.description, true)}
                <TreeItem key={'T-'+uid+'-details-app-details'} nodeId={'T-'+uid+'-details-app-details'} label={'Details'}>
                    {t.alttype === 'ov-mark' ? (
                        createTreeItemLeaf('T-'+uid+'-details-pos-details-mark', 'Mark', arrayToString(t.appearance.details.mark), true)
                        ) : (createTreeItemLeaf('T-'+uid+'-details-pos-details-mark', 'Mark', t.appearance.details.mark, true))}
                    {t.appearance.details.encodingsDescList.map((enc) => createTreeItemLeaf('T-'+uid+'-details-pos-details-enc'+enc[0], enc[0], enc[1], true))}
                    
                    {createTreeItemLeaf('T-'+uid+'-details-pos-details-layout', 'Layout (linear or circular)', t.appearance.details.layout, false)} 
                    {createTreeItemLeaf('T-'+uid+'-details-pos-details-overlaid', 'Overlaid', t.appearance.details.overlaid, false)}   
                </TreeItem>
            </TreeItem>
        )
    } else {
        return <></>
    }
    
}

function createTreeTrackDataStatistics(t: AltTrack, uid: string) {
    if (t.alttype === 'single' || t.alttype === 'ov-mark') {
        return (
            (
                <TreeItem key={'T-'+uid+'details-data'} nodeId={'T-'+uid+'details-data'} label={'Data'}>
                    {createTreeItemLeaf('T-'+uid+'-details-data-desc', 'Description', t.data.description, true)}
                    <TreeItem key={'T-'+uid+'-details-data-details-stats'} nodeId={'T-'+uid+'-details-data-details-stats'} label={'Data statistics'}>
                        <TreeItem key={'T-'+uid+'-details-data-details-stats-genomic'} nodeId={'T-'+uid+'-details-data-details-stats-genomic'} label={'Genomic range'}>
                            {createTreeItemLeaf('T-'+uid+'-details-data-details-stats-genomic-min', 'Minimum', t.data.details.dataStatistics?.genomicMin, false)}    
                            {createTreeItemLeaf('T-'+uid+'-details-data-details-stats-genomic-max', 'Maximum', t.data.details.dataStatistics?.genomicMax, false)}
                        </TreeItem>
                        <TreeItem key={'T-'+uid+'-details-data-details-stats-value'} nodeId={'T-'+uid+'-details-data-details-stats-value'} label={'Value range'}>
                            <TreeItem key={'T-'+uid+'-details-data-details-stats-value-min'} nodeId={'T-'+uid+'-details-data-details-stats-value-min'} label={'Minimum: ' + t.data.details.dataStatistics?.valueMin}>
                                {createTreeItemLeaf('T-'+uid+'-details-data-details-stats-value-min-genomic', 'Found at position(s)', t.data.details.dataStatistics?.valueMinGenomic?.toString(), false)}    
                            </TreeItem>
                            <TreeItem key={'T-'+uid+'-details-data-details-stats-value-max'} nodeId={'T-'+uid+'-details-data-details-stats-value-max'} label={'Maxmimum: ' + t.data.details.dataStatistics?.valueMax}>
                                {createTreeItemLeaf('T-'+uid+'-details-data-details-stats-value-max-genomic', 'Found at position(s)', t.data.details.dataStatistics?.valueMaxGenomic?.toString(), false)}    
                            </TreeItem>
                        </TreeItem>

                        {t.data.details.dataStatistics?.categories ? (
                            <TreeItem key={'T-'+uid+'-details-data-details-stats-category'} nodeId={'T-'+uid+'-details-data-details-stats-category'} label={'Categories'}>
                                {createTreeItemLeaf('T-'+uid+'-details-data-details-stats-category-list', 'Categories', arrayToString(t.data.details.dataStatistics.categories), false)}    
                            </TreeItem>
                        ): null}
                    </TreeItem>
                    <TreeItem key={'T-'+uid+'-details-data-details-rawdata'} nodeId={'T-'+uid+'-details-data-details-rawdata'} label={'Raw data table'}>
                        {t.data.details.dataStatistics?.flatTileData ? (
                            <table>
                                <tbody>
                                    <tr>
                                        {Object.keys(
                                            (t.data.details.dataStatistics?.flatTileData[0])
                                        ).map((field: string, i: number) => (
                                            <th key={i}>{field}</th>
                                        ))}
                                    </tr>
                                    {t.data.details.dataStatistics?.flatTileData.map(
                                        (row: Datum, i: number) => (
                                            <tr key={i}>
                                                {Object.keys(row).map(
                                                    (field: string, j: number) => (
                                                        <td key={j}>
                                                            {row[field]?.toString()}
                                                        </td>
                                                    )
                                                )}
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                            
                        ): null}       
                    </TreeItem>
                </TreeItem>
            )
        )
    } else {
        return (<></>)
    }
}


function createTreeItemLeaf(id: string, label: string, item: string | number | boolean | undefined, showIfUndefined: boolean) {
    if (item) {
        item = item as string;
        return (
            <TreeItem key={id} nodeId={id} label={label + ': ' + item}></TreeItem>
        )
    } else {
        if (showIfUndefined) {
            return (
                <TreeItem key={id} nodeId={id} label={label + ': Information could not be retrieved.'}></TreeItem>
            )
        } else {
            return
        }
    }
}

// function createTreeTrackMUI(t: AltTrack) {
//     return (
//         <TreeItem key={t.uid} nodeId={t.uid} label={'Track: ' + t.uid}>
//             <TreeItem key={t.uid + 'desc'} nodeId={t.uid + 'desc'} label={'Description: ' + t.description}></TreeItem>
//             <TreeItem key={t.uid + 'details'} nodeId={t.uid + 'details'} label={'Details'}>     
//                 <TreeItem key={t.uid + 'details-pos'} nodeId={t.uid + 'details-pos'} label={'Position'}>
//                     <TreeItem key={t.uid + 'details-pos-desc'} nodeId={t.uid + 'details-pos-desc'} label={'Description: ' + t.position.description}></TreeItem>
//                     <TreeItem key={t.uid + 'details-pos-details'} nodeId={t.uid + 'details-pos-details'} label={'Details'}>
//                         <TreeItem key={t.uid + 'details-pos-details-colN'} nodeId={t.uid + 'details-pos-details-colN'} label={'Column number: ' + t.position.details.colNumber}></TreeItem>
//                         <TreeItem key={t.uid + 'details-pos-details-rowN'} nodeId={t.uid + 'details-pos-details-rowN'} label={'Row number: ' + t.position.details.rowNumber}></TreeItem>
//                     </TreeItem>
//                 </TreeItem>
//                 {t.title ? (
//                         <TreeItem key={t.uid + 'details-title'} nodeId={t.uid + 'details-title'} label={'Title: ' + t.title}></TreeItem>
//                     ): null}
//                 {t.alttype ? (
//                         <TreeItem key={t.uid + 'details-type'} nodeId={t.uid + 'details-type'} label={'Type: ' + t.alttype}></TreeItem>
//                     ): null}
//                 <TreeItem key={t.uid + 'details-app'} nodeId={t.uid + 'details-app'} label={'Appearance'}>
//                     <TreeItem key={t.uid + 'details-app-desc'} nodeId={t.uid + 'details-app-desc'} label={'Description: ' + t.appearance.description}></TreeItem>
//                     <TreeItem key={t.uid + 'details-app-details'} nodeId={t.uid + 'details-app-details'} label={'Details'}>
//                         <TreeItem key={t.uid + 'details-app-details-mark'} nodeId={t.uid + 'details-app-desc-mark'} label={'Mark: ' + t.appearance.details.mark}></TreeItem>
//                     </TreeItem>
//                 </TreeItem>
//                 <TreeItem key={t.uid + 'details-data'} nodeId={t.uid + 'details-data'} label={'Data'}>
//                     <TreeItem key={t.uid + 'details-data-desc'} nodeId={t.uid + 'details-data-desc'} label={'Description: ' + t.data.description}></TreeItem>
//                     <TreeItem key={t.uid + 'details-data-details'} nodeId={t.uid + 'details-data-details'} label={'Details'}>
//                         <TreeItem key={t.uid + 'details-data-details-stats'} nodeId={t.uid + 'details-app-desc-stats'} label={'Computed statistics'}>
//                             <TreeItem key={t.uid + 'details-data-details-stats-genomicrange'} nodeId={t.uid + 'details-app-desc-stats-genomicrange'} label={'Genomic range: ' + t.data.details.dataStatistics?.genomicMax}></TreeItem>
//                         </TreeItem>
//                     </TreeItem>
//                 </TreeItem>

//             </TreeItem>
//         </TreeItem>
//       );
// }

// function createTreeParent(data: any, id: string, label: string) {
//     return (
//         <TreeItem key={id} nodeId={id} label={label}>
//             <TreeItem key={id} nodeId={id} label={label}></TreeItem>
//             <TreeItem key={id} nodeId={id} label={label}></TreeItem>
//         </TreeItem>
//     )
//     //give name
//     //descr
//     //details
// }

// function createTreeItemDescription(id: string, desc: string) {
//     return (
//         <TreeItem key={id} nodeId={id} label={'Description'}>
//              <TreeItem key={id} nodeId={id + '-L'} label={desc}></TreeItem>
//         </TreeItem>
//     )
// }

// function createTreeItemLeaf(id: string, label: string, desc: string) {
//     return (
//         <TreeItem key={id} nodeId={id} label={label}>
//              <TreeItem key={id} nodeId={id + '-L'} label={desc}></TreeItem>
//         </TreeItem>
//     )
// }

// function createTreeItemWithChildren(id: string, label: string, children: string[]) {
//     return (
//         <TreeItem key={id} nodeId={id} label={label}>
//              <TreeItem key={id} nodeId={id + '-L'} label={desc}></TreeItem>
//         </TreeItem>
//     )
// }


// function createTreeItemDetails(id: string, desc: string) {
//     return (
//         <TreeItem key={id} nodeId={id} label={'Details'}>
//              {/* <TreeItem key={id} nodeId={id + '-L'} label={desc}></TreeItem> */}
//         </TreeItem>
//     )
// }

               
                {/* <TreeItem key={'desc'} nodeId={'desc'} label={'Description: ' + data.longDescription}></TreeItem>
    
                <TreeItem key={'global-details'} nodeId={'global-details'} label={'Details'}>
                    {data.title ? (
                        <TreeItem key={'title'} nodeId={'title'} label={'Title: ' + data.title}></TreeItem>
                    ): null}
    
                    {data.subtitle ? (
                        <TreeItem key={'subtitle'} nodeId={'subtitle'} label={'Subtitle: ' + data.subtitle}></TreeItem>
                    ): null}
    
                    <TreeItem key={'composition'} nodeId={'composition'} label={'Composition'}>
                        <TreeItem key={'composition-desc'} nodeId={'composition-desc'} label={'Description: ' + data.composition.description}></TreeItem>
                        <TreeItem key={'composition-details'} nodeId={'composition-details'} label={'Details'}>
                            <TreeItem key={'composition-details-nTracks'} nodeId={'composition-details-nTracks'} label={'Number of tracks: ' + data.composition.nTracks}></TreeItem>
                        </TreeItem>
                    </TreeItem>
    
                    <TreeItem key='tracks' nodeId='tracks' label={'Tracks'}>
                        {Object.keys(data.tracks).map(t => (createTreeTrackMUI(data.tracks[t as any])))}
                    </TreeItem>
    
                </TreeItem>  */}


// function createTreeLeaf(id: string, label: string) {
//     return (
//         <TreeItem key={id} nodeId={id} label={label}></TreeItem>
//     )
// }

// export function createTreeMUI(data: AltGoslingSpec) {
//   return (
//     <TreeView
//       aria-label="rich object"
//       defaultCollapseIcon={<ExpandMoreIcon />}
//       defaultExpanded={['root']}
//       defaultExpandIcon={<ChevronRightIcon />}
//       sx={{ overflow: 'scroll' }}
//     >
//         <TreeItem key='tree' nodeId='tree' label='Automatic description'>

//             <TreeItem key={'alt'} nodeId={'alt'} label={'Alt: ' + data.alt}></TreeItem>
//             <TreeItem key={'desc'} nodeId={'desc'} label={'Description: ' + data.longDescription}></TreeItem>

//             <TreeItem key={'global-details'} nodeId={'global-details'} label={'Details'}>
//                 {data.title ? (
//                     <TreeItem key={'title'} nodeId={'title'} label={'Title: ' + data.title}></TreeItem>
//                 ): null}

//                 {data.subtitle ? (
//                     <TreeItem key={'subtitle'} nodeId={'subtitle'} label={'Subtitle: ' + data.subtitle}></TreeItem>
//                 ): null}

//                 <TreeItem key={'composition'} nodeId={'composition'} label={'Composition'}>
//                     <TreeItem key={'composition-desc'} nodeId={'composition-desc'} label={'Description: ' + data.composition.description}></TreeItem>
//                     <TreeItem key={'composition-details'} nodeId={'composition-details'} label={'Details'}>
//                         <TreeItem key={'composition-details-nTracks'} nodeId={'composition-details-nTracks'} label={'Number of tracks: ' + data.composition.nTracks}></TreeItem>
//                     </TreeItem>
//                 </TreeItem>

//                 <TreeItem key='tracks' nodeId='tracks' label={'Tracks'}>
//                     {Object.keys(data.tracks).map(t => (createTreeTrackMUI(data.tracks[t as any])))}
//                 </TreeItem>

//             </TreeItem> 
        
//         </TreeItem>

//     </TreeView>
//   );
// }
