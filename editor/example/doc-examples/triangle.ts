export const TRIANGLE = `{
"title": "Basic Marks: Triangles",
"subtitle": "Tutorial Examples",
   "alignment": "overlay",
   "data": {
     "url": "https://server.gosling-lang.org/api/v1/tileset_info/?d=gene-annotation",
     "type": "beddb",
     "genomicFields": [
       {"index": 1, "name": "start"},
       {"index": 2, "name": "end"}
     ],
     "valueFields": [
       {"index": 5, "name": "strand", "type": "nominal"},
       {"index": 3, "name": "name", "type": "nominal"}
     ],
     "exonIntervalFields": [
       {"index": 12, "name": "start"},
       {"index": 13, "name": "end"}
     ]
   },
   "tracks": [
     {
       "dataTransform": [
         {"type": "filter", "field": "type", "oneOf": ["gene"]},
         {"type": "filter", "field": "strand", "oneOf": ["+"]}
       ],
       "mark": "triangleRight",
       "x": {"field": "end", "type": "genomic", "axis": "top"},
       "size": {"value": 15}
     },
     {
       "dataTransform": [
         {"type": "filter", "field": "type", "oneOf": ["gene"]}
       ],
       "mark": "text",
       "text": {"field": "name", "type": "nominal"},
       "x": {"field": "start", "type": "genomic"},
       "xe": {"field": "end", "type": "genomic"},
       "style": {"dy": -15}
     },
     {
       "dataTransform": [
         {"type": "filter", "field": "type", "oneOf": ["gene"]},
         {"type": "filter", "field": "strand", "oneOf": ["-"]}
       ],
       "mark": "triangleLeft",
       "x": {"field": "start", "type": "genomic"},
       "size": {"value": 15},
       "style": {"align": "right"}
     }
   ],
   "row": {"field": "strand", "type": "nominal", "domain": ["+", "-"]},
   "color": {
     "field": "strand",
     "type": "nominal",
     "domain": ["+", "-"],
     "range": ["#7585FF", "#FF8A85"]
   },
   "visibility": [
     {
       "operation": "less-than",
       "measure": "width",
       "threshold": "|xe-x|",
       "transitionPadding": 10,
       "target": "mark"
     }
   ],
   "opacity": {"value": 0.8},
   "width": 650,
   "height": 100
 }`;
