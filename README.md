


<div align="center">

<table>
<tr>
<th style="vertical-align: bottom;">

<img src="https://user-images.githubusercontent.com/9922882/106369962-ddbba700-6323-11eb-9e47-f8b06ba24178.png" style="display: block">

</th>
<th>
<span style="font-size: 30px">Gosling.js</span>
<br/>
<span style="font-size: 20px"> Grammar Of Scalable Linked Interactive Nucleotide Graphics </span>


</th>
</tr>
</table>

[![npm version](https://img.shields.io/npm/v/gosling.js.svg?style=flat-square)](https://www.npmjs.com/package/gosling.js)
[![Build Status](https://img.shields.io/travis/sehilyi/geminid/master.svg?style=flat-square)](https://travis-ci.com/gosling-lang/gosling.js)
[![codecov](https://img.shields.io/codecov/c/github/gosling-lang/gosling.js/master.svg?style=flat-square&?cacheSeconds=60)](https://codecov.io/gh/gosling-lang/gosling.js)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

<img src="https://raw.githubusercontent.com/wiki/gosling-lang/gosling.js/images/cover.png" width="700"/>

</div>

<br/>
<br/>

# Introduction

Gosling is a declarative visualization grammar tailored for interactive genomic visualizations.   
In Gosling, users can easily create interactive and scalable visualizations through writing a JSON configuration. 

    
```json
{"tracks": [{
      "data": {
        "url": "https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ",
        "type": "tileset"
      },
      "metadata": {
        "type": "higlass-multivec",
        "row": "sample",
        "column": "position",
        "value": "peak",
        "categories": ["sample 1", "sample 2", "sample 3", "sample 4"]
      }
    }]
}
```

<img src="https://raw.githubusercontent.com/wiki/gosling-lang/gosling.js/images/demo.gif"  width="400"/>

[Try Online](<https://gosling.js.org/?full=false&spec=('trackG(0'BurlKhttps%3A%2F%2Fresgen.io%2Fapi%2Fv1%2FC_info%2F%3Fd%3DUvVPeLHuRDiYA3qwFlm7xQ8EC'0)%2C0'metaBEhiglass-multivec8row698columnKposition8valueKpeak8categorieGM1525354'%5D0)I)%5D%0A)*%20%200I*5J%20M6!%208J0*'9'sampleBdata6(0*'CtilesetEtypeKGs6%5BI%0A**J'%2CK6'M9%20%01MKJIGECB98650*_>)






# Resources
- [Gosling Website](https://gosling.js.org/)
- [Documentations](https://github.com/gosling-lang/gosling.js/wiki/Documentation)
- [Online Examples](https://gosling.js.org/)
- [Tutorial](https://github.com/gosling-lang/gosling.js/wiki/GettingStarted)
- [Use Gosling in your React app](https://github.com/sehilyi/geminid-react)
- [Future Plans](https://github.com/gosling-lang/gosling.js/projects/1)



# Run a Gosling editor

The following commands install and run a Gosling.js editor locally in your computer (ensure you have installed [yarn](https://yarnpkg.com/getting-started/install)):

```sh
yarn
yarn start
```
Then you can open <http://localhost:8080/> in a web browser to play with the editor.

# Installation
```
npm install gosling.js
```

# Contact
- [GitHub Issues](https://github.com/gosling-lang/gosling.js/issues/)
- Email: 
  - Sehi L'Yi <sehi_lyi@hms.harvard.edu>
  - Qianwen Wang <qianwen_wang@hms.harvard.edu>
  - Nils Gehlengborg <nils@hms.harvard.edu>

# License

This project is licensed under the terms of the [MIT license](https://github.com/gosling-lang/gosling.js/blob/master/LICENSE.md).


<!-- # Cite Gosling -->