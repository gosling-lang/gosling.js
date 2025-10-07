# 3D genome structures in Gosling

This file documents the changes in the specification and gosling.js library to
support visualizing 3D structures of genomes.

In principle, there are two ways to define a spatial view:
1. on the **view level**
2. on the **track level**

## view-level specification
We can supply a 3D model data file and bind it to spatial layout properties in
the definition of view's `layout`. This has two advantages: 1) there is no need
to repeat the definitions of a model in each track, and 2) this enables to
merge two data files (one to define the 3D model, and another with a genomic
signal).

```javascript
{
  views: [
    {
      layout: {
        type: "spatial",
        model: {
          type: "csv",
          url: "https://.../full-model.csv",
          xyz: ["x", "y", "z"],
          chromosome: "chr",
          position: "coord"
        }
      },
      tracks: [
         { mark: "sphere" },
         { mark: "box" },
      ]
    }
  ]
}
```

The other method uses simply specifying layout as `spatial` and using the data
in a track for defining the model:
```javascript
{
  views: [
    {
      layout: "spatial",
      tracks: [
         {
            data: { type: "csv", url: "https://.../full-model.csv" },
            spatial: {
                  x: "xfield",
                  y: "yfield",
                  z: "zfield"
                  chr: "chrfield",
                  coord: "positionfield",
            },
            mark: "sphere",
         }
      ]
    }
  ]
}
```
This doesn't allow for combining the structural data with any other genomic
formats, unless the genomic data are integrated in the csv already.

Internally, the first method is converted into the second one. The model data
file from the `layout` is pushed down to a dataTransform.
