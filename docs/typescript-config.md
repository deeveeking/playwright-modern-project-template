# TypeScript Config

TypeScript config is in `tsconfig.json`.

## Main Settings

| Setting | Value | Meaning |
| --- | --- | --- |
| `target` | `ES2022` | TypeScript compiles code for modern JavaScript. |
| `module` | `Node16` | Uses Node.js module rules. |
| `moduleResolution` | `Node16` | Resolves imports with modern Node.js rules. |
| `strict` | `true` | Enables strict type checks. |
| `esModuleInterop` | `true` | Makes CommonJS and ES module imports easier. |
| `skipLibCheck` | `true` | Skips type checks for library files. |
| `forceConsistentCasingInFileNames` | `true` | Helps avoid wrong file name casing. |
| `types` | `node`, `@playwright/test` | Adds Node.js and Playwright test types. |

## `process`

The project can use `process.env` because `@types/node` is installed and `node` is listed in `types`.

