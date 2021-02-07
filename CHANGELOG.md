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



