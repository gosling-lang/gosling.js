# Contributing
**We welcome and greatly appreciate your contribution to this project!**

While contribution guidelines are loosely defined, we recommend to read the following contents to make your contribution process more efficient.

## Getting Started

We use pnpm (and not NPM) to manage dependencies in stable and consistent ways. 

After installing [pnpm](https://pnpm.io/installation), clone this repository and run the following commands to install all dependencies and run the Gosling.js editor locally. We recommend you use Node 20. 

```sh
git clone https://github.com/gosling-lang/gosling.js.git # Clone the repository to your current directory
cd gosling.js                                            # Navigate to gosling repository
pnpm install                                             # Install dependencies 
pnpm start                                               # Start a local server running the Gosling online editor 
```

Then, you can open http://localhost:3000/ in a web browser to test the online editor.

## Commit Messages

We use [commitlint](https://github.com/conventional-changelog/commitlint#what-is-commitlint) to maintain commit messages in a consistent manner and automatically update a [CHANGELOG.md](/CHANGELOG.md) based on the commit messages.

The allowed pattern of commit messages is:

```sh
type(scope?): subject  # scope is optional; multiple scopes are supported (current delimiter options: "/", "\" and ",")
```

where `type` can be either `feat`, `fix`, `ci`, `chore`, `docs`, `perf`, `refactor`, or `test`.

Additionally, `scope` should be defined for `feat` and `fix` which should be one of the following: 

- `core`: any general updates to the library, e.g., grammar change, new rendering, etc.
- `track`: any updates that are specific to tracks in the library, including `gosling-track` and `gosling-axis`.
- `data-fetcher`: any updates related to data fetchers
- `editor`: UI and other updates to the online editor
- `api`: the Gosling APIs

Example commit messages are as follows:

```sh
git commit -m 'fix(core): correctly position views'
git commit -m 'feat(editor): add a data preview panel in editor'
git commit -m 'docs: add details about commitlint in README.md'
```

To learn more about the commitlint, please visit [conventional-changelog/commitlint](https://github.com/conventional-changelog/commitlint#what-is-commitlint).

## Opening Pull Requests
We use the [commitlint](#commitlint) for the title of PR. So, if the title of PR is not following the commitlint conventions, [Semantic Pull Request](https://github.com/zeke/semantic-pull-requests) will complain about it, disallowing your PR to be merged. When your PR is accepted and merged into the master branch, the title of the PR will be recorded as a single commit message which will then added as a single item in [CHANGELOG.md](/CHANGELOG.md).

## Testing 

Gosling.js uses [Vitest](https://vitest.dev/) for running tests. To run all of the tests, you can use the command `pnpm test`. 

## Testing Production Build Using Editor

It is sometimes necessary to test the production build of Gosling.js. This frequently happened to us when we needed to ensure that certain data fetchers, like BAM and VCF, work correctly without errors in a deployed app.

To test this, you need to build the project first and then preview the production build.

```sh
pnpm build
pnpm build-editor
pnpm preview
```

## Editing `gosling.js/embed`

This repo also contains the source code for `gosling.js/embed`, an ES Module intended to be
used in [Observable notebooks](https://observablehq.com). You can start the development server
via:

```sh
pnpm start-embed
```

and open a new Observable notebook with a cell containing,

```javascript
embed = {
    const mod = await import("http://localhost:3000/embed/index.ts");
    return mod.embed;
}
```

You are now able to edit the contents of `src/` and the chages should be reflected
in the notebook. You may fork [this notebook](https://observablehq.com/@manzt/gosling-api)
to get started.


## Editing Grammar
You may want to edit the grammar (e.g., rename properties) and test the updated grammar in the Online Editor. The Gosling's grammar is defined using TypeScript in a single file, [/src/core/gosling.schema.ts](/src/core/gosling.schema.ts). You can update this file to edit grammar. However, to test with Online Editor, you need to update [/src/core/gosling.schema.json](/src/core/gosling.schema.json) by running the following command:

```sh
pnpm schema
```

This will create the `gosling.schema.json` file based on the `gosling.schema.ts`. The reason for updating the `*.json` file is that the Online Editor only compiles the gosling spec only if the specification is valid depending of the `gosling.schema.json`. Therefore, if you edit the grammar and do not update the `gosling.schema.json` file, the Online Editor will not compile the spec, showing an empty view.

`gosling.schema.json` is updated everytime when you `commit` changes, so you do not have to run `pnpm schema` by yourselves before the `commit`.

### Editing Grammar for Documentation
Since `gosling.schema.json` is used to semi-automatically generate property tables in [Gosling Documentation](http://gosling-lang.org/docs), we highly recommend you to **provide comments** for added/modified grammar properties in `gosling.schema.ts`. These comments will be used to explain properties in the documentation (e.g., [BigWig Data](http://gosling-lang.org/docs/data#bigwig-no-higlass-server)).
When writing the comments:
- Please use block comment (`/** */`) rather than line comment (`//`) when describing a property. 
  Only the block comment before a property will be converted into the description of this property in `gosling.schema.json`.
- Please write the comment in Markdown syntax (e.g., `__Default__`).
- No need to specify a) whether a property is required or b) the acceptable values for a string property. Such information will be generated automatically. 
- Please add `__Default:__ default_value` line at the end to describe the property's default value.
- To ignore certain comment statements being used for documentation, add the following kewords: `deprecated`, `experimental`, `not supported`, and `internal`.

## Adding Dependencies

- Avoid adding dependencies if possible. npm is an incredibly rough surface with packages using various module systems (CJS, UMD, AMD, ESM) with a wide variety of environment targets (node.js, specific browsers, etc). This makes a lot of work for bundlers since it needs cover all edge cases. Often times older packages will have code execute at runtime (on import) in an attempt to run universally (e.g., inspecting the global for define, exports, process, __webpack__*). We use modern ESM for Gosling's distribution, so we have more confidence that our own source code will be able to be bundled in comparison to others.

- Look at Web APIs for a feature before npm. Remember we are targeting modern browsers (Chrome, Firefox, Safari), and that a native Web APIs which can very often be used instead of some package. Web APIs are stable standards (rarely changed or deprecated) and will not need updating like a npm package (e.g. bumping versions). Using a Web API is basically "free" since there is no worry about how the feature is packaged and the APIs are native to the browsers.

- If you do need a dependency from npm, look carefully at the source code and it's dependencies. Inclusion of a dependency shouldn't be taken lightly and requires several considerations. When was the last time the package was updated? How active is the community? Is the package designed for browsers or does it rely on node builtins (fs, util, Buffer) that will need to polyfill? If you just require a single function from a dependency, it can be easier to copy and paste the source code with a comment into our repo.

(Original post: https://github.com/gosling-lang/gosling.js/pull/714#issuecomment-1146488723)

## Adding Examples to the Editor

If there is an example you would like to add to the editor example library, please follow the instructions below. 

1. Add a thumbnail for your example to `editor/example/thumbnails`. We try to keep the width of each thumbnail under 500px, so please resize the image using your favorite image resizing tool. 

2. Import your thumbnail image to `editor/example/thumbnails.ts` and add it to the `THUMBNAILS` object. 

3. Add your new example specification file to either `editor/example/json-spec` or `editor/example/spec` depending on whether the example is specified in JSON or Javascript. 

4. In `editor/example/index.ts`, import your specification file. Add another object to the `examples` object with the properties `group`, `name`, `spec`, and `image`, where `image` is your thumbnail added to the `THUMBNAILS` object. 

5. Select the example in the editor to make sure your example works as expected. 

## Bumping Gosling.js

GitHub Action handles bumping the version of Gosling.js. The pattern looks like the following:

```
pnpm version --patch
git push origin master --tags
```

# Internal Explanations  
## How does a Gosling spec get turned into a HiGlass spec?
A Gosling schema goes through the following steps: 

1. **Preprocessing**: The implicit aspects of the Gosling schema is made explicit here. Default values are added, properties set in parent elements are added to child elements, and IDs for every Gosling track and view are generated if they aren't specified by the user. 
2. **Track data intermediate representation**: From the preprocessed schema, a Gosling track-based intermediate representation is created. All the information from the schema gets converted into an array of Gosling track data objects, each with track-specific data. What happens to Gosling views? View specifications get applied to each track intermediate representation. 
3.  **HiGlass schema generation**: By iterating over the Gosling track intermediate representations, a HiGlass schema is generated. Each Gosling track corresponds to a HiGlass view. This HiGlass view will contain one or more HiGlass track, depending on the Gosling track it was derived from. 

One important nuance to the Gosling schema to HiGlass schema conversion is that there is not a direct correspondence between Gosling tracks and view and HiGlass tracks and views. Instead, each Gosling track corresponds to a HiGlass view. Please examine the relationship between the view and track IDs.  

- **Gosling track ID**: ID that is associated with each track. It is set by the user or is generated during the preprocessing step. 
- **Gosling view ID**: ID associated with each view. It is set by the user or is generated during the preprocessing step.   
- **HiGlass track ID**: The HiGlass track ID is the same as the Gosling track ID with `-track` appended to it. 
- **HiGlass view ID**: Each HiGlass view has an ID, and *this ID is the same as the Gosling track ID.* An instance of GoslingTrackClass knows what the Gosling track ID is by calling `context.viewUid`, which is the HiGlass view ID which is the same as the Gosling track ID. 

The one exception to this are overlaid tracks where the `id` defined at the root level of an overlaid track is used as the HiGlass' view ID. This limits the number of gosling-track instances generated (i.e., multiple tracks that are overlaid can share the same data, hence reducing the number of data requests).
```
tracks: [
   { ..., id: '1' }, // ← This is a track in Gosling. This becomes a HiGlass view '1'
   { ..., alignment: 'overlay', id: '2', // ← This is actually a view in Gosling, but this becomes a HiGlass view '2'
      tracks: [ 
         { ..., id: '3' }, // ← This track is included in a HiGlass view '2'
         { ..., id: '4' }, // ← This track is included in a HiGlass view '2'
   ]}
]
```