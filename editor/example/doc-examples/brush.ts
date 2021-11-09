export const BRUSH = `{
    "title": "Example: Brushing and Linking",
    "layout": "linear",
    "tracks": [
      {
        "width": 800,
        "height": 200,
        "data": {
          "url": "https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ",
          "type": "multivec",
          "row": "sample",
          "column": "position",
          "value": "peak",
          "categories": ["sample 1"]
        },
        "mark": "line",
        "x": {
          "field": "position",
          "type": "genomic",
          "domain": {"chromosome": "1"},
          "axis": "top"
        },
        "y": {"field": "peak", "type": "quantitative"},
        
        // create a rectangle brush
        "alignment":"overlay",
        "tracks": [
          {}, // this dummy object cannot be removed
          {"mark": "brush", 
          "x": {"linkingId": "linking-with-brush"},
          "color": {"value":"steelBlue"}
          }
        ]
      },
      {
        "width": 800,
        "height": 200,
        "data": {
          "url": "https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ",
          "type": "multivec",
          "row": "sample",
          "column": "position",
          "value": "peak",
          "categories": ["sample 1"]
        },
        "mark": "line",
        "x": {
          "field": "position",
          "type": "genomic",
          "domain": {"chromosome": "1", "interval": [200000000, 220000000]},
          "axis": "top",
          "linkingId": "linking-with-brush"
        },
        "y": {"field": "peak", "type": "quantitative"},
        "opacity":{"value": 1},
        "style": {"background": "steelBlue", "backgroundOpacity": 0.1}
      }
    ]
  }`;
