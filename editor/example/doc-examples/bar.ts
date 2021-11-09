export const BAR = `{
  "title": "Basic Marks: Bar",
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
        "categories": ["sample 1"],
        "binSize": 5
      },
      "mark": "bar",
      // encode visual channels
      "x": {"field": "start", "type": "genomic"},
      "xe": {"field": "end", "type": "genomic"},
      "y": {"field": "peak", "type": "quantitative"}
      // stype related properties
      "stroke":{ "value": "white"},
      "strokeWidth": {"value": 0.5},
    }
  ]
  }`;
