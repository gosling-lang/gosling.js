import { GeminiSpec } from '../../gemini.schema'

const LOCAL_MULTIVEC = 'http://localhost:8001/api/v1/tileset_info/?d=XX4dPR0dSCGzD2n-xtlhbA'

export const GEMINI_TRACK_EXAMPLE: GeminiSpec = {
  tracks: [{
    data: {
      url: LOCAL_MULTIVEC, //'https://resgen.io/api/v1/tileset_info/?d=RTGsPv37TB2aKk9ujTIu6Q', 
      type: 'tileset'
    },
    zoomOutTechnique: { type: 'auto' },
    mark: 'bar',
    x: { field: '__G__', type: 'genomic', domain: { chromosome: '1', interval: [3000000, 3000500] } },
    x1: { axis: true },
    y: { field: '__Q__', type: 'quantitative' },
    color: {
      field: '__N__',
      type: 'nominal',
      domain: [
        'A', 'T', 'G', 'C', 'N', 'other'
      ],
      range: [
        "#007FFF",
        "#e8e500",
        "#008000",
        "#FF0038",
        "#800080",
        "#DCDCDC",
      ]
    },
    width: 1000,
    height: 180,
  }]
}

export const GEMINI_TRACK_EXAMPLE2: GeminiSpec = {
  tracks: [{
    data: {
      url: LOCAL_MULTIVEC, //'https://resgen.io/api/v1/tileset_info/?d=RTGsPv37TB2aKk9ujTIu6Q', 
      type: 'tileset'
    },
    zoomOutTechnique: {
      type: 'alt-representation',
      spec: {
        row: { field: '__N__', type: 'nominal' }
      }
    },
    mark: 'bar',
    x: { field: '__G__', type: 'genomic', domain: { chromosome: '1', interval: [3000000, 3000500] } },
    x1: { axis: true },
    y: { field: '__Q__', type: 'quantitative' },
    color: {
      field: '__N__',
      type: 'nominal',
      domain: [
        'A', 'T', 'G', 'C', 'N', 'other'
      ],
      range: [
        "#007FFF",
        "#e8e500",
        "#008000",
        "#FF0038",
        "#800080",
        "#DCDCDC",
      ]
    },
    width: 1000,
    height: 180,
  }]
}

export const GEMINI_TRACK_EXAMPLE3: GeminiSpec = {
  tracks: [{
    data: {
      url: LOCAL_MULTIVEC, //'https://resgen.io/api/v1/tileset_info/?d=RTGsPv37TB2aKk9ujTIu6Q', 
      type: 'tileset'
    },
    zoomOutTechnique: {
      type: 'alt-representation',
      spec: {
        mark: 'line'
      }
    },
    mark: 'bar',
    x: { field: '__G__', type: 'genomic', domain: { chromosome: '1', interval: [3000000, 3000500] } },
    x1: { axis: true },
    y: { field: '__Q__', type: 'quantitative' },
    color: {
      field: '__N__',
      type: 'nominal',
      domain: [
        'A', 'T', 'G', 'C', 'N', 'other'
      ],
      range: [
        "#007FFF",
        "#e8e500",
        "#008000",
        "#FF0038",
        "#800080",
        "#DCDCDC",
      ]
    },
    width: 1000,
    height: 180,
  }]
}

export const LAYOUT_EXAMPLE_LINK: GeminiSpec = {
  tracks: [
    {
      data: { url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv', type: 'csv' },
      mark: 'link-between',
      x: { field: 'from', type: 'nominal' },
      y: { field: 'to', type: 'nominal' },
      width: 50,
      height: 50,
    },
    {
      data: { url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv', type: 'csv' },
      mark: 'link-between',
      x1: { field: 'from', type: 'nominal' },
      y: { field: 'to', type: 'nominal' },
      width: 50,
      height: 50,
    },
    {
      data: {
        url:
          'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
        type: 'csv',
      },
      mark: 'link-between',
      x1: { field: 'from', type: 'nominal' },
      y1: { field: 'to', type: 'nominal' },
      width: 50,
      height: 50,
    },
    {
      data: {
        url:
          'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
        type: 'csv',
      },
      mark: 'link-between',
      x: { field: 'from', type: 'nominal' },
      y1: { field: 'to', type: 'nominal' },
      width: 50,
      height: 50,
    },
    {
      data: {
        url:
          'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
        type: 'csv',
      },
      mark: 'link-between',
      x: { field: 'from', type: 'nominal' },
      x1: { field: 'to', type: 'nominal' },
      width: 50,
      height: 50,
    },
    {
      data: {
        url:
          'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
        type: 'csv',
      },
      mark: 'link-between',
      y: { field: 'from', type: 'nominal' },
      y1: { field: 'to', type: 'nominal' },
      width: 50,
      height: 50,
    },
  ],
}

export const LAYOUT_EXAMPLE_COMBO: GeminiSpec = {
  references: [
    'http://genocat.tools/tools/combo.html',
    'http://genocat.tools/tools/gbrowse_syn.html',
    'http://genocat.tools/tools/ggbio.html',
    'http://genocat.tools/tools/give.html',
    'http://genocat.tools/tools/variant_view.html',
  ],
  tracks: [
    {
      data: { url: 'dummy', type: 'csv' },
      mark: 'dummy',
      width: 800,
      height: 50,
    },
    {
      data: {
        url:
          'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
        type: 'csv',
      },
      mark: 'link-between',
      x1: { field: 'from', type: 'nominal' },
      x: { field: 'to', type: 'nominal' },
      width: 800,
      height: 50,
    },
    {
      data: { url: 'dummy', type: 'csv' },
      mark: 'dummy',
      width: 800,
      height: 50,
    },
  ],
}

export const LAYOUT_EXAMPLE_COMBO_HORIZONTAL: GeminiSpec = {
  layout: { type: 'linear', direction: 'horizontal' },
  tracks: [
    {
      data: { url: 'dummy', type: 'csv' },
      mark: 'dummy',
      width: 60,
      height: 500,
    },
    {
      data: {
        url:
          'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
        type: 'csv',
      },
      mark: 'link-between',
      y: { field: 'from', type: 'nominal' },
      y1: { field: 'to', type: 'nominal' },
      width: 60,
      height: 500,
    },
    {
      data: { url: 'dummy', type: 'csv' },
      mark: 'dummy',
      width: 60,
      height: 500,
    },
  ],
}

export const LAYOUT_EXAMPLE_COMBO_BAND: GeminiSpec = {
  references: [
    'http://genocat.tools/tools/combo.html',
    'http://genocat.tools/tools/gbrowse_syn.html',
    'http://genocat.tools/tools/ggbio.html',
    'http://genocat.tools/tools/give.html',
    'http://genocat.tools/tools/variant_view.html',
  ],
  tracks: [
    {
      data: {
        url: 'https://resgen.io/api/v1/tileset_info/?d=a-iBpdh3Q_uO2FLCWKpOOw',
        type: 'tileset',
      },
      mark: { type: '1d-heatmap-higlass', server: 'gemini-v1' },
      x: { type: 'genomic', domain: { chromosome: '2' } },
      width: 800,
      height: 60,
    },
    {
      data: {
        url: 'https://resgen.io/api/v1/tileset_info/?d=a-iBpdh3Q_uO2FLCWKpOOw',
        type: 'tileset',
      },
      mark: { type: 'line-higlass', server: 'gemini-v1' },
      x: { type: 'genomic', domain: { chromosome: '2' } },
      width: 800,
      height: 90,
    },
    {
      data: {
        url: 'https://higlass.io/api/v1/tileset_info/?d=OHJakQICQD6gTD7skx4EWA',
        type: 'tileset',
      },
      mark: {
        type: 'gene-annotation-higlass',
        server: 'gemini-v1',
      },
      x: { type: 'genomic', axis: true, domain: { chromosome: '2' } },
      width: 800,
      height: 140,
    },
    {
      data: {
        url:
          'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/range-to-range-relation.csv',
        type: 'csv',
      },
      mark: 'link-between',
      x1: { field: 'from' },
      x1e: { field: 'from1' },
      x: { field: 'to' },
      xe: { field: 'to1' },
      width: 800,
      height: 260,
      stroke: { value: 'none' },
    },
    {
      data: {
        url: 'https://higlass.io/api/v1/tileset_info/?d=OHJakQICQD6gTD7skx4EWA',
        type: 'tileset',
      },
      mark: {
        type: 'gene-annotation-higlass',
        server: 'gemini-v1',
      },
      x: { type: 'genomic', domain: { chromosome: '3' } },
      x1: { axis: true },
      width: 800,
      height: 140,
    },
    {
      data: {
        url: 'https://resgen.io/api/v1/tileset_info/?d=a-iBpdh3Q_uO2FLCWKpOOw',
        type: 'tileset',
      },
      mark: { type: 'bar-higlass', server: 'gemini-v1' },
      x: { type: 'genomic', domain: { chromosome: '4' } },
      width: 800,
      height: 80,
    },
    {
      data: {
        url: 'https://resgen.io/api/v1/tileset_info/?d=a-iBpdh3Q_uO2FLCWKpOOw',
        type: 'tileset',
      },
      mark: { type: 'point-higlass', server: 'gemini-v1' },
      x: { type: 'genomic' },
      width: 800,
      height: 80,
    },
  ],
}

export const LAYOUT_EXAMPLE_STACKED_MULTI_TRACKS: GeminiSpec = {
  layout: { type: 'linear', direction: 'horizontal', wrap: 2 },
  tracks: [
    {
      data: { url: 'dummy', type: 'csv' },
      mark: 'dummy',
      width: 350,
      height: 30,
      style: { background: '#FAF9F7' },
    },
    {
      data: { url: 'dummy', type: 'csv' },
      mark: 'dummy',
      width: 350,
      height: 30,
    },
    {
      data: { url: 'dummy', type: 'csv' },
      mark: 'dummy',
      width: 350,
      height: 30,
      style: { background: '#FAF9F7' },
    },
    {
      data: { url: 'dummy', type: 'csv' },
      mark: 'dummy',
      width: 350,
      height: 30,
    },
    {
      data: { url: 'dummy', type: 'csv' },
      mark: 'dummy',
      width: 350,
      height: 30,
      style: { background: '#FAF9F7' },
    },
    {
      data: { url: 'dummy', type: 'csv' },
      mark: 'dummy',
      width: 350,
      height: 30,
    },
  ],
}

export const LAYOUT_EXAMPLE_STACKED_MULTI_TRACKS_CIRCULAR: GeminiSpec = {
  layout: { type: 'circular', direction: 'horizontal', wrap: 2 },
  tracks: [
    {
      data: { url: 'dummy', type: 'csv' },
      mark: 'dummy',
      width: 500,
      height: 30,
      style: { background: '#FAF9F7' },
    },
    {
      data: { url: 'dummy', type: 'csv' },
      mark: 'dummy',
      width: 500,
      height: 30,
    },
    {
      data: { url: 'dummy', type: 'csv' },
      mark: 'dummy',
      width: 500,
      height: 30,
      style: { background: '#FAF9F7' },
    },
    {
      data: { url: 'dummy', type: 'csv' },
      mark: 'dummy',
      width: 500,
      height: 30,
    },
    {
      data: { url: 'dummy', type: 'csv' },
      mark: 'dummy',
      width: 500,
      height: 30,
      style: { background: '#FAF9F7' },
    },
    {
      data: { url: 'dummy', type: 'csv' },
      mark: 'dummy',
      width: 500,
      height: 30,
    },
  ],
}
