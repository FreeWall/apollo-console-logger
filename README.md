# Apollo Console Logger

[![npm version](https://img.shields.io/npm/v/@freewall/apollo-console-logger?color=blue)](https://www.npmjs.com/@freewall/apollo-console-logger)
[![publish status](https://img.shields.io/github/actions/workflow/status/FreeWall/apollo-console-logger/publish.yml)](https://github.com/FreeWall/apollo-console-logger/releases/latest)

A console logger link for Apollo Client. Logs request and response of queries and mutations to console.

## Installation

```shell
npm install @freewall/apollo-console-logger
```

## Usage

```js
import { ConsoleLoggerLink } from '@freewall/apollo-console-logger';

const link = ApolloLink.from([
  new ConsoleLoggerLink(),
  new HttpLink({
    uri: '...',
  }),
]);

const client = new ApolloClient({
  link,
  // ...
});
```

### Options

```js
// default values:
new ConsoleLoggerLink({
  colors: {
    query: {
      request: '#E17E00',
      response: '#A65D00',
    },
    mutation: {
      request: '#E10098',
      response: '#A5006F',
    },
  },
  multiline: false,
  responseSize: true,
  responseTime: true,
});
```

## Sample output

![image](/docs/sample-log-output.png)
