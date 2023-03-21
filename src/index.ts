import {
  ApolloLink,
  FetchResult,
  NextLink,
  Observable,
  Operation,
} from '@apollo/client';
import {
  getOperationAST,
  OperationDefinitionNode,
  OperationTypeNode,
} from 'graphql';
import { print } from 'graphql/language/printer';

const defaultOptions: ConsoleLoggerLinkOptions = {
  colors: {
    [OperationTypeNode.QUERY]: {
      request: '#E17E00',
      response: '#A65D00',
    },
    [OperationTypeNode.MUTATION]: {
      request: '#E10098',
      response: '#A5006F',
    },
    /*[OperationTypeNode.SUBSCRIPTION]: {
      request: '#E1B600',
      response: '#A68600',
    },*/
  },
  timings: true,
};

interface ConsoleLoggerLinkOptions {
  colors?: {
    [OperationTypeNode.QUERY]?: {
      request: string;
      response: string;
    };
    [OperationTypeNode.MUTATION]?: {
      request: string;
      response: string;
    };
  };
  timings?: boolean;
}

export class ConsoleLoggerLink extends ApolloLink {
  private logId = 0;
  private options: ConsoleLoggerLinkOptions;

  constructor(options?: ConsoleLoggerLinkOptions) {
    super();

    this.options = {
      colors: {
        [OperationTypeNode.QUERY]:
          options?.colors?.[OperationTypeNode.QUERY] ??
          defaultOptions?.colors?.[OperationTypeNode.QUERY],
        [OperationTypeNode.MUTATION]:
          options?.colors?.[OperationTypeNode.MUTATION] ??
          defaultOptions?.colors?.[OperationTypeNode.MUTATION],
      },
      timings: options?.timings ?? true,
    };
  }

  request(
    operation: Operation,
    forward: NextLink,
  ): Observable<
    FetchResult<Record<string, any>, Record<string, any>, Record<string, any>>
  > | null {
    const operationId = ++this.logId;

    const operationAst = getOperationAST(
      operation.query,
      operation.operationName,
    );

    if (
      operationAst &&
      operationAst.operation != OperationTypeNode.SUBSCRIPTION
    ) {
      this._logRequest(operation, operationAst, operationId);
    }

    const startTime = this.options.timings ? Date.now() : 0;

    return forward(operation).map((result) => {
      if (
        operationAst &&
        operationAst.operation != OperationTypeNode.SUBSCRIPTION
      ) {
        this._logResponse(
          operation,
          operationAst,
          result,
          startTime,
          operationId,
        );
      }
      return result;
    });
  }

  protected _logRequest(
    operation: Operation,
    operationAst: OperationDefinitionNode,
    operationId: number,
  ) {
    console.debug(
      '%c >> ' +
        operationAst.operation +
        ' #' +
        operationId +
        ' %c %c' +
        operation.operationName +
        '%c',
      'background: ' +
        this.options.colors?.[
          operationAst.operation as
            | OperationTypeNode.QUERY
            | OperationTypeNode.MUTATION
        ]?.request +
        '; padding: 2px; color: #ffffff; border-radius: 3px;',
      undefined,
      'color: inherit; font-weight: bold;',
      undefined,
      {
        query: print(operationAst),
        ...(isEmpty(operation.variables)
          ? null
          : { variables: operation.variables }),
        ...(isEmpty(operation.getContext().headers)
          ? null
          : { headers: operation.getContext().headers }),
      },
    );
  }

  protected _logResponse(
    operation: Operation,
    operationAst: OperationDefinitionNode,
    results: FetchResult,
    startTime: number,
    operationId: number,
  ) {
    const success = (results.errors?.length ?? 0) < 1;

    console.debug(
      '%c << ' +
        operationAst.operation +
        ' #' +
        operationId +
        ' %c ' +
        (!success ? '⚠️ ' : '') +
        `%c${operation.operationName}%c` +
        (this.options.timings ? ` %c${Date.now() - startTime} ms` : '%c'),
      'background: ' +
        this.options.colors?.[
          operationAst.operation as
            | OperationTypeNode.QUERY
            | OperationTypeNode.MUTATION
        ]?.response +
        '; padding: 2px; color: #ffffff; border-radius: 3px;',
      undefined,
      'font-weight: bold;' +
        (success
          ? 'color: #008000;'
          : 'color: #CC0000; text-decoration: underline; text-decoration-style: dotted'),
      undefined,
      this.options.timings
        ? 'background: #e4e4e4; padding: 2px 4px; border-radius: 3px; font-size: 11px;'
        : undefined,
      results,
    );
  }
}

function isEmpty(value: unknown) {
  if (!value) {
    return true;
  }

  if (typeof value === 'object') {
    return !Object.keys(value).length;
  }

  return true;
}
