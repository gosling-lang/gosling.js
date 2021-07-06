## [0.8.4](https://github.com/gosling-lang/gosling.js/compare/v0.8.3...v0.8.4) (2021-07-06)


### Bug Fixes

* remove improper loading message in track ([#418](https://github.com/gosling-lang/gosling.js/issues/418)) ([62bf073](https://github.com/gosling-lang/gosling.js/commit/62bf073d6a67bca03ddb5687b9ef4c51f99d3ea2))
* **editor:** address hiccups in editor ([#411](https://github.com/gosling-lang/gosling.js/issues/411)) ([3025533](https://github.com/gosling-lang/gosling.js/commit/30255337e4eb0a6601319068a8be141edd19b861))
* convert to numbers when quantitative fields are strings ([#402](https://github.com/gosling-lang/gosling.js/issues/402)) ([95212bd](https://github.com/gosling-lang/gosling.js/commit/95212bd42fc8cccf26517ea1da24d35ed7706e8d))


### Features

* allow parallel and serial arrangements of multiple circular views with different domains ([bad68e7](https://github.com/gosling-lang/gosling.js/commit/bad68e71366abb0e28deea8c1514801ef3b5af54))
* allow specifying `id` and `className` in `GoslingComponent` ([#419](https://github.com/gosling-lang/gosling.js/issues/419)) ([30d45a3](https://github.com/gosling-lang/gosling.js/commit/30d45a31b057ee5884b55a14224417dddaee96a4))
* rename link marks to betweenLink and withinLink ([#416](https://github.com/gosling-lang/gosling.js/issues/416)) ([8e7556c](https://github.com/gosling-lang/gosling.js/commit/8e7556cfbfd674ec21e7783df8e37513d0cad7ec))
* **api:** zoom to extent ([#408](https://github.com/gosling-lang/gosling.js/issues/408)) ([0b3c71f](https://github.com/gosling-lang/gosling.js/commit/0b3c71ff3ab99ee7b5cb445c704c2fe35145be99))
* add a between-link mark ([#405](https://github.com/gosling-lang/gosling.js/issues/405)) ([c7a76e2](https://github.com/gosling-lang/gosling.js/commit/c7a76e22df9e7755242a764c70400c6beeb9cdb8))



## [0.8.3](https://github.com/gosling-lang/gosling.js/compare/v0.8.2...v0.8.3) (2021-05-28)


### Features

* **api:** support mouseover event listener ([#388](https://github.com/gosling-lang/gosling.js/issues/388)) ([e56e32c](https://github.com/gosling-lang/gosling.js/commit/e56e32cdbbcf3a68bb9ecebc45f2ff39d4833c94))
* allow vertical band connection w/o independent scales yet ([#394](https://github.com/gosling-lang/gosling.js/issues/394)) ([5591e2d](https://github.com/gosling-lang/gosling.js/commit/5591e2d7ba6339c4a5eb7cc6a4e105a3c633c8f0))



## [0.8.2](https://github.com/gosling-lang/gosling.js/compare/v0.8.1...v0.8.2) (2021-05-25)


### Bug Fixes

* reduce log warning messages ([#392](https://github.com/gosling-lang/gosling.js/issues/392)) ([4a14d7a](https://github.com/gosling-lang/gosling.js/commit/4a14d7a3ce6941cbf19afbb83704f95d58bdd035))


### Features

* support tooltips for most marks in linear, relative genomic position, formatting ([#387](https://github.com/gosling-lang/gosling.js/issues/387)) ([824faba](https://github.com/gosling-lang/gosling.js/commit/824faba97e606fe506e2af749d19b11bd9b785e0))



## [0.8.1](https://github.com/gosling-lang/gosling.js/compare/v0.8.0...v0.8.1) (2021-05-19)


### Bug Fixes

* properly refresh grids upon zoom ([#381](https://github.com/gosling-lang/gosling.js/issues/381)) ([7cc61c3](https://github.com/gosling-lang/gosling.js/commit/7cc61c3782758475e75a919ede4d6499fdc7169e))


### Features

* **api:** export pdf file ([#385](https://github.com/gosling-lang/gosling.js/issues/385)) ([42c1d99](https://github.com/gosling-lang/gosling.js/commit/42c1d99ad463bff145613ef2759c3e7e131dda85))
* **api:** export png file ([#382](https://github.com/gosling-lang/gosling.js/issues/382)) ([5799c96](https://github.com/gosling-lang/gosling.js/commit/5799c96cf1a1c666508c579e8dab665382523361))
* **editor:** change editor theme depending on the theme of gosling spec ([#380](https://github.com/gosling-lang/gosling.js/issues/380)) ([fa9f921](https://github.com/gosling-lang/gosling.js/commit/fa9f921c24a735ec6cad14a1750a3acb8d9a13b2))
* Support bam files ([#374](https://github.com/gosling-lang/gosling.js/issues/374)) ([7adbddf](https://github.com/gosling-lang/gosling.js/commit/7adbddf68c84a78361d294cd9ff89d2758046c33))



# [0.8.0](https://github.com/gosling-lang/gosling.js/compare/v0.7.7...v0.8.0) (2021-05-04)


### Features

* data transformation for string concat and replace ([#366](https://github.com/gosling-lang/gosling.js/issues/366)) ([9cb313e](https://github.com/gosling-lang/gosling.js/commit/9cb313ee283a90dc1de7b6ee1ef23b21e8968cff))
* expose mouse position color to theme and change default color ([#376](https://github.com/gosling-lang/gosling.js/issues/376)) ([85fea1d](https://github.com/gosling-lang/gosling.js/commit/85fea1dc5ede58ed05d1bd3609658a82b5e1017b))
* select example through url ([#367](https://github.com/gosling-lang/gosling.js/issues/367)) ([0c87602](https://github.com/gosling-lang/gosling.js/commit/0c876023c37088ab69c239fec0ad7f70c4eacd83))
* show grid for quantitative y axis ([#377](https://github.com/gosling-lang/gosling.js/issues/377)) ([fd6e181](https://github.com/gosling-lang/gosling.js/commit/fd6e18181c6219ea09a0197079f892201cae1f96))
* show quantitative color legends ([#375](https://github.com/gosling-lang/gosling.js/issues/375)) ([d3782de](https://github.com/gosling-lang/gosling.js/commit/d3782de5658c2a540edac1c483d3277e41560c40))
* support defining custom themes ([#370](https://github.com/gosling-lang/gosling.js/issues/370)) ([9a628f9](https://github.com/gosling-lang/gosling.js/commit/9a628f9da3417f52ecadf2b3617138b7a751d5da))
* support overriding and customizing theme ([#365](https://github.com/gosling-lang/gosling.js/issues/365)) ([c6897e1](https://github.com/gosling-lang/gosling.js/commit/c6897e1a1e8cc57af0d9322e0072ad4ed8593bdd))
* support y-axis ([#373](https://github.com/gosling-lang/gosling.js/issues/373)) ([d049f9e](https://github.com/gosling-lang/gosling.js/commit/d049f9ea75795233ab5482e081a74fe8b6c0235a))



## [0.7.7](https://github.com/gosling-lang/gosling.js/compare/v0.7.6...v0.7.7) (2021-04-19)


### Features

* add 'about' model view ([#347](https://github.com/gosling-lang/gosling.js/issues/347)) ([53cb362](https://github.com/gosling-lang/gosling.js/commit/53cb3625ca79b7364bec756cd149797825d3ef0c))
* add exon split transformation ([#364](https://github.com/gosling-lang/gosling.js/issues/364)) ([1413494](https://github.com/gosling-lang/gosling.js/commit/141349482645d3357442abc1c8fbfbd04ab727dd))
* allow defining track styles in the upper level ([#363](https://github.com/gosling-lang/gosling.js/issues/363)) ([d00b871](https://github.com/gosling-lang/gosling.js/commit/d00b87191a8e7e0000dfe03ea9f8fcf7b6abb8af))
* support a dark theme ([#359](https://github.com/gosling-lang/gosling.js/issues/359)) ([2248fc4](https://github.com/gosling-lang/gosling.js/commit/2248fc493dc39c9420bb903c0c09c8dab793e82d))
* **api:** allow specifying transition duration in zoom ([#358](https://github.com/gosling-lang/gosling.js/issues/358)) ([78db378](https://github.com/gosling-lang/gosling.js/commit/78db378e95784c49013af8fb03abadc9a7bd76d3))



## [0.7.6](https://github.com/gosling-lang/gosling.js/compare/v0.7.5...v0.7.6) (2021-04-13)


### Features

* **api:** zoom to genomic position ([#356](https://github.com/gosling-lang/gosling.js/issues/356)) ([48f3311](https://github.com/gosling-lang/gosling.js/commit/48f331124fd92d4dd3f03b9c1d21ce4abe5eb1ce))



## [0.7.5](https://github.com/gosling-lang/gosling.js/compare/v0.7.4...v0.7.5) (2021-04-13)


### Features

* data transform as ordered array ([#355](https://github.com/gosling-lang/gosling.js/issues/355)) ([38ed0e4](https://github.com/gosling-lang/gosling.js/commit/38ed0e4fde5cfeba7a41ca6ab6bb59ad2a6559d5))
* **api:** zoom to gene ([#353](https://github.com/gosling-lang/gosling.js/issues/353)) ([3021b82](https://github.com/gosling-lang/gosling.js/commit/3021b82350d524fcfa3b55105fae06cd3cebd8c7))
* enable customizing stroke of brush ([#352](https://github.com/gosling-lang/gosling.js/issues/352)) ([b713b94](https://github.com/gosling-lang/gosling.js/commit/b713b948351bec90b21c57cae96f869b4955f708))



## [0.7.4](https://github.com/gosling-lang/gosling.js/compare/v0.7.3...v0.7.4) (2021-04-12)


### Features

* consider filtering specs during fetching tilesets ([#339](https://github.com/gosling-lang/gosling.js/issues/339)) ([3b67a85](https://github.com/gosling-lang/gosling.js/commit/3b67a8551e162f77dc05ddbfa9fd6a38285d250c))
* define type of `chromosome` in `domain` ([#348](https://github.com/gosling-lang/gosling.js/issues/348)) ([6ab6cf7](https://github.com/gosling-lang/gosling.js/commit/6ab6cf767785825ba46fe29fe1b25dadce4fe13c))
* support log transformation ([#344](https://github.com/gosling-lang/gosling.js/issues/344)) ([b6155ce](https://github.com/gosling-lang/gosling.js/commit/b6155cea583417428f0a598a80616f89845298b2))
* support piling up transcript annotations ([#346](https://github.com/gosling-lang/gosling.js/issues/346)) ([f61649b](https://github.com/gosling-lang/gosling.js/commit/f61649b9e5c999f9d2b3bd6720a52c71cb052a5f))



## [0.7.3](https://github.com/gosling-lang/gosling.js/compare/v0.7.2...v0.7.3) (2021-04-07)


### Features

* support tooltips in linear rect and point ([#337](https://github.com/gosling-lang/gosling.js/issues/337)) ([c8d64c1](https://github.com/gosling-lang/gosling.js/commit/c8d64c1e07d47288bde766f4a690287981847e0d))



## [0.7.2](https://github.com/gosling-lang/gosling.js/compare/v0.7.1...v0.7.2) (2021-04-07)


### Bug Fixes

* text-align left to gosling component ([#332](https://github.com/gosling-lang/gosling.js/issues/332)) ([0e2247d](https://github.com/gosling-lang/gosling.js/commit/0e2247df99d8bd174d7050a14da801a367dcefcc))


### Features

* add mark displacement options ([#320](https://github.com/gosling-lang/gosling.js/issues/320)) ([8ead36b](https://github.com/gosling-lang/gosling.js/commit/8ead36b71dd4183d00f87dada5ee637e41a88d31))
* examples with overriding view props in tracks ([#327](https://github.com/gosling-lang/gosling.js/issues/327)) ([3458712](https://github.com/gosling-lang/gosling.js/commit/345871269e10f10384f45606300c5940b9186e65))
* support higlass matrix visualization ([#321](https://github.com/gosling-lang/gosling.js/issues/321)) ([1094142](https://github.com/gosling-lang/gosling.js/commit/10941428cac4d2db9071771079eb2ae2f020daa3))
* vertical track ([#325](https://github.com/gosling-lang/gosling.js/issues/325)) ([f0b95f9](https://github.com/gosling-lang/gosling.js/commit/f0b95f91f94ecdc29a637229ed3dd4e55f538dd9))



## [0.7.1](https://github.com/gosling-lang/gosling.js/compare/v0.7.0...v0.7.1) (2021-03-06)


### Bug Fixes

* allow using track title in circular layouts ([#315](https://github.com/gosling-lang/gosling.js/issues/315)) ([0dd06a8](https://github.com/gosling-lang/gosling.js/commit/0dd06a8de7fd428eba1dd8fafd89ff9d75887bb6))


### Features

* **editor:** allow clicking on the title to open a new tab ([#312](https://github.com/gosling-lang/gosling.js/issues/312)) ([275d757](https://github.com/gosling-lang/gosling.js/commit/275d7572bc225fcfd3fedff4446c810d29adf649))



# [0.7.0](https://github.com/gosling-lang/gosling.js/compare/v0.1.1...v0.7.0) (2021-03-03)


### Bug Fixes

* initially compile no-desc gist ([9a2d05d](https://github.com/gosling-lang/gosling.js/commit/9a2d05dd5cea092be10dc159bd16651ff27fccbe))



## [0.1.1](https://github.com/gosling-lang/gosling.js/compare/v0.1.0...v0.1.1) (2021-03-03)


### Bug Fixes

* arrangement is overriden from parents ([#248](https://github.com/gosling-lang/gosling.js/issues/248)) ([7c589d1](https://github.com/gosling-lang/gosling.js/commit/7c589d1c1ab0431c038be17e8be3dad98b212243))
* close description and code panels in narrow screen ([#288](https://github.com/gosling-lang/gosling.js/issues/288)) ([ee88abb](https://github.com/gosling-lang/gosling.js/commit/ee88abb0977a11699751730cf8f3bf8f7588ead6))
* correctly auto-generate gosling.schema.json ([#234](https://github.com/gosling-lang/gosling.js/issues/234)) ([d89c0d8](https://github.com/gosling-lang/gosling.js/commit/d89c0d83b303561d95840c7a97cfc30042b782b6))
* show dropdown menu and disable screen zoom for proper pinch zoom in visualizations in mobile ([#289](https://github.com/gosling-lang/gosling.js/issues/289)) ([28f2047](https://github.com/gosling-lang/gosling.js/commit/28f2047faefafbdaf8ccdc2bca20e66b659e8843))


### Features

* add error boundary to avoid crash ([#247](https://github.com/gosling-lang/gosling.js/issues/247)) ([8a17d1b](https://github.com/gosling-lang/gosling.js/commit/8a17d1be0d78778f0c8bf935806b22e62d3937c6))
* add gist link icons and support github flavored md ([#301](https://github.com/gosling-lang/gosling.js/issues/301)) ([cd74497](https://github.com/gosling-lang/gosling.js/commit/cd74497cbb1eeeae68537ff361886bcccb428cd4))
* flip y axis if the last track in a view is using `link` marks ([#256](https://github.com/gosling-lang/gosling.js/issues/256)) ([a4fe34c](https://github.com/gosling-lang/gosling.js/commit/a4fe34c957eeff14f27e7bff08e39ea5dee3d60b))
* loading specs from gist ([#263](https://github.com/gosling-lang/gosling.js/issues/263)) ([8a702f3](https://github.com/gosling-lang/gosling.js/commit/8a702f30cf6aa976c1bb6327ef91a47c87fb223e))
* support an inline legend and 'unknown' type assembly ([#252](https://github.com/gosling-lang/gosling.js/issues/252)) ([2ed5ea7](https://github.com/gosling-lang/gosling.js/commit/2ed5ea728df59bde48e5e7f0b474344bc9de3391))
* switch to use glasbey for many categories ([#302](https://github.com/gosling-lang/gosling.js/issues/302)) ([fb4382e](https://github.com/gosling-lang/gosling.js/commit/fb4382e749d0d0458a7205ca5a13c06b78d82443))



# [0.1.0](https://github.com/gosling-lang/gosling.js/compare/v0.0.26...v0.1.0) (2021-02-20)



## [0.0.26](https://github.com/gosling-lang/gosling.js/compare/v0.0.25...v0.0.26) (2021-02-19)


### Bug Fixes

* correctly calculate position of tracks considering overlayOnPreviousTrack ([#227](https://github.com/gosling-lang/gosling.js/issues/227)) ([e2e5b9a](https://github.com/gosling-lang/gosling.js/commit/e2e5b9a9d4befaf2241a6abe3ee7693cf0e469f3))



## [0.0.25](https://github.com/gosling-lang/gosling.js/compare/v0.0.24...v0.0.25) (2021-02-17)


### Bug Fixes

* address a problem when importing a gosling.js package ([c07e3bd](https://github.com/gosling-lang/gosling.js/commit/c07e3bd9fa63778c015482a5f7e309125b28ba20))
* do not crash editor when random color str is used ([#211](https://github.com/gosling-lang/gosling.js/issues/211)) ([c39873e](https://github.com/gosling-lang/gosling.js/commit/c39873e0380b00307a16f52dce7e628fe36aa5ef))
* encode width of triangle same as its height by defualt ([#220](https://github.com/gosling-lang/gosling.js/issues/220)) ([5602e99](https://github.com/gosling-lang/gosling.js/commit/5602e99cabf1460c24f1077fbb93565a41368ffd))
* remove track-level layout definition to prevent using different layouts for tracks in a same view ([#214](https://github.com/gosling-lang/gosling.js/issues/214)) ([be1eaf8](https://github.com/gosling-lang/gosling.js/commit/be1eaf8ddbab8c516ef822bb05f13d4f99036cbd))


### Features

* allow resizing font in editor ([#216](https://github.com/gosling-lang/gosling.js/issues/216)) ([f237e11](https://github.com/gosling-lang/gosling.js/commit/f237e11aaa03bfb78229359eb28e1018327ce1e1))
* support BigWig ([#196](https://github.com/gosling-lang/gosling.js/issues/196)) ([48d5ff4](https://github.com/gosling-lang/gosling.js/commit/48d5ff434e66ba6d855ef08a5b6ac5bc9a1decc5))
* use relative arrangement ([#198](https://github.com/gosling-lang/gosling.js/issues/198)) ([4888b81](https://github.com/gosling-lang/gosling.js/commit/4888b817eba8c72cc7e54fcdfb5fcc3226ec60dd))



## [0.0.24](https://github.com/gosling-lang/gosling.js/compare/v0.0.23...v0.0.24) (2021-02-08)



## [0.0.23](https://github.com/gosling-lang/gosling.js/compare/v0.0.22...v0.0.23) (2021-02-08)



## [0.0.22](https://github.com/gosling-lang/gosling.js/compare/v0.0.21...v0.0.22) (2021-02-08)


### Features

* reduce the pkg size by specifying external libs ([#192](https://github.com/gosling-lang/gosling.js/issues/192)) ([03f4a04](https://github.com/gosling-lang/gosling.js/commit/03f4a0415c735ec897cf3c0ff4d591b6f13e153a))



## [0.0.21](https://github.com/gosling-lang/gosling.js/compare/v0.0.20...v0.0.21) (2021-02-08)



## [0.0.20](https://github.com/gosling-lang/gosling.js/compare/v0.0.19...v0.0.20) (2021-02-08)


### Features

* modify dependency to make the pkg light-weighted ([#191](https://github.com/gosling-lang/gosling.js/issues/191)) ([e7c3b88](https://github.com/gosling-lang/gosling.js/commit/e7c3b889f7857089c0e9f2ba30621586e7ed0692))



## [0.0.19](https://github.com/gosling-lang/gosling.js/compare/v0.0.18...v0.0.19) (2021-02-08)


### Features

* support embedding a Gosling component to a HTML element ([#190](https://github.com/gosling-lang/gosling.js/issues/190)) ([d5f63c1](https://github.com/gosling-lang/gosling.js/commit/d5f63c12321a9ca5dc45514b6ab02322f771bded))



## [0.0.18](https://github.com/gosling-lang/gosling.js/compare/v0.0.17...v0.0.18) (2021-02-07)


### Bug Fixes

* use corret json values type ([76cac9f](https://github.com/gosling-lang/gosling.js/commit/76cac9fb71127d3f2bb6fbca7d1e60b5afcd4f5b))



## [0.0.17](https://github.com/gosling-lang/gosling.js/compare/v0.0.16...v0.0.17) (2021-02-07)


### Bug Fixes

* correctly draw links when strokeWidth is zero ([#186](https://github.com/gosling-lang/gosling.js/issues/186)) ([b968579](https://github.com/gosling-lang/gosling.js/commit/b96857965d5e4978a992ffe6571bdf25ec734ae4))
* default static option for circular layouts is true ([#153](https://github.com/gosling-lang/gosling.js/issues/153)) ([f490765](https://github.com/gosling-lang/gosling.js/commit/f4907657993cd7fd1351ffccbd9cd3717e847506))
* position text on the exact middle ([#172](https://github.com/gosling-lang/gosling.js/issues/172)) ([f2dd2a2](https://github.com/gosling-lang/gosling.js/commit/f2dd2a23efc7adeb77dac815ed39eae6c752546d))
* properly sort data before area ([#173](https://github.com/gosling-lang/gosling.js/issues/173)) ([8e92557](https://github.com/gosling-lang/gosling.js/commit/8e9255748113e3e8b8e797000c4d749ac05e6819))


### Features

* add a data preview panel in the editor ([#175](https://github.com/gosling-lang/gosling.js/issues/175)) ([137b5eb](https://github.com/gosling-lang/gosling.js/commit/137b5eb242cf06cfe2ddb942f6ee7dd7cd9159b4))
* support genome builds ([#178](https://github.com/gosling-lang/gosling.js/issues/178)) ([79a8fd0](https://github.com/gosling-lang/gosling.js/commit/79a8fd03d9a47bb89a934ae6c59ba8da34f15a6d))
* support multiple visibility options ([#159](https://github.com/gosling-lang/gosling.js/issues/159)) ([fe60459](https://github.com/gosling-lang/gosling.js/commit/fe60459b2cb69ba0d6e1d98eaa707479177f7b1b))
* support using superpose with multiple datasets ([38967eb](https://github.com/gosling-lang/gosling.js/commit/38967eb3ee9b01965431564179f0ede95632c03c))



## [0.0.16](https://github.com/gosling-lang/gosling.js/compare/v0.0.15...v0.0.16) (2021-01-24)


### Bug Fixes

* layout of axis and its track should be the same ([#119](https://github.com/gosling-lang/gosling.js/issues/119)) ([83ae75e](https://github.com/gosling-lang/gosling.js/commit/83ae75ec48436822fc829b816ace79ed531bcc33))


### Features

* make plugin axis and brush tracks visible in the package ([34bcaa7](https://github.com/gosling-lang/gosling.js/commit/34bcaa7b89fffe90ecb5fe777c9e450a82811866))



## [0.0.15](https://github.com/gosling-lang/gosling.js/compare/v0.0.14...v0.0.15) (2021-01-22)


### Bug Fixes

* prevent from crash due to unsafe IsDataTrack checking ([5068903](https://github.com/gosling-lang/gosling.js/commit/5068903c137c14a1281703c323934412cb3b07eb))
* use absolute height of rect in circular layout when size is provided ([#109](https://github.com/gosling-lang/gosling.js/issues/109)) ([93ef22b](https://github.com/gosling-lang/gosling.js/commit/93ef22b310b4706cdba52a95c258fe2977659fb8))


### Features

* allow showing axis in circular tracks ([#110](https://github.com/gosling-lang/gosling.js/issues/110)) ([b14769e](https://github.com/gosling-lang/gosling.js/commit/b14769ee21d7774322b340323b889b72374d7ad8))
* circular brush ([#106](https://github.com/gosling-lang/gosling.js/issues/106)) ([8c6001f](https://github.com/gosling-lang/gosling.js/commit/8c6001fac138648f62192fa8b3b99919f007149b))



## [0.0.14](https://github.com/gosling-lang/gosling.js/compare/v0.0.13...v0.0.14) (2021-01-11)


### Bug Fixes

* correctly calculate arrangement of tracks ([04d68a9](https://github.com/gosling-lang/gosling.js/commit/04d68a9d62093ccd21ba11c0eafaf1999c0288a7))
* correctly calculate layout when title is specified ([#82](https://github.com/gosling-lang/gosling.js/issues/82)) ([b2e0130](https://github.com/gosling-lang/gosling.js/commit/b2e01304570a696275360252e65581315252a337))
* do not show y-axis since it is not prepared yet ([#94](https://github.com/gosling-lang/gosling.js/issues/94)) ([c130edd](https://github.com/gosling-lang/gosling.js/commit/c130eddd79c8bec78bec2fbdc08e7e004a91dcb6))
* remove rows where chr info is incorrectly parsed ([#67](https://github.com/gosling-lang/gosling.js/issues/67)) ([1a703ec](https://github.com/gosling-lang/gosling.js/commit/1a703eca99baaa667abee27a9d5d174812cb8f8c))
* superposeOnPreviousTrack of first track is always false ([#71](https://github.com/gosling-lang/gosling.js/issues/71)) ([3f5aa99](https://github.com/gosling-lang/gosling.js/commit/3f5aa995ab1f5bf1712fb04bd2ffeaab83553af7))
* unique editor urls for custom specs work correctly ([#60](https://github.com/gosling-lang/gosling.js/issues/60)) ([f017ef6](https://github.com/gosling-lang/gosling.js/commit/f017ef62fdae7fcf19b0adf105901e1cfb339cc4))
* update control points for clearer bezier curves ([#72](https://github.com/gosling-lang/gosling.js/issues/72)) ([a9ec5f7](https://github.com/gosling-lang/gosling.js/commit/a9ec5f7bc2cd90428a31c184a5bd01293f2bdb96))


### Features

* adaptive axis format considering width/height of track ([#58](https://github.com/gosling-lang/gosling.js/issues/58)) ([43df1e9](https://github.com/gosling-lang/gosling.js/commit/43df1e98db1176d520c1f3658c2dee8ea77abbcf))
* support basic templates for given data type ([#96](https://github.com/gosling-lang/gosling.js/issues/96)) ([81d59eb](https://github.com/gosling-lang/gosling.js/commit/81d59ebd892cc67b86e7a0c372fa69e996a64fb8))
* support turning on/off auto run in editor ([#62](https://github.com/gosling-lang/gosling.js/issues/62)) ([b79c20d](https://github.com/gosling-lang/gosling.js/commit/b79c20dc7978f1c3de2283008894c76c82541630))



## [0.0.13](https://github.com/gosling-lang/gosling.js/compare/v0.0.12...v0.0.13) (2020-12-26)



## [0.0.12](https://github.com/gosling-lang/gosling.js/compare/v0.0.11...v0.0.12) (2020-12-26)



## [0.0.11](https://github.com/gosling-lang/gosling.js/compare/v0.0.10...v0.0.11) (2020-12-26)



## [0.0.10](https://github.com/gosling-lang/gosling.js/compare/v0.0.8...v0.0.10) (2020-12-26)


### Bug Fixes

* add actions/checkout before deploy ([52270eb](https://github.com/gosling-lang/gosling.js/commit/52270eb5fd507e7964ce1297a65c334078bf0710))
* better default for innerRadius and outerRadius ([#45](https://github.com/gosling-lang/gosling.js/issues/45)) ([ff58f0f](https://github.com/gosling-lang/gosling.js/commit/ff58f0f532e8b8e70ecd43fb0c63cf7ae2e34d16))
* build before deploy ([8afe635](https://github.com/gosling-lang/gosling.js/commit/8afe63535a2e85bc5d2035373aa5e5cb79d86613))
* correct url for deploy workflow ([53011bc](https://github.com/gosling-lang/gosling.js/commit/53011bc7f49672349103c47a6919d57109741b8b))
* use access token ([a377398](https://github.com/gosling-lang/gosling.js/commit/a377398767c68c2924ec6837ad66f08360f71e35))


### Features

* allow encoding data to strokeWidth and opacity ([#44](https://github.com/gosling-lang/gosling.js/issues/44)) ([fb8a7f8](https://github.com/gosling-lang/gosling.js/commit/fb8a7f8b44aaee61cb9b05a254b702af04ada71e))
* allow svg export for rect ([#42](https://github.com/gosling-lang/gosling.js/issues/42)) ([14a587a](https://github.com/gosling-lang/gosling.js/commit/14a587a4396d9b5da4399a7604e66ac23a960a75))
* improve editor ui ([#55](https://github.com/gosling-lang/gosling.js/issues/55)) ([f8d3b58](https://github.com/gosling-lang/gosling.js/commit/f8d3b58bb74f145d5ce516e7bdd2e6428bd6048c))
* title and subtitle of view ([#47](https://github.com/gosling-lang/gosling.js/issues/47)) ([d7256e7](https://github.com/gosling-lang/gosling.js/commit/d7256e71ffeb972e0cefdd28be00e536cd6ed0d6))
* unique url to display a custom spec in the editor ([#51](https://github.com/gosling-lang/gosling.js/issues/51)) ([f701126](https://github.com/gosling-lang/gosling.js/commit/f7011263def9ef4fe4bb808dfd81810bc5bd64fd))



## [0.0.8](https://github.com/gosling-lang/gosling.js/compare/v0.0.7...v0.0.8) (2020-12-18)



## [0.0.7](https://github.com/gosling-lang/gosling.js/compare/v0.0.3...v0.0.7) (2020-12-18)



## [0.0.3](https://github.com/gosling-lang/gosling.js/compare/v0.0.1-beta5...v0.0.3) (2020-12-09)



## [0.0.1-beta5](https://github.com/gosling-lang/gosling.js/compare/v0.0.1-beta4...v0.0.1-beta5) (2020-12-09)



## [0.0.1-beta4](https://github.com/gosling-lang/gosling.js/compare/v0.0.1-beta3...v0.0.1-beta4) (2020-11-30)



## [0.0.1-beta3](https://github.com/gosling-lang/gosling.js/compare/v0.0.1-beta2...v0.0.1-beta3) (2020-11-25)



## [0.0.1-beta2](https://github.com/gosling-lang/gosling.js/compare/v0.0.1-beta1...v0.0.1-beta2) (2020-11-24)



## 0.0.1-beta1 (2020-11-23)



