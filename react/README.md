# React

## Build Liferay portlet (`.war`)

1. Build base portlet, for that see step 1 at [build/portlet/README.md](../build/portlet/README.md).

2. Build and bundle the app, package it into a portlet.

   ```sh
   # NOTE: requires base portlet at `art/war/korp-portal-portlet_base.war`
   docker build -t portlet-kp --target portlet react
   docker run --rm -it -v ./art/war/:/art portlet-kp
   # -> outputs `art/war/<date>/<timestamp>.war`,
   #    and copies it to `art/war/korp-portal-portlet.war`.
   ```

3. Deploy to dev Liferay.

   ```sh
   # NOTE: it's best to set filename to the portlet name
   cp -v art/war/korp-portal-portlet.war build/dev/volumes/deploy/
   ```

## Tooling

- docker, alpine
- [vite](https://vite.dev/), build tool
- [yarn](https://yarnpkg.com/), package manager
- [eslint](https://eslint.org/), linter
- [prettier](https://prettier.io/), formatter

## Stack

- react, typescript
- [vercel/swr](https://swr.vercel.app/), data fetching
- [redux](https://redux.js.org/), state management
- [react-router](https://reactrouter.com/), routing
- [immer](https://immerjs.github.io/immer/), immutability helper
- [clsx](https://github.com/lukeed/clsx), react `className` utility
- [yahoo/react-stickynode](https://github.com/yahoo/react-stickynode), sticky component
- [tailwindcss](https://tailwindcss.com/), CSS framework

## Formatting

Imports are grouped (that is, separated from other groups by an empty line) as follows:

- `react` dependencies
- other external dependencies
- imported constants
- internal non-component dependencies (functions, hooks, types)
- internal components
- assets

Code style:

- Arrow functions are used whenever possible.
- No default exports.
