# Apollo Console Logger

[![npm version](https://badge.fury.io/js/@freewall%2Fapollo-console-logger.svg)](https://badge.fury.io/js/@freewall%2Fapollo-console-logger)

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
  cache: new InMemoryCache(),
});
```

## Sample output

![image](/docs/sample-output.png)
