# tsc-run-scripts-hook

This is a package that will run configured npm scripts after `tsc` is run. It will even follow
project references in your `tsconfig.json` to run their scripts.

## when does this run

We only run scripts under the following conditions:
- the args aren't present: `-h`, `--help`, `-all`, `--clean`
- and if the tsc process exits successfully (0)

The npm scripts will be run as the `tsc` process exits.

## examples

### copy files

Say you want to be able to copy all non-{ts,js} files after typescript builds. You would use the following `tsconfig.json`:

`tsconfig.json`
```
{
  "compilerOptions": { ... },
  "run-scripts": ["build-step:copy-files"]
}
```

`package.json`
```
{
  "scripts": {
    "build-step:copy-files": "copyfiles -u 1 src/**/*.{json,html} dist/",
  },
  ...
  "devDependencies": {
    "copyfiles": "*",
  }
}
```

This would be equivalent to the following when running `$ tsc ...`.
```
$ tsc [-b] # or whatever you use to build
$ npm run build-step:copy-files
| $ copyfiles ...
```

### copy files with project references

Say you want to be able to copy all non-{ts,js} files after typescript builds and you had more than
one project in your repo that you defined using `tsconfig.json`'s `references` field. You would use
the following layout:

`project-a/tsconfig.json`
```
{
  "compilerOptions": { ... },
  "run-scripts": ["build-step:copy-files"],
  "references": [
    { "path": "project-b" }
  ]
}
```

`project-a/package.json`
```
{
  "scripts": {
    "build-step:copy-files": "copyfiles -u 1 src/**/*.{json,html} dist/",
  },
  ...
}
```

`project-b/tsconfig.json`
```
{
  "compilerOptions": { ... },
  "run-scripts": ["build-step:copy-files"]
}
```

`project-b/package.json`
```
{
  "scripts": {
    "build-step:copy-files": "copyfiles -u 1 src/**/*.{json,html} dist/",
  },
  ...
}
```

This would be equivalent to the following when running `$ tsc ...`.
```
[project-a] $ tsc -b
[project-b] $ npm run build-step:copy-files
[project-b] | $ copyfiles ...
[project-a] $ npm run build-step:copy-files
[project-a] | $ copyfiles ...
```

## tsconfig.json: project references

This is particularly helpful in situations with a monorepo and configured tsconfig [project
references](https://www.typescriptlang.org/docs/handbook/project-references.html). By default
without this project, it will compile the references, but not run scripts! This is where
`tsc-run-scripts-hook` comes in handy. It's a lightweight project meant to run npm scripts post
build.
