export const OVERLAY_TRACKS_LINE_POINT = `{
    "title": "Example: Overlayed Tracks",
    "tracks": [
      {
        "height": 200,
        "width": 1000,        
        "layout": "linear",
        "data": {
            "url": "https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ",
            "type": "multivec",
            "row": "sample",
            "column": "position",
            "value": "peak",
            "categories": ["sample 1", "sample 2", "sample 3", "sample 4"]
        },
        "alignment": "overlay",
        "tracks": [
            {"mark": "line"},
            {
                "mark": "point",
                "size": {"field": "peak", "type": "quantitative", "range": [0, 6]}
            }
        ],
        "x": {
            "field": "position",
            "type": "genomic",
            "domain": {"chromosome": "1", "interval": [1, 3000500]},
            "axis": "top"
        },
        "y": {"field": "peak", "type": "quantitative"},
        "row": {"field": "sample", "type": "nominal"},
        "color": {"field": "sample", "type": "nominal"}
      }
    ]
  }`;
