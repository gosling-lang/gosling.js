<!-- <p align="center"><img src="https://raw.githubusercontent.com/wiki/gosling-lang/gosling.js/images/logo.png" width="450" /></p> -->

<div align="center">
<h1>Gosling.js</h1>

[![npm version](https://img.shields.io/npm/v/gosling.js.svg?style=flat-square)](https://www.npmjs.com/package/gosling.js)
[![Build Status](https://img.shields.io/travis/sehilyi/geminid/master.svg?style=flat-square)](https://travis-ci.com/gosling-lang/gosling.js)
[![codecov](https://img.shields.io/codecov/c/github/gosling-lang/gosling.js/master.svg?style=flat-square&?cacheSeconds=60)](https://codecov.io/gh/gosling-lang/gosling.js)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

</div>

<p align="center"><img src="https://raw.githubusercontent.com/wiki/gosling-lang/gosling.js/images/cover.png" width="700"/></p>

<br/>

## Introduction

Gosling is a declarative visualization grammar tailored for interactive genomic visualizations. 
Using Gosling.js, users can easily create interactive and scalable genomic visualizations through writing a JSON configuration. 

<div align="center">
<table>
<tr><td>  
<pre>
{
  // A simple example
  "tracks": [{
      "data": {
        "url": "https://data-url.com",
        "type": "multivec",
        "row": "sample",
        "column": "position",
        "value": "peak",
        "categories": [
          "sample 1", 
          "sample 2", 
          "sample 3", 
          "sample 4"
          ],
        },
        "mark": "area",
        "overrideTemplate": true
      }
    }]
}
</pre>

</td>
<td align="center">
<img src="https://raw.githubusercontent.com/wiki/gosling-lang/gosling.js/images/demo.gif"  width="400"/>

<a href="https://gosling.js.org/">Try Online</a>
</td>
</tr>
</table>
</div>

## Why Gosling

The Gosling's key features compared to existing visualization libraries and grammars are as follows:

- **Data Scalability**: As Gosling is built on [HiGlass](http://higlass.io/), the grammar allows you to handle and visualize large genome-mapped data and quickly switch the scale of visualization from base-pair resolution to whole genome.

- **Encoding Scalability**: Gosling supports an advanced zooming technique, called [*Semantic Zooming*](https://infovis-wiki.net/wiki/Semantic_Zoom), which allows flexible and seamless visual exploration of large genome-mapped data. This allows you to dynamically switch between different visual encoding strategies that are appropriate for given zoom scale. <!--For example, you can show nucleotide bases of genomic sequence when zoomed in while show overall distribution of the bases using stacked bar chart when zoomed out.-->

- **Expressiveness**: Gosling is designed based on the [taxonomy for genomic data visualization](https://onlinelibrary.wiley.com/doi/full/10.1111/cgf.13727). Gosling supports genomic visualizations that cannot be easily created uisng general visaulization tools. For example, Gosling allows you to use a circular layout (i.e., displaying genomic coordinates in a polar system), in addition to a linear layout, and easily switch between the two.

- **Interactivity**: Gosling supports intuitive and effective user interactions, including zooming and panning and [brushing and linking](https://infovis-wiki.net/wiki/Linking_and_Brushing), that help you flexibly set up visualization reflecting your different visual analytics use cases.

## Learn More About Gosling
- [Gosling.js Editor and Online Examples](https://gosling.js.org/)
- [Documentation](https://github.com/gosling-lang/gosling.js/wiki/Documentation)
- [Getting Started](https://github.com/gosling-lang/gosling.js/wiki/Getting-Started)
- [Roadmap](https://github.com/gosling-lang/gosling.js/projects/1)

## Installation
```
npm install gosling.js
```

## Run Editor Locally

The following commands install and run a Gosling.js editor locally in your computer (ensure you have installed [yarn](https://yarnpkg.com/getting-started/install)):

```sh
yarn
yarn start
```
Then you can open <http://localhost:8080/> in a web browser to play with the editor.

## Contact
- Open [Github Issues](https://github.com/gosling-lang/gosling.js/issues/) to ask questions or request features.

## Team
- Sehi L'Yi (<sehi_lyi@hms.harvard.edu>)
- Qianwen Wang (<qianwen_wang@hms.harvard.edu>)
- Fritz Lekschas (<lekschas@seas.harvard.edu>)
- Nils Gehlenborg (<nils@hms.harvard.edu>)

## License

This project is licensed under the terms of the [MIT license](https://github.com/gosling-lang/gosling.js/blob/master/LICENSE.md).


<!-- # Cite Gosling -->
