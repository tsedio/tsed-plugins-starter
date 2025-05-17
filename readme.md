<p style="text-align: center" align="center">
 <a href="https://tsed.dev" target="_blank"><img src="https://tsed.dev/tsed-og.png" width="200" alt="Ts.ED logo"/></a>
</p>

<div align="center">
  <h1>Ts.ED - Repository template to create and publish plugins</h1>

  <br />
<div align="center">
  <a href="https://cli.tsed.dev/">Website</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://cli.tsed.dev/getting-started.html">Getting started</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://slack.tsed.dev">Slack</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://twitter.com/TsED_io">Twitter</a>
</div>
  <hr />
</div>


This repository provides a template for developing, testing, and publishing plugins for the [Ts.ED](https://tsed.io) framework, using a monorepo architecture.

## ✨ Features

* **Monorepo structure** — All plugins are organized under the `packages/` directory.
* **CI/CD ready** — GitHub Actions are configured to build and publish packages automatically.
* **Code quality tools** — Includes pre-configured [ESLint](https://eslint.org/), [Prettier](https://prettier.io/), and [Commitlint](https://commitlint.js.org/) to ensure consistency across the codebase.
* **Testing** — Uses [Vitest](https://vitest.dev/) for unit testing.
* **Scalable** — Easily add and manage multiple packages in a single repository.

## 🚀 Getting Started

Install project dependencies:

```bash
yarn install
```

## 🛠️ Build

To build all packages in the monorepo and generate their respective `dist/` folders, run:

```bash
yarn build
```

---

## 🧱 Adding a New Plugin

To create a new plugin in the monorepo:

1. Use the following command to create a new workspace:

   ```bash
   yarn workspace create @tsed/my-plugin
   ```

   Or manually create a folder under `packages/`:

   ```bash
   mkdir packages/my-plugin
   cd packages/my-plugin
   yarn init -y
   ```

2. Copy files from the `packages/plugin-example/` directory to your new plugin directory. The structure should look like this`:

   ```
   packages/
   └── my-plugin/
       ├── src/
       │   └── index.ts
       ├── test/
       │   └── integration.spec.ts (optional)
       ├── .gitignore 
       ├── .npmignore
       ├── package.json
       ├── readme.md
       ├── tsconfig.esm.json
       └── vitest.config.mts
   ```

3. Run `yarn build:references` to generate the paths in `tsconfig.*.json` files.
4. Build your plugin:

   ```bash
   yarn build
   ```

---

## 🚢 Publishing Workflow

Package publishing is automated via GitHub Actions.

* Each plugin has its own version defined in its `package.json` but monorepo tools update all package version with the same version number.
* On each push to the `main` branch:
  * The `build.yml` workflow is triggered.
  * It uses semantic release to increment the version based on commit messages.
  * All packages are automatically published to the NPM registry.

## Contributors

Please read [contributing guidelines here](https://tsed.dev/CONTRIBUTING.html)

<a href="https://github.com/tsedio/ts-express-decorators/graphs/contributors"><img src="https://opencollective.com/tsed/contributors.svg?width=890" /></a>

## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/tsed#backer)]

<a href="https://opencollective.com/tsed#backers" target="_blank"><img src="https://opencollective.com/tsed/tiers/backer.svg?width=890"></a>

## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/tsed#sponsor)]

## License

The MIT License (MIT)

Copyright (c) 2016 - Today Ts.ED

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
