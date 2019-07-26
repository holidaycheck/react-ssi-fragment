# React SSI Fragment

React component for rendering Server Side Includes. For using with MicroFrontend services (or really anything that returns `html`).

## Installation

### With NPM

`npm install --save react-ssi-fragment`

### With Yarn

`yarn add react-ssi-fragment`

## Usage

The component is meant to be used alongside Server Side Rendering (SSR from now on). As such, it's usage looks like this:

### On the Server

```
import { SSIFragment } from '/react-ssi-fragment';

const Component = () => (
  <SSIFragment
    id="container-id"
    url="https://example-micro-frontend.com/microfrontend"
    isOnClient={false}
  />
)
```

### On the Client

```
import { SSIFragment } from '/react-ssi-fragment';

const Component = () => (
  <SSIFragment
    id="container-id"
    url="https://example-micro-frontend.com/microfrontend"
    isOnClient={true}
  />
)
```

## Usage with Typescript

The components interface is typed.
