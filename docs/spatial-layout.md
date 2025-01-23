# 3D chromatin structures in Gosling

The purpose of this file is to document the changes in the specification and
gosling.js to support visualizing 3D structures of chromatin. It should be
merged in the main documentation at some point.

Minimal specification using 3D data:

```javascript
const spec = {
   views: [{
      layout: "spatial",
      tracks: [
         {
            data: {
               url: "https://...",
            },
         },
      ],
   }]
}
```

## Features

### Specifying visual channels
```javascript
{
   /* ... */
   views: [{
      layout: "spatial",
      tracks: [
         {
            data: {
               url: "https://...",
            },
            color: {
               value: "#ff00ff"
            },
            scale: {
               value: 0.01
            }
         },
      ],
   }]
}
```

### Composing multiple tracks within a spatial view

To create more complex visualizations, we can compose several tracks within a
single view. Then each track can have different visual encodings, filtering,
etc., that will be composed (overlaid) within a single view

```javascript
{
   /* ... */
   views: [{
      layout: "spatial",
      tracks: [
         { // track 1
            data: {
               url: "https://...",
            },
            color: {
               value: "#ff00ff"
            },
            scale: {
               value: 0.01
            }
            filter: "chr1", //~ select only part to show
         },
         { // track 2
            data: {
               url: "https://...",
            },
            color: {
               value: "#333333"
            },
            scale: {
               value: 0.001
            }
         },
      ],
   }]
}
```
