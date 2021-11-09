export const AREA = `{
    "title": "Basic Marks: Area",
    "subtitle": "Tutorial Examples",
    "tracks": [
      {
      "layout": "linear", 
      "width": 800,
      "height": 180,
        "data": {
          "url": "https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ",
          "type": "multivec",
          "row": "sample",
          "column": "position",
          "value": "peak",
          "categories": ["sample 1"]
        },
        "mark": "area",
        "x": {
          "field": "position",
          "type": "genomic",
          "domain": {"chromosome": "1", "interval": [2000500, 3000500]},
          "axis": "bottom"
        },
        "y": {"field": "peak", "type": "quantitative"},
        "size": {"value": 2}
      }
    ]
  }`;
