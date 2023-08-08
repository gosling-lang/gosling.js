import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';

import type { AltGoslingSpec, AltTrack } from 'src/alt-text/alt-gosling-schema';

function createTreeTrackMUI(t: AltTrack) {
    return (
        <TreeItem key={t.uid} nodeId={t.uid} label={'Track: ' + t.uid}>
            <TreeItem key={t.uid + 'desc'} nodeId={t.uid + 'desc'} label={'Description: ' + t.description}></TreeItem>
            <TreeItem key={t.uid + 'details'} nodeId={t.uid + 'details'} label={'Details'}>     
                <TreeItem key={t.uid + 'details-pos'} nodeId={t.uid + 'details-pos'} label={'Position'}>
                    <TreeItem key={t.uid + 'details-pos-desc'} nodeId={t.uid + 'details-pos-desc'} label={'Description: ' + t.position.description}></TreeItem>
                    <TreeItem key={t.uid + 'details-pos-details'} nodeId={t.uid + 'details-pos-details'} label={'Details'}>
                        <TreeItem key={t.uid + 'details-pos-details-colN'} nodeId={t.uid + 'details-pos-details-colN'} label={'Column number: ' + t.position.details.colNumber}></TreeItem>
                        <TreeItem key={t.uid + 'details-pos-details-rowN'} nodeId={t.uid + 'details-pos-details-rowN'} label={'Row number: ' + t.position.details.rowNumber}></TreeItem>
                    </TreeItem>
                </TreeItem>
                {t.title ? (
                        <TreeItem key={t.uid + 'details-title'} nodeId={t.uid + 'details-title'} label={'Title: ' + t.title}></TreeItem>
                    ): null}
                {t.type ? (
                        <TreeItem key={t.uid + 'details-type'} nodeId={t.uid + 'details-type'} label={'Type: ' + t.type}></TreeItem>
                    ): null}
                <TreeItem key={t.uid + 'details-app'} nodeId={t.uid + 'details-app'} label={'Appearance'}>
                    <TreeItem key={t.uid + 'details-app-desc'} nodeId={t.uid + 'details-app-desc'} label={'Description: ' + t.appearance.description}></TreeItem>
                    <TreeItem key={t.uid + 'details-app-details'} nodeId={t.uid + 'details-app-details'} label={'Details'}>
                        <TreeItem key={t.uid + 'details-app-details-mark'} nodeId={t.uid + 'details-app-desc-mark'} label={'Mark: ' + t.appearance.details.mark}></TreeItem>
                    </TreeItem>
                </TreeItem>
                <TreeItem key={t.uid + 'details-data'} nodeId={t.uid + 'details-data'} label={'Data'}>
                    <TreeItem key={t.uid + 'details-data-desc'} nodeId={t.uid + 'details-data-desc'} label={'Description: ' + t.data.description}></TreeItem>
                    <TreeItem key={t.uid + 'details-data-details'} nodeId={t.uid + 'details-data-details'} label={'Details'}>
                        <TreeItem key={t.uid + 'details-data-details-stats'} nodeId={t.uid + 'details-app-desc-stats'} label={'Computed statistics'}>
                            <TreeItem key={t.uid + 'details-data-details-stats-genomicrange'} nodeId={t.uid + 'details-app-desc-stats-genomicrange'} label={'Genomic range: ' + t.data.details.dataStatistics?.genomicMax}></TreeItem>
                        </TreeItem>
                    </TreeItem>
                </TreeItem>

            </TreeItem>
        </TreeItem>
      );
}

export function createTreeMUI(data: AltGoslingSpec) {
  return (
    <TreeView
      aria-label="rich object"
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpanded={['root']}
      defaultExpandIcon={<ChevronRightIcon />}
      sx={{ overflow: 'scroll' }}
    >
        <TreeItem key='tree' nodeId='tree' label='Automatic description'>

            <TreeItem key={'alt'} nodeId={'alt'} label={'Alt: ' + data.alt}></TreeItem>
            <TreeItem key={'desc'} nodeId={'desc'} label={'Description: ' + data.longDescription}></TreeItem>

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

            </TreeItem> 
        
        </TreeItem>

    </TreeView>
  );
}