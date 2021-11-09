export const SEMANTIC_ZOOM_SEQUENCE = `{
  "title": "Example: Semantic Zooming",
  "subtitle": "hide text annotation and only show bar charts when zooming out",
  "views": [
    {
      "width": 800,
      "height": 150,
      "data": {
        "url": "https://resgen.io/api/v1/tileset_info/?d=WipsnEDMStahGPpRfH9adA",
        "type": "multivec",
        "row": "base",
        "column": "position",
        "value": "count",
        "categories": [
          "A",
          "T",
          "G",
          "C"
        ],
        "start": "start",
        "end": "end"
      },
      "x": {
        "field": "position",
        "type": "genomic",
        "domain": {
          "chromosome": "1",
          "interval": [
            3000000,
            3000010
          ]
        },
        "axis": "top"
      },
      "color": {
        "field": "base",
        "type": "nominal",
        "domain": [
          "A",
          "T",
          "G",
          "C"
        ],
        "legend": true
      },
      "y": {
        "field": "count",
        "type": "quantitative"
      },
      "alignment": "overlay",
      "tracks": [
        {
          "mark": "bar"
        },
        {
          "mark": "bar",
          "strokeWidth": {
            "value": 1
          },
          "stroke": {
            "value": "white"
          },
          "visibility": [
            {
              "operation": "gtet",
              "measure": "width",
              "threshold": 20,
              "transitionPadding": 10,
              "target": "mark"
            }
          ]
        },
        // text mark
        {
          "dataTransform": [
            {
              "type": "filter",
              "field": "count",
              "oneOf": [
                0
              ],
              "not": true
            }
          ],
          "mark": "text",
          "x": {
            "field": "start",
            "type": "genomic",
            "domain": {
              "chromosome": "1",
              "interval": [
                3000000,
                3000010
              ]
            },
            "axis": "top"
          },
          "xe": {
            "field": "end",
            "type": "genomic"
          },
          "color": {
            "value": "white"
          },
          "y": {
            "value": 70
          },
          "visibility": [
            {
              "operation": "less-than",
              "measure": "width",
              "threshold": "|xe-x|",
              "transitionPadding": 30,
              "target": "mark"
            }
          ],
          "text": {
            "field": "base",
            "type": "nominal"
          },
          "style": {
            "textFontSize": 24,
            "textStrokeWidth": 0,
            "textFontWeight": "bold"
          }
        }
      ]
    }
  ]
}`;
