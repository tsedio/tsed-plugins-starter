import {dirname, join, relative} from "node:path";

import {findPackages, MonoRepo} from "@tsed/monorepo-utils";
import fs from "fs-extra";
import globby from "globby";
import cloneDeep from "lodash/cloneDeep.js";
import omit from "lodash/omit.js";

const scriptDir = import.meta.dirname;

async function main() {
  const monoRepo = new MonoRepo({
    rootDir: process.cwd(),
    verbose: false
  });

  const pkgRoot = fs.readJsonSync(join(monoRepo.rootDir, "package.json"));
  const packagesRootDir = join(monoRepo.rootDir, "packages");

  const tsConfigRootPath = join(monoRepo.rootDir, "tsconfig.json");
  const tsConfigTemplate = await fs.readJson(join(scriptDir, "./tsconfig.template.json"));
  const tsConfigTemplateEsmPath = join(scriptDir, "./tsconfig.template.esm.json");
  const tsConfigTemplateSpecPath = join(scriptDir, "./tsconfig.template.spec.json");
  const tsConfigTemplateSpec = await fs.readJson(tsConfigTemplateSpecPath);
  const npmIgnoreTemplatePath = join(scriptDir, "./.npmignore.template");

  const tsConfigRoot = await fs.readJson(tsConfigRootPath);
  tsConfigRoot.references = [];

  const packages = await findPackages(monoRepo);

  const packagesRefsMap = packages.reduce((map, pkg) => {
    if (pkg.pkg.source && pkg.pkg.source.endsWith(".ts")) {
      return map.set(pkg.pkg.name, dirname(pkg.path));
    }
    return map;
  }, new Map());

  for (const pkg of packages) {
    const path = dirname(pkg.path);

    if (pkg.pkg.source && pkg.pkg.source.endsWith(".ts")) {
      const tsConfig = cloneDeep(tsConfigTemplate);
      const tsConfigPath = join(path, "tsconfig.json");
      const tsConfigBuildEsmPath = join(path, "tsconfig.esm.json");
      const tsConfigBuildSpecPath = join(path, "tsconfig.spec.json");
      const npmignore = join(path, ".npmignore");
      const vitestPath = join(path, "vitest.config.mts");
      const vitePath = join(path, "vite.config.mts");

      const hasFiles = await globby(["{src,test}/**/*.spec.ts", "!node_modules"], {
        cwd: path
      });

      // const viteConfigPath = join(path, "vite.config.ts");
      tsConfig.references = [];
      const deps = new Set();

      Object.keys({
        ...(pkg.pkg.peerDependencies || {}),
        ...(pkg.pkg.devDependencies || {}),
        ...(pkg.pkg.dependencies || {})
      })
        .filter((peer) => {
          return packagesRefsMap.has(peer);
        })
        .map((peer) => {
          deps.add(peer);
          tsConfig.references.push({
            path: join(relative(dirname(pkg.path), packagesRefsMap.get(peer)), "tsconfig.json")
          });
        });

      tsConfig.references.push({
        path: "./tsconfig.esm.json"
      });

      if (hasFiles.length) {
        tsConfig.references.push({
          path: "./tsconfig.spec.json"
        });

        const paths = {};

        packages
          .filter((dep) => {
            return (
              ((dep.path.includes("/platform") && !dep.path.includes("serverless")) ||
                dep.path.includes("/components-scan") ||
                dep.path.includes("/spec") ||
                dep.path.includes("/di")) &&
              !deps.has(dep.name) &&
              pkg.name !== dep.name
            );
          })
          .forEach((dep) => {
            paths["@tsed/" + dep.name] = [relative(dirname(pkg.path), dirname(dep.path)) + "/src"];
          });
        const tsCopy = cloneDeep(tsConfigTemplateSpec);
        tsCopy.compilerOptions.paths = paths;
        tsCopy.compilerOptions.rootDir = relative(dirname(tsConfigBuildSpecPath), packagesRootDir);

        if (fs.existsSync(vitestPath)) {
          tsCopy.include.push("vitest.config.mts");
          tsCopy.compilerOptions.types = ["vite/client", "vitest/globals"];
        }

        if (fs.existsSync(vitePath)) {
          tsCopy.include.push("vite.config.mts");
        }

        await fs.writeJSON(tsConfigBuildSpecPath, tsCopy, {spaces: 2});
      }

      await fs.writeJson(tsConfigPath, tsConfig, {spaces: 2});
      await fs.copy(tsConfigTemplateEsmPath, tsConfigBuildEsmPath);
      await fs.copy(npmIgnoreTemplatePath, npmignore);

      tsConfigRoot.references.push({
        path: `./${relative(process.cwd(), path)}/tsconfig.json`
      });

      // if (hasFiles.length) {
      //   tsConfigRoot.references.push(
      //     {
      //       path: `./${relative(process.cwd(), path)}/tsconfig.spec.json`
      //     }
      //   );
      // }

      pkg.pkg = {
        name: pkg.pkg.name,
        description: pkg.pkg.description,
        version: pkg.pkg.version,
        type: "module",
        main: "./lib/esm/index.js",
        ...omit(pkg.pkg, ["name", "description", "version", "main"])
      };
      pkg.pkg.scripts = {
        ...pkg.pkg.scripts,
        "build:ts": "tsc --build tsconfig.json"
      };

      pkg.pkg.devDependencies["@tsed/typescript"] = "workspace:*";
      pkg.pkg.devDependencies["typescript"] = pkgRoot.devDependencies["typescript"];

      if (pkg.pkg.exports && !pkg.pkg.exports["."]) {
        pkg.pkg.exports = {
          ".": {
            ...omit(pkg.pkg.exports, ["require"])
          }
        };
      }

      await fs.writeJson(pkg.path, pkg.pkg, {spaces: 2});
      // try {
      //   fs.removeSync(join(path, "tsconfig.compile.esm.json"));
      //   fs.removeSync(join(path, "tsconfig.compile.json"));
      //   fs.removeSync(join(path, "tsconfig.cjs.json"));
      //   // fs.removeSync(join(path, "tsconfig.esm.json"));
      // } catch {
      // }
    }
  }

  await fs.writeJson(tsConfigRootPath, tsConfigRoot, {spaces: 2});
}

main().catch((e) => {
  console.error(e);
});
