## [0.9.25](https://github.com/gosling-lang/gosling.js/compare/v0.9.24...v0.9.25) (2022-10-14)


### Bug Fixes

* fix an error when tilePos is undefined ([#819](https://github.com/gosling-lang/gosling.js/issues/819)) ([635b531](https://github.com/gosling-lang/gosling.js/commit/635b5313cec5f163b8845d28eca6e09a57dadad5))
* fix build by adding pubsub ([#820](https://github.com/gosling-lang/gosling.js/issues/820)) ([f4445c6](https://github.com/gosling-lang/gosling.js/commit/f4445c6ba2cc2583d406d6ffcd42daec4d3ff3db))



## [0.9.24](https://github.com/gosling-lang/gosling.js/compare/v0.9.23...v0.9.24) (2022-09-16)


### Features

* add type heirarchy for BarTrack ([#808](https://github.com/gosling-lang/gosling.js/issues/808)) ([e00d145](https://github.com/gosling-lang/gosling.js/commit/e00d1456932ad4d2e47d4f9655e5411c6199b881))
* show `null` `DISTPREVLOGE` from VCF files ([#814](https://github.com/gosling-lang/gosling.js/issues/814)) ([e5282fc](https://github.com/gosling-lang/gosling.js/commit/e5282fc6d2b489251e24a6421fcbdb961a070ee0))



## [0.9.23](https://github.com/gosling-lang/gosling.js/compare/v0.9.22...v0.9.23) (2022-08-26)


### Bug Fixes

* allow custom chromnames in zoomTo api ([#794](https://github.com/gosling-lang/gosling.js/issues/794)) ([bf8948e](https://github.com/gosling-lang/gosling.js/commit/bf8948e2a7328047165c6f5ac2d7d266c0e590a9))
* ensure to use non-null `hgRef` ([#804](https://github.com/gosling-lang/gosling.js/issues/804)) ([9978eb8](https://github.com/gosling-lang/gosling.js/commit/9978eb83d90b85c98c987bb2baa024f11bf26ee2)), closes [#805](https://github.com/gosling-lang/gosling.js/issues/805)
* fix `displace` transform on non-higlass data ([#802](https://github.com/gosling-lang/gosling.js/issues/802)) ([3c3b52b](https://github.com/gosling-lang/gosling.js/commit/3c3b52b6b80a0704bceb1f4f739a77477ff4adbc))
* support using custom chromosome names in genomic domains (`GenomicDomain`); fix `zoomTo()` ([#796](https://github.com/gosling-lang/gosling.js/issues/796)) ([5ea2355](https://github.com/gosling-lang/gosling.js/commit/5ea2355567a2b24e9e73cede87952a8eac142938))


### Features

* add TabularDataFetcher interface ([#803](https://github.com/gosling-lang/gosling.js/issues/803)) ([330278f](https://github.com/gosling-lang/gosling.js/commit/330278fffb7f3190e3ce4b8183ae20660224013c))



## [0.9.22](https://github.com/gosling-lang/gosling.js/compare/v0.9.21...v0.9.22) (2022-08-06)


### Bug Fixes

* correctly infer relative genomic positions in tooltip using assembly ([#770](https://github.com/gosling-lang/gosling.js/issues/770)) ([a81be97](https://github.com/gosling-lang/gosling.js/commit/a81be97e9bc1f1ef0516b8b7a8d3b37effe73eea))
* **editor:** use correct field names in circos example ([#772](https://github.com/gosling-lang/gosling.js/issues/772)) ([29bb840](https://github.com/gosling-lang/gosling.js/commit/29bb8407c7d6fbbe8db60f09f8d37d610d2f0e89))
* use consistent letter case for data types (e.g., `JSONData` → `JsonData`) ([#773](https://github.com/gosling-lang/gosling.js/issues/773)) ([4fa101d](https://github.com/gosling-lang/gosling.js/commit/4fa101da068904f98182dd14212dd40cb92f355f))


### Features

* **api:** capture mouseover event on a track; click event on a linear track ([#774](https://github.com/gosling-lang/gosling.js/issues/774)) ([21edf06](https://github.com/gosling-lang/gosling.js/commit/21edf06b4abdd2f6adcca8d323664147d876ca96))
* **api:** get track information; correctly use assembly in zoom APIs ([#777](https://github.com/gosling-lang/gosling.js/issues/777)) ([e4c3d1f](https://github.com/gosling-lang/gosling.js/commit/e4c3d1fc4dab6289ea64e83cc9b7234403236cd3))
* enable using custom assembly by specifying chrom sizes ([#776](https://github.com/gosling-lang/gosling.js/issues/776)) ([b08334a](https://github.com/gosling-lang/gosling.js/commit/b08334a236d10be804ffd384d0582292fbfcbecb))
* make `column`, `position`, `row` properties optional for `bigwig`, `vector`, and `multivec` ([#769](https://github.com/gosling-lang/gosling.js/issues/769)) ([978a2b3](https://github.com/gosling-lang/gosling.js/commit/978a2b38c454ab991302b75938fc6d8924fc677d))
* make `width` and `height` of track optional ([#779](https://github.com/gosling-lang/gosling.js/issues/779)) ([a52d969](https://github.com/gosling-lang/gosling.js/commit/a52d969d1fdde22ed97d7d9a1d97e46d2ef5fcc8))
* run pre-commit hooks in parallel ([#784](https://github.com/gosling-lang/gosling.js/issues/784)) ([edefd8e](https://github.com/gosling-lang/gosling.js/commit/edefd8e8897684f7a36420d451540ccf539f9d65))



## [0.9.21](https://github.com/gosling-lang/gosling.js/compare/v0.9.20...v0.9.21) (2022-07-14)


### Bug Fixes

* change worker directory from .js to .ts to inject the buffer shim ([#763](https://github.com/gosling-lang/gosling.js/issues/763)) ([351bbe4](https://github.com/gosling-lang/gosling.js/commit/351bbe44bc60c22289a7ed7d939935550f04223c))
* **data-fetchers:** fix error using Buffer in VCF worker ([#758](https://github.com/gosling-lang/gosling.js/issues/758)) ([007c3e1](https://github.com/gosling-lang/gosling.js/commit/007c3e11e0678aab32597a2fa74d4747d4f4f6c0))
* do not make marks disappear when zoomed in very far ([#765](https://github.com/gosling-lang/gosling.js/issues/765)) ([9d279ed](https://github.com/gosling-lang/gosling.js/commit/9d279edd1ebd534e9e32b57ba8f2a66e2deb53d9))



## [0.9.20](https://github.com/gosling-lang/gosling.js/compare/v0.9.19...v0.9.20) (2022-07-03)


### Bug Fixes

* **editor:** fix typo on the mouse event example ([#726](https://github.com/gosling-lang/gosling.js/issues/726)) ([c7be92d](https://github.com/gosling-lang/gosling.js/commit/c7be92d327587c4948291e23911697a04e1246b2))
* fix error when using latest gosling.js by pinning generic-filehandle ([#737](https://github.com/gosling-lang/gosling.js/issues/737)) ([dec0e64](https://github.com/gosling-lang/gosling.js/commit/dec0e6434c39c233cf7cc35fe96c21747f37fa95))
* include types to the bundle; exclude editor types ([#749](https://github.com/gosling-lang/gosling.js/issues/749)) ([1935062](https://github.com/gosling-lang/gosling.js/commit/1935062a2b9261186ae584adef53306e69a450b2))
* override RemoteFile.read to be more flexible ([#743](https://github.com/gosling-lang/gosling.js/issues/743)) ([d27fed4](https://github.com/gosling-lang/gosling.js/commit/d27fed4e338364690d0463b542181c77555031d8))


### Features

* add partial types for `HGC` ([#728](https://github.com/gosling-lang/gosling.js/issues/728)) ([3364b15](https://github.com/gosling-lang/gosling.js/commit/3364b158aac373a8a304687dbeff512d24b76a7d))
* **data-fetchers:** migrate BAM worker to TS ([#739](https://github.com/gosling-lang/gosling.js/issues/739)) ([20e989c](https://github.com/gosling-lang/gosling.js/commit/20e989c232750397a8a7547a6de175671757885b))
* **data-fetchers:** migrate bigwig to TS ([#741](https://github.com/gosling-lang/gosling.js/issues/741)) ([e52b594](https://github.com/gosling-lang/gosling.js/commit/e52b5944da3a3e3f8ced4a50901c0f3f0e8d4b75))
* **data-fetchers:** migrate VCF data-fetcher to TS ([#740](https://github.com/gosling-lang/gosling.js/issues/740)) ([4aba4df](https://github.com/gosling-lang/gosling.js/commit/4aba4df9b273187bab382e959b7c30578771b481))



## [0.9.19](https://github.com/gosling-lang/gosling.js/compare/v0.9.18...v0.9.19) (2022-06-09)


### Bug Fixes

* **editor:** minor bugs when importing & exporting examples ([#701](https://github.com/gosling-lang/gosling.js/issues/701)) ([1fcea27](https://github.com/gosling-lang/gosling.js/commit/1fcea27d1fbb7be84a217682bada6f47ddfbe9c3))
* fix json track errors due to using undefined mRangeBrush ([#716](https://github.com/gosling-lang/gosling.js/issues/716)) ([2ebde84](https://github.com/gosling-lang/gosling.js/commit/2ebde849e3a34e198ab0001157c187569fe80203))
* gist example with jscode ([#684](https://github.com/gosling-lang/gosling.js/issues/684)) ([a94e1c1](https://github.com/gosling-lang/gosling.js/commit/a94e1c1391674c807a518121bf76e49a2a3c9e73))
* out of memory when deploy ([#680](https://github.com/gosling-lang/gosling.js/issues/680)) ([9253f48](https://github.com/gosling-lang/gosling.js/commit/9253f48f7659ccdc00279c3a9107b24f4e48a209))
* remove legend layer in `remove()`; do not render twice on Editor when example ID is specified in URL ([#686](https://github.com/gosling-lang/gosling.js/issues/686)) ([d3f22c9](https://github.com/gosling-lang/gosling.js/commit/d3f22c94f7ef1cbfe1a9e1022c9d6e187833a9fb))
* use assembly in vcf data fetcher ([#698](https://github.com/gosling-lang/gosling.js/issues/698)) ([a2440f6](https://github.com/gosling-lang/gosling.js/commit/a2440f629356199944c766f23760bb64341811e3))


### Features

* capture mouse events on marks for tooltips, hovering effects, and APIs ([#667](https://github.com/gosling-lang/gosling.js/issues/667)) ([0b67659](https://github.com/gosling-lang/gosling.js/commit/0b6765927bf913393d61814ee3761408acd8d283))
* **editor:** compact side panel buttons ([#721](https://github.com/gosling-lang/gosling.js/issues/721)) ([c2526ca](https://github.com/gosling-lang/gosling.js/commit/c2526caa5a9b0046e4677d54c8c9aaddabd7e34e))
* **editor:** preserve spec in session storage ([#722](https://github.com/gosling-lang/gosling.js/issues/722)) ([8597739](https://github.com/gosling-lang/gosling.js/commit/85977396d4f9504ecae7c28cdc4aff006e22d644))
* **editor:** support javascript editor ([#671](https://github.com/gosling-lang/gosling.js/issues/671)) ([410d049](https://github.com/gosling-lang/gosling.js/commit/410d0496af8b5c6cec49b6e446058061ec1f8914))
* **editor:** use current hostname and path for SAVE URL ([#690](https://github.com/gosling-lang/gosling.js/issues/690)) ([7507172](https://github.com/gosling-lang/gosling.js/commit/75071720270d1522e6742c159cd77dd8e869cd71))
* **editor:** visualize JS spec using Gist URL ([#704](https://github.com/gosling-lang/gosling.js/issues/704)) ([0b4c86a](https://github.com/gosling-lang/gosling.js/commit/0b4c86ac39725960de17cf770447c61590c1dfe9))
* enable adding a root level aria-label using description ([#723](https://github.com/gosling-lang/gosling.js/issues/723)) ([88f8894](https://github.com/gosling-lang/gosling.js/commit/88f8894eb103ee90bf7209fff08508f3756cad6f))
* genomic range selection in linear tracks ([#693](https://github.com/gosling-lang/gosling.js/issues/693)) ([8d89b60](https://github.com/gosling-lang/gosling.js/commit/8d89b60836caa40b1696c8747c500766aba3e153))
* support indels in VCF ([#699](https://github.com/gosling-lang/gosling.js/issues/699)) ([377e509](https://github.com/gosling-lang/gosling.js/commit/377e5090886c7a4b91cf1cb4ee5b46fb6091f8c4))
* support VCF with Tabix ([#689](https://github.com/gosling-lang/gosling.js/issues/689)) ([84d9213](https://github.com/gosling-lang/gosling.js/commit/84d92130933f42aa1ac138c92c379645fdd6e796))
* treeshake pkg info in module export ([#694](https://github.com/gosling-lang/gosling.js/issues/694)) ([a12d454](https://github.com/gosling-lang/gosling.js/commit/a12d454fa9272a03ce76a6cb8cc513ed9ed8d694))
* turn off mouse events by default; rename API keys; rename and restructure mouse event properties ([#712](https://github.com/gosling-lang/gosling.js/issues/712)) ([feec1d9](https://github.com/gosling-lang/gosling.js/commit/feec1d9ac9f7b5542e1dea3649ed76a83b6f3a3d))



## [0.9.18](https://github.com/gosling-lang/gosling.js/compare/v0.9.17...v0.9.18) (2022-05-06)


### Bug Fixes

* fix crash on matrix example ([#674](https://github.com/gosling-lang/gosling.js/issues/674)) ([0de295c](https://github.com/gosling-lang/gosling.js/commit/0de295c937dff850dd1f3d40660870eaf6861ddf))
* revert back to use `gMain` in `gosling-brush` ([753a555](https://github.com/gosling-lang/gosling.js/commit/753a555768ce40dc9fc0bf40a790cdcc307ee58d))


### Features

* add data transform to infer sv types ([#676](https://github.com/gosling-lang/gosling.js/issues/676)) ([f31e888](https://github.com/gosling-lang/gosling.js/commit/f31e888d77285dfd6b69d0dc8f32d543eedacb63))
* add straight link for circular withinLink ([#647](https://github.com/gosling-lang/gosling.js/issues/647)) ([02a60ef](https://github.com/gosling-lang/gosling.js/commit/02a60ef435f25d58f6c65731814b91a82a8e44b1))
* allow checking the container size or aspect ratio for using responsive spec ([#652](https://github.com/gosling-lang/gosling.js/issues/652)) ([7555ab7](https://github.com/gosling-lang/gosling.js/commit/7555ab711023a0c3e2076a448756a9ba3eeb04f7))
* allow using one side of diagonal of matrix ([#644](https://github.com/gosling-lang/gosling.js/issues/644)) ([9c19f72](https://github.com/gosling-lang/gosling.js/commit/9c19f7296bea9325c12bab6ed9eaa929fa443370))
* **editor:** add a showcase modal view ([#657](https://github.com/gosling-lang/gosling.js/issues/657)) ([8a56c5e](https://github.com/gosling-lang/gosling.js/commit/8a56c5edabd89ef46ff6a4206ed988958374ef10))
* **editor:** add export to html file ([#672](https://github.com/gosling-lang/gosling.js/issues/672)) ([ddbd1e2](https://github.com/gosling-lang/gosling.js/commit/ddbd1e2201fa19fd3b89737df5918dd1ed876d76))
* **editor:** gallery sidebar ([#659](https://github.com/gosling-lang/gosling.js/issues/659)) ([da5a0c6](https://github.com/gosling-lang/gosling.js/commit/da5a0c65b384f7ad13f149e386a4238711517162))
* replace jest with vitest ([#666](https://github.com/gosling-lang/gosling.js/issues/666)) ([e8eef28](https://github.com/gosling-lang/gosling.js/commit/e8eef2885199e7804449ccbf1ad2da07746e509e))
* support brushes on color legends ([#663](https://github.com/gosling-lang/gosling.js/issues/663)) ([f76a3e5](https://github.com/gosling-lang/gosling.js/commit/f76a3e5b9319e50d10e85464171754de0e872916))
* support clipping rows when using bars ([#643](https://github.com/gosling-lang/gosling.js/issues/643)) ([f858853](https://github.com/gosling-lang/gosling.js/commit/f8588533082e6f3832287f85b1642acb2415c5de))
* treeshake pkg info in module export ([#665](https://github.com/gosling-lang/gosling.js/issues/665)) ([9ca746f](https://github.com/gosling-lang/gosling.js/commit/9ca746fd556b88abfef291a48810131da069d763))
* use reactive rendering for responsive specs ([#645](https://github.com/gosling-lang/gosling.js/issues/645)) ([c00f4f8](https://github.com/gosling-lang/gosling.js/commit/c00f4f8ae2fee485df7d153e56fb970815f649cd))



## [0.9.17](https://github.com/gosling-lang/gosling.js/compare/v0.9.16...v0.9.17) (2022-02-21)


### Features

* **editor:** add options to change screen dimensions ([#632](https://github.com/gosling-lang/gosling.js/issues/632)) ([5f2b67a](https://github.com/gosling-lang/gosling.js/commit/5f2b67a94207d3559deed172eafed508ebdd671f))
* **experimental:** allow defining alternative specs for responsive visualization ([#624](https://github.com/gosling-lang/gosling.js/issues/624)) ([458cc90](https://github.com/gosling-lang/gosling.js/commit/458cc907e0de7a081165a6c40a1e169e15a5c173))
* support 2D annotations using json data ([#641](https://github.com/gosling-lang/gosling.js/issues/641)) ([efb1690](https://github.com/gosling-lang/gosling.js/commit/efb1690337fb76ceac4eaaac0a702abccd430142))
* support checking `aspectRatio` to use responsive spec ([#635](https://github.com/gosling-lang/gosling.js/issues/635)) ([ea96bc0](https://github.com/gosling-lang/gosling.js/commit/ea96bc0e5473a4ebce93aad7af6901e24f6115a9))



## [0.9.16](https://github.com/gosling-lang/gosling.js/compare/v0.9.15...v0.9.16) (2022-01-31)


### Features

* add hot and pink color schemes ([#629](https://github.com/gosling-lang/gosling.js/issues/629)) ([9b170a7](https://github.com/gosling-lang/gosling.js/commit/9b170a7d687d844c7fd9e3724105743b4ba08d40))
* support `yDomain` for 2D tracks ([#627](https://github.com/gosling-lang/gosling.js/issues/627)) ([8675fdc](https://github.com/gosling-lang/gosling.js/commit/8675fdcbfd5f27ad83f9e5b62d1f141122641d0c))



## [0.9.15](https://github.com/gosling-lang/gosling.js/compare/v0.9.14...v0.9.15) (2022-01-24)


### Features

* add responsive sizing options ([#617](https://github.com/gosling-lang/gosling.js/issues/617)) ([0470dd0](https://github.com/gosling-lang/gosling.js/commit/0470dd08df6d3378aedf035c7e24c3c9a0803e47))
* support horizontal rules on matrix ([#620](https://github.com/gosling-lang/gosling.js/issues/620)) ([b205fef](https://github.com/gosling-lang/gosling.js/commit/b205fefc5be727c3a3c1af7374978bb4408d519c))
* support native matrix visualization ([#612](https://github.com/gosling-lang/gosling.js/issues/612)) ([d9c967c](https://github.com/gosling-lang/gosling.js/commit/d9c967c834ad66c35122287d367d3a120ec48692))
* support responsive resizing in circular layouts ([#623](https://github.com/gosling-lang/gosling.js/issues/623)) ([cabaa51](https://github.com/gosling-lang/gosling.js/commit/cabaa512c96faeb65b03d3a3e620a331ada507f2))
* use HiGlass `heatmap` for conventional 2D matrix ([#615](https://github.com/gosling-lang/gosling.js/issues/615)) ([93fac44](https://github.com/gosling-lang/gosling.js/commit/93fac44130b405b008614cf3fc10007b5dbbf6c4))



## [0.9.14](https://github.com/gosling-lang/gosling.js/compare/v0.9.13...v0.9.14) (2021-12-12)


### Bug Fixes

* correct bezier curve condition for if statement ([f525927](https://github.com/gosling-lang/gosling.js/commit/f525927869b65ef33032a85b2b95a97bf95ff858))
* fix circular brush hiccup upon dragging ([#607](https://github.com/gosling-lang/gosling.js/issues/607)) ([50d7ee4](https://github.com/gosling-lang/gosling.js/commit/50d7ee4c33f34e26450e0a7fe66f2ae8aebc66c4))



## [0.9.13](https://github.com/gosling-lang/gosling.js/compare/v0.9.12...v0.9.13) (2021-12-10)


### Bug Fixes

* correctly show arcs when x is larger than xe ([#605](https://github.com/gosling-lang/gosling.js/issues/605)) ([3d8fa38](https://github.com/gosling-lang/gosling.js/commit/3d8fa38faffb57cc5ea2b95b67e9a890ac38ea05))
* do not filter out small `withinLink` marks by default ([#604](https://github.com/gosling-lang/gosling.js/issues/604)) ([dabecd7](https://github.com/gosling-lang/gosling.js/commit/dabecd74ac76d02819457dc568839686b9a858a2))
* do not generate gosling model with undefined tilePos ([#603](https://github.com/gosling-lang/gosling.js/issues/603)) ([42439a8](https://github.com/gosling-lang/gosling.js/commit/42439a85dd94037467f7d65c09ded1bc8d71989f))


### Features

* allow aggregation functions (`mean` and `sum`) for vector, bigwig, and multivec ([#591](https://github.com/gosling-lang/gosling.js/issues/591)) ([5ace48d](https://github.com/gosling-lang/gosling.js/commit/5ace48daa8373fc3bba3f7de4c4d421bd0f03264))
* horizontal and vertical `rule` marks in `linear` layout ([#601](https://github.com/gosling-lang/gosling.js/issues/601)) ([4eca209](https://github.com/gosling-lang/gosling.js/commit/4eca20948c89d42f8b8ffb8b229bfb1b4c78cc6b)), closes [#602](https://github.com/gosling-lang/gosling.js/issues/602) [#603](https://github.com/gosling-lang/gosling.js/issues/603) [#604](https://github.com/gosling-lang/gosling.js/issues/604) [#591](https://github.com/gosling-lang/gosling.js/issues/591)



## [0.9.12](https://github.com/gosling-lang/gosling.js/compare/v0.9.11...v0.9.12) (2021-12-09)


### Features

* allow tooltip and mouse events on circular arc ([#602](https://github.com/gosling-lang/gosling.js/issues/602)) ([40d8809](https://github.com/gosling-lang/gosling.js/commit/40d8809ee89a0ed19735ef5f488a8f0381bf2ca5))



## [0.9.11](https://github.com/gosling-lang/gosling.js/compare/v0.9.10...v0.9.11) (2021-11-29)


### Bug Fixes

* ensure to assign proper `uid`s to overlaid tracks ([#598](https://github.com/gosling-lang/gosling.js/issues/598)) ([066c0d2](https://github.com/gosling-lang/gosling.js/commit/066c0d2d12222fb7b89c7615c725bb85651d7c73))



## [0.9.10](https://github.com/gosling-lang/gosling.js/compare/v0.9.9...v0.9.10) (2021-11-29)


### Features

* add available theme names to `theme.schema.json` ([#570](https://github.com/gosling-lang/gosling.js/issues/570)) ([5115859](https://github.com/gosling-lang/gosling.js/commit/5115859d1d46eaa0a0c278e11ef1baec51d27044))
* allow extracting splice junctions from BAM, flat `withinLink`, toward supporting sashimi plot ([#586](https://github.com/gosling-lang/gosling.js/issues/586)) ([a6ef69e](https://github.com/gosling-lang/gosling.js/commit/a6ef69ebdcec9057e61d4a5303e9dec1af9e004d))
* infer SV types and find mates from `bam` files; add an API to get raw data in JSON format ([#556](https://github.com/gosling-lang/gosling.js/issues/556)) ([2e2fd79](https://github.com/gosling-lang/gosling.js/commit/2e2fd798ec8a0c35c0bd205e9ec6df128b093ae3))
* show loading messages in BAM tracks ([#593](https://github.com/gosling-lang/gosling.js/issues/593)) ([bc9846f](https://github.com/gosling-lang/gosling.js/commit/bc9846fd855d50c34a35255575af52de57b420f4)), closes [#594](https://github.com/gosling-lang/gosling.js/issues/594)
* update higlass.schema.json upon changes on its TS file ([#594](https://github.com/gosling-lang/gosling.js/issues/594)) ([23b7393](https://github.com/gosling-lang/gosling.js/commit/23b739378605cee33edd57ec6d4f65a4fd5d01a4))
* use a default theme in gosling-track when missing ([#584](https://github.com/gosling-lang/gosling.js/issues/584)) ([5b1c242](https://github.com/gosling-lang/gosling.js/commit/5b1c242a6996ff0775e6afbd4588ad61ffab2590))



## [0.9.9](https://github.com/gosling-lang/gosling.js/compare/v0.9.8...v0.9.9) (2021-10-25)


### Bug Fixes

* fix errors with `process` and `global` when gosling.js package is used externally ([#554](https://github.com/gosling-lang/gosling.js/issues/554)) ([6b3a564](https://github.com/gosling-lang/gosling.js/commit/6b3a5640fe2ce95063c08f0b3ffdad674edc5d2b))
* inject Buffer polyfill for BamWorker ([#537](https://github.com/gosling-lang/gosling.js/issues/537)) ([e8c792c](https://github.com/gosling-lang/gosling.js/commit/e8c792c26ce4c9be8e1d19d140faeec8e3642346))
* refer to actual track size instead of spec.width and spec.height for track encoding ([#517](https://github.com/gosling-lang/gosling.js/issues/517)) ([70ace60](https://github.com/gosling-lang/gosling.js/commit/70ace60fa473931f52c8a46bfcdde732c1474366))
* visibility affects on rect and rules; add padding to API types ([#512](https://github.com/gosling-lang/gosling.js/issues/512)) ([2c134ed](https://github.com/gosling-lang/gosling.js/commit/2c134ed43df37be3d555d8a787558dba658e105c))


### Features

* `unknown` assembly does not display `chrN:` on the genomic axis ([#532](https://github.com/gosling-lang/gosling.js/issues/532)) ([19ad4d4](https://github.com/gosling-lang/gosling.js/commit/19ad4d4d67b4306e3d52e8d76987d9ee17b5c842))
* add `gosling.js/embed` package export ([#524](https://github.com/gosling-lang/gosling.js/issues/524)) ([0439755](https://github.com/gosling-lang/gosling.js/commit/0439755c1755bb9f9e412010ca557f4cab174494))
* allow access to HiGlass `ref` from JS API ([#558](https://github.com/gosling-lang/gosling.js/issues/558)) ([2f372ee](https://github.com/gosling-lang/gosling.js/commit/2f372ee41076598a4e245337ac31186bf5ebfc93))
* **api:** support searching for a gene position ([#567](https://github.com/gosling-lang/gosling.js/issues/567)) ([05b82bd](https://github.com/gosling-lang/gosling.js/commit/05b82bd49670cccb212ec414ea89c52db72cd0ea))
* built-in min and max columns for multivec and vector ([#519](https://github.com/gosling-lang/gosling.js/issues/519)) ([41e48d4](https://github.com/gosling-lang/gosling.js/commit/41e48d4313f843e308301596742db22343b448d0))
* **editor:** add a small triangle at the right-end of dropdown menu for affordance ([#520](https://github.com/gosling-lang/gosling.js/issues/520)) ([7ed9a35](https://github.com/gosling-lang/gosling.js/commit/7ed9a3541d6f253cf8aec685329a8445f2b0231f))
* **editor:** support using relative CSV file URLs for Gist specs ([#540](https://github.com/gosling-lang/gosling.js/issues/540)) ([af5f08e](https://github.com/gosling-lang/gosling.js/commit/af5f08e962d4aca0f1f8a34bd97973a4527644b9))
* enable auto doc generate ([#503](https://github.com/gosling-lang/gosling.js/issues/503)) ([de231fe](https://github.com/gosling-lang/gosling.js/commit/de231fe1a7f4b87e3d9695acdef9ad873c23bdbd))
* migrate `uuid` &  `box-intersect` to browser-compatible deps ([#527](https://github.com/gosling-lang/gosling.js/issues/527)) ([d1fbbb3](https://github.com/gosling-lang/gosling.js/commit/d1fbbb3de0fea051f08f42623e1c956ae66bc330)), closes [#532](https://github.com/gosling-lang/gosling.js/issues/532)
* more precise channel types (e.g., `X`, `Y`, and `Color` instead of `Channel`) ([#533](https://github.com/gosling-lang/gosling.js/issues/533)) ([aa2cd62](https://github.com/gosling-lang/gosling.js/commit/aa2cd626f0a43efc8e697cab271b29f02bb1b0c1))
* remove aliases & update gmod deps ([#526](https://github.com/gosling-lang/gosling.js/issues/526)) ([6be5195](https://github.com/gosling-lang/gosling.js/commit/6be5195cd1551b53dc65d72aeb6b7b221c80c65e))
* support `ye` with `bar` ([#518](https://github.com/gosling-lang/gosling.js/issues/518)) ([ef0fd59](https://github.com/gosling-lang/gosling.js/commit/ef0fd595db9cf477a03936afb6799ca078e0be16)), closes [#517](https://github.com/gosling-lang/gosling.js/issues/517) [#519](https://github.com/gosling-lang/gosling.js/issues/519)
* support specifying zoom limits (`zoomLimits`) ([#521](https://github.com/gosling-lang/gosling.js/issues/521)) ([0517bc5](https://github.com/gosling-lang/gosling.js/commit/0517bc58ad2bae89c97c99a76d5f6e36b5980972)), closes [#522](https://github.com/gosling-lang/gosling.js/issues/522) [#505](https://github.com/gosling-lang/gosling.js/issues/505) [#511](https://github.com/gosling-lang/gosling.js/issues/511) [#526](https://github.com/gosling-lang/gosling.js/issues/526)
* support viewing paired reads in BAM files ([#538](https://github.com/gosling-lang/gosling.js/issues/538)) ([109d119](https://github.com/gosling-lang/gosling.js/commit/109d1193ad1e9d196a525f1346ec449fec52db66)), closes [#536](https://github.com/gosling-lang/gosling.js/issues/536) [#537](https://github.com/gosling-lang/gosling.js/issues/537)
* unify ESM/UMD build and development with Vite ([#522](https://github.com/gosling-lang/gosling.js/issues/522)) ([ac7722c](https://github.com/gosling-lang/gosling.js/commit/ac7722c9a9c7c0f72cea2b0a4c17feec5b8bff65)), closes [#505](https://github.com/gosling-lang/gosling.js/issues/505) [#511](https://github.com/gosling-lang/gosling.js/issues/511)



## [0.9.8](https://github.com/gosling-lang/gosling.js/compare/v0.9.7...v0.9.8) (2021-08-30)


### Bug Fixes

* app crash on overriding themes ([#490](https://github.com/gosling-lang/gosling.js/issues/490)) ([8d9cd9e](https://github.com/gosling-lang/gosling.js/commit/8d9cd9ea56fdfa573a7c23075219590e88d54a15))
* do not touch original spec when compiling ([#489](https://github.com/gosling-lang/gosling.js/issues/489)) ([22a0f31](https://github.com/gosling-lang/gosling.js/commit/22a0f3195859003e0a4bf924a41457ffbf6fd2b9)), closes [#488](https://github.com/gosling-lang/gosling.js/issues/488)


### Features

* add reactive rendering as an experimental option ([#488](https://github.com/gosling-lang/gosling.js/issues/488)) ([aeb2269](https://github.com/gosling-lang/gosling.js/commit/aeb22693f3e8365965cb2b8e88e5b3b57bcc4e9f))
* include mouse position visibility to the theme ([#491](https://github.com/gosling-lang/gosling.js/issues/491)) ([5d30675](https://github.com/gosling-lang/gosling.js/commit/5d30675a1b26e4da1e503e5b7cfa7d1138f0d529))



## [0.9.7](https://github.com/gosling-lang/gosling.js/compare/v0.9.6...v0.9.7) (2021-08-28)


### Bug Fixes

* handle embed and use the previous component structure ([#486](https://github.com/gosling-lang/gosling.js/issues/486)) ([143b916](https://github.com/gosling-lang/gosling.js/commit/143b91601a964b381039e649f262b16c0fa48fb7))



## [0.9.6](https://github.com/gosling-lang/gosling.js/compare/v0.9.5...v0.9.6) (2021-08-28)


### Bug Fixes

* get chr sizes directly from bam files ([#483](https://github.com/gosling-lang/gosling.js/issues/483)) ([f4a2482](https://github.com/gosling-lang/gosling.js/commit/f4a248258711281ac5c6f3aa9db0c565e7d3dec0))


### Features

* reactive rendering ([#484](https://github.com/gosling-lang/gosling.js/issues/484)) ([abc2851](https://github.com/gosling-lang/gosling.js/commit/abc2851f835e14a8c2ddf2d7986065b542691f7c))



## [0.9.5](https://github.com/gosling-lang/gosling.js/compare/v0.9.4...v0.9.5) (2021-08-27)


### Bug Fixes

* errors when using `"json"` data ([#481](https://github.com/gosling-lang/gosling.js/issues/481)) ([473fbd0](https://github.com/gosling-lang/gosling.js/commit/473fbd081f8699b06496fb50a8e0e78d4b9c8370))



## [0.9.4](https://github.com/gosling-lang/gosling.js/compare/v0.9.3...v0.9.4) (2021-08-26)


### Bug Fixes

* accurately fetch data when `data` and/or `dataTransform` is defined in individual tracks that are overlaid ([#470](https://github.com/gosling-lang/gosling.js/issues/470)) ([e647386](https://github.com/gosling-lang/gosling.js/commit/e647386c01a92201dd3a4a2e34ce0da6610bf751))
* brushes work correctly regardless of the position of its parent track ([#474](https://github.com/gosling-lang/gosling.js/issues/474)) ([3c4af0f](https://github.com/gosling-lang/gosling.js/commit/3c4af0fe3f456f509f450fa16f18b9e93ec824c7))
* **editor:** do not show default demo before loading gist spec ([#472](https://github.com/gosling-lang/gosling.js/issues/472)) ([04335ae](https://github.com/gosling-lang/gosling.js/commit/04335aef388e3a83197ff58269d2b33d5b71e414))


### Features

* allow click events; add padding for zoomTo APIs ([#477](https://github.com/gosling-lang/gosling.js/issues/477)) ([ffca961](https://github.com/gosling-lang/gosling.js/commit/ffca961caf11e03094180f9e5deca29711f23233))
* bai file url is required ([#480](https://github.com/gosling-lang/gosling.js/issues/480)) ([0e601be](https://github.com/gosling-lang/gosling.js/commit/0e601befd272fd1b103912548cb2203c647bcdd4))
* capture mouse hover event on arcs ([#476](https://github.com/gosling-lang/gosling.js/issues/476)) ([47fffbe](https://github.com/gosling-lang/gosling.js/commit/47fffbe61d496a24b770de8ec9e6b5a50e2d9cd0))
* change cursor style upon mouse hover on marks ([#478](https://github.com/gosling-lang/gosling.js/issues/478)) ([ac9c0b5](https://github.com/gosling-lang/gosling.js/commit/ac9c0b55bed54b1410edcfc62d1d95b31d750c89))



## [0.9.3](https://github.com/gosling-lang/gosling.js/compare/v0.9.2...v0.9.3) (2021-08-18)


### Features

* inline bam worker to the bundle ([#467](https://github.com/gosling-lang/gosling.js/issues/467)) ([95d4f1f](https://github.com/gosling-lang/gosling.js/commit/95d4f1fb97249835952c42807d2904594d1fa88b))



## [0.9.2](https://github.com/gosling-lang/gosling.js/compare/v0.9.1...v0.9.2) (2021-08-17)


### Features

* add explicit PartialTrack def to schema ([#466](https://github.com/gosling-lang/gosling.js/issues/466)) ([c5c9be5](https://github.com/gosling-lang/gosling.js/commit/c5c9be599a5fdd9d375495f6e5d71ffdc364bbab))



## [0.9.1](https://github.com/gosling-lang/gosling.js/compare/v0.9.0...v0.9.1) (2021-08-14)


### Features

* enable showing track titles in circular layouts ([#464](https://github.com/gosling-lang/gosling.js/issues/464)) ([e223377](https://github.com/gosling-lang/gosling.js/commit/e2233778a22bf37ac1ca85fdc7d77e538a1651a7))
* responsive quantitative color legend for compact tracks ([#462](https://github.com/gosling-lang/gosling.js/issues/462)) ([9d56cbe](https://github.com/gosling-lang/gosling.js/commit/9d56cbe242b3c1ef0e0ec726436b935fc7bd0fe7))



# [0.9.0](https://github.com/gosling-lang/gosling.js/compare/v0.8.13...v0.9.0) (2021-08-10)


### Features

* **api:** getCanvas() ([#452](https://github.com/gosling-lang/gosling.js/issues/452)) ([68637db](https://github.com/gosling-lang/gosling.js/commit/68637db32263597e054b7940c0223b5254170804))
* support vertical tracks ([#451](https://github.com/gosling-lang/gosling.js/issues/451)) ([3b502c5](https://github.com/gosling-lang/gosling.js/commit/3b502c54a1660258efbdb361b1def76a19209014))



## [0.8.13](https://github.com/gosling-lang/gosling.js/compare/v0.8.12...v0.8.13) (2021-08-05)


### Features

* expressive BAM rendering ([#446](https://github.com/gosling-lang/gosling.js/issues/446)) ([90c758b](https://github.com/gosling-lang/gosling.js/commit/90c758b5131170ba2f7b35799460a4dc4f9969ea))
* support templates, enable precise and correct track/view sizing and triangle positioning ([#445](https://github.com/gosling-lang/gosling.js/issues/445)) ([aef4657](https://github.com/gosling-lang/gosling.js/commit/aef46571559ef373ce42eb718f56b43948fb1c8d)), closes [#446](https://github.com/gosling-lang/gosling.js/issues/446)



## [0.8.12](https://github.com/gosling-lang/gosling.js/compare/v0.8.10...v0.8.12) (2021-07-26)



## [0.8.10](https://github.com/gosling-lang/gosling.js/compare/v0.8.9...v0.8.10) (2021-07-26)


### Bug Fixes

* draw circular background on the back, not in front of some tiles ([#441](https://github.com/gosling-lang/gosling.js/issues/441)) ([b12f19d](https://github.com/gosling-lang/gosling.js/commit/b12f19d71f6f7874042b84aed3ab8831ebc77c9a))
* ensure the entire height a multiple of 8 ([#442](https://github.com/gosling-lang/gosling.js/issues/442)) ([91f0dae](https://github.com/gosling-lang/gosling.js/commit/91f0dae784811fc82cac7997f64b3e8b96e49e63))



## [0.8.9](https://github.com/gosling-lang/gosling.js/compare/v0.8.8...v0.8.9) (2021-07-20)


### Bug Fixes

* safely use default values when theme in undefined ([#437](https://github.com/gosling-lang/gosling.js/issues/437)) ([67d124b](https://github.com/gosling-lang/gosling.js/commit/67d124bada1d338c19f49a31f925dd4e212fcc44))



## [0.8.8](https://github.com/gosling-lang/gosling.js/compare/v0.8.7...v0.8.8) (2021-07-19)


### Features

* add more theme components like dashed grid, font styles, background colors ([#436](https://github.com/gosling-lang/gosling.js/issues/436)) ([1881e7d](https://github.com/gosling-lang/gosling.js/commit/1881e7df4607e64c2458689ee7f3bc40600a8dd5))



## [0.8.7](https://github.com/gosling-lang/gosling.js/compare/v0.8.6...v0.8.7) (2021-07-12)


### Features

* support more parameters in embed() function ([#435](https://github.com/gosling-lang/gosling.js/issues/435)) ([805fd3d](https://github.com/gosling-lang/gosling.js/commit/805fd3d6158fe9f26cf2612a4dda98849982014a))



## [0.8.6](https://github.com/gosling-lang/gosling.js/compare/v0.8.5...v0.8.6) (2021-07-12)


### Features

* separating `theme` from the main grammar ([#434](https://github.com/gosling-lang/gosling.js/issues/434)) ([bda3a77](https://github.com/gosling-lang/gosling.js/commit/bda3a77ab1d052146344dac949d8b634cce1e5cb))



## [0.8.5](https://github.com/gosling-lang/gosling.js/compare/v0.8.3...v0.8.5) (2021-07-09)


### Bug Fixes

* convert to numbers when quantitative fields are strings ([#402](https://github.com/gosling-lang/gosling.js/issues/402)) ([95212bd](https://github.com/gosling-lang/gosling.js/commit/95212bd42fc8cccf26517ea1da24d35ed7706e8d))
* **editor:** address hiccups in editor ([#411](https://github.com/gosling-lang/gosling.js/issues/411)) ([3025533](https://github.com/gosling-lang/gosling.js/commit/30255337e4eb0a6601319068a8be141edd19b861))
* remove improper loading message in track ([#418](https://github.com/gosling-lang/gosling.js/issues/418)) ([62bf073](https://github.com/gosling-lang/gosling.js/commit/62bf073d6a67bca03ddb5687b9ef4c51f99d3ea2))


### Features

* add `margin` and `border` as props of GoslingComponent ([#420](https://github.com/gosling-lang/gosling.js/issues/420)) ([4df2b2e](https://github.com/gosling-lang/gosling.js/commit/4df2b2e00445a786833ce4a3d79bf1a07837c79c))
* add a between-link mark ([#405](https://github.com/gosling-lang/gosling.js/issues/405)) ([c7a76e2](https://github.com/gosling-lang/gosling.js/commit/c7a76e22df9e7755242a764c70400c6beeb9cdb8))
* allow specifying `id` and `className` in `GoslingComponent` ([#419](https://github.com/gosling-lang/gosling.js/issues/419)) ([30d45a3](https://github.com/gosling-lang/gosling.js/commit/30d45a31b057ee5884b55a14224417dddaee96a4))
* **api:** zoom to extent ([#408](https://github.com/gosling-lang/gosling.js/issues/408)) ([0b3c71f](https://github.com/gosling-lang/gosling.js/commit/0b3c71ff3ab99ee7b5cb445c704c2fe35145be99))
* background of circular tracks, legend titles, and better brush style ([#429](https://github.com/gosling-lang/gosling.js/issues/429)) ([e469efe](https://github.com/gosling-lang/gosling.js/commit/e469efe67c520d10a36c31863a5dab73f3ca2ab9))
* rename link marks to betweenLink and withinLink ([#416](https://github.com/gosling-lang/gosling.js/issues/416)) ([8e7556c](https://github.com/gosling-lang/gosling.js/commit/8e7556cfbfd674ec21e7783df8e37513d0cad7ec))



## [0.8.3](https://github.com/gosling-lang/gosling.js/compare/v0.8.2...v0.8.3) (2021-05-28)


### Features

* allow vertical band connection w/o independent scales yet ([#394](https://github.com/gosling-lang/gosling.js/issues/394)) ([5591e2d](https://github.com/gosling-lang/gosling.js/commit/5591e2d7ba6339c4a5eb7cc6a4e105a3c633c8f0))
* **api:** support mouseover event listener ([#388](https://github.com/gosling-lang/gosling.js/issues/388)) ([e56e32c](https://github.com/gosling-lang/gosling.js/commit/e56e32cdbbcf3a68bb9ecebc45f2ff39d4833c94))



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
* **api:** allow specifying transition duration in zoom ([#358](https://github.com/gosling-lang/gosling.js/issues/358)) ([78db378](https://github.com/gosling-lang/gosling.js/commit/78db378e95784c49013af8fb03abadc9a7bd76d3))
* support a dark theme ([#359](https://github.com/gosling-lang/gosling.js/issues/359)) ([2248fc4](https://github.com/gosling-lang/gosling.js/commit/2248fc493dc39c9420bb903c0c09c8dab793e82d))



## [0.7.6](https://github.com/gosling-lang/gosling.js/compare/v0.7.5...v0.7.6) (2021-04-13)


### Features

* **api:** zoom to genomic position ([#356](https://github.com/gosling-lang/gosling.js/issues/356)) ([48f3311](https://github.com/gosling-lang/gosling.js/commit/48f331124fd92d4dd3f03b9c1d21ce4abe5eb1ce))



## [0.7.5](https://github.com/gosling-lang/gosling.js/compare/v0.7.4...v0.7.5) (2021-04-13)


### Features

* **api:** zoom to gene ([#353](https://github.com/gosling-lang/gosling.js/issues/353)) ([3021b82](https://github.com/gosling-lang/gosling.js/commit/3021b82350d524fcfa3b55105fae06cd3cebd8c7))
* data transform as ordered array ([#355](https://github.com/gosling-lang/gosling.js/issues/355)) ([38ed0e4](https://github.com/gosling-lang/gosling.js/commit/38ed0e4fde5cfeba7a41ca6ab6bb59ad2a6559d5))
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



