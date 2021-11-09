export const SEMANTIC_ZOOM_CYTO = `{
    "title": "Example: Semantic Zooming",
    "subtitle": "Text and triangle marks will show when zooming in to provide more details",
    "layout": "linear",
    "views": [
      
      {"height": 60,
      "width": 800,
        "data": {
          "url": "https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv",
          "type": "csv",
          "chromosomeField": "Chromosome",
          "genomicFields": ["chromStart", "chromEnd"]
        },
        "alignment": "overlay",
        "tracks": [
          {
            "mark": "rect",
            "color": {
              "field": "Chromosome",
              "type": "nominal",
              "domain": [
                "chr1",
                "chr2",
                "chr3",
                "chr4",
                "chr5",
                "chr6",
                "chr7",
                "chr8",
                "chr9",
                "chr10",
                "chr11",
                "chr12",
                "chr13",
                "chr14",
                "chr15",
                "chr16",
                "chr17",
                "chr18",
                "chr19",
                "chr20",
                "chr21",
                "chr22",
                "chrX",
                "chrY"
              ],
              "range": ["#F6F6F6", "gray"]
            },
            "x": {"field": "chromStart", "type": "genomic", "aggregate": "min"},
            "xe": {"field": "chromEnd", "aggregate": "max", "type": "genomic"},
            "strokeWidth": {"value": 2},
            "stroke": {"value": "gray"},
            "visibility": [{
              "operation": "greater-than",
              "measure": "zoomLevel",
              "threshold": 2,
              "target": "track"
            }]
          },
          {
            "mark": "text",
            "dataTransform": [{"type": "filter", "field": "Stain", "oneOf": ["acen"], "not": true}],
            "text": {"field": "Name", "type": "nominal"},
            "color": {
              "field": "Stain",
              "type": "nominal",
              "domain": ["gneg", "gpos25", "gpos50", "gpos75", "gpos100", "gvar"],
              "range": ["black", "black", "black", "black", "white", "black"]
            },
            "visibility": [{
              "operation": "less-than",
              "measure": "width",
              "threshold": "|xe-x|",
              "transitionPadding": 10,
              "target": "mark"
            }],
            "style": {"textStrokeWidth": 0}
          },
          {
            "mark": "rect",
            "dataTransform": [{"type": "filter","field": "Stain", "oneOf": ["acen"], "not": true}]
            ,
            "color": {
              "field": "Stain",
              "type": "nominal",
              "domain": ["gneg", "gpos25", "gpos50", "gpos75", "gpos100", "gvar"],
              "range": [
                "white",
                "#D9D9D9",
                "#979797",
                "#636363",
                "black",
                "#A0A0F2"
              ]
            }
          },
          {
            "mark": "triangleRight",
            "dataTransform": [{"type": "filter","field": "Stain", "oneOf": ["acen"], "not": false},
                {"type": "filter", "field": "Name", "include": "q", "not": false}
              ],
            "color": {"value": "#B40101"}
          },
          {
            "mark": "triangleLeft",
            "dataTransform": [
                {"type": "filter", "field": "Stain", "oneOf": ["acen"], "not": false},
                {"type": "filter", "field": "Name", "include": "p", "not": false}
              ],
            "color": {"value": "#B40101"}
          }
        ],
        "x": {
          "field": "chromStart",
          "type": "genomic",
          "domain": {"chromosome": "1"},
          "axis": "top"
        },
        "xe": {"field": "chromEnd", "type": "genomic"},
        "size": {"value": 20},
        "stroke": {"value": "gray"},
        "strokeWidth": {"value": 0.5},
        "style": {"outline": "white"},
        "visibility": [{
          "operation": "greater-than",
          "measure": "width",
          "threshold": 3,
          "transitionPadding": 5,
          "target": "mark"
        }]
      }
    ]
  }`;
