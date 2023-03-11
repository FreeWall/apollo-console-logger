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

const operationTypes = {
  [OperationTypeNode.QUERY]: {
    request: '#E10098',
    response: '#A5006F',
  },
  [OperationTypeNode.MUTATION]: {
    request: '#E17E00',
    response: '#A65D00',
  },
  [OperationTypeNode.SUBSCRIPTION]: {
    request: '#E1B600',
    response: '#A68600',
  },
};

export class ConsoleLoggerLink extends ApolloLink {
  private logId = 0;

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
    if (operationAst) {
      logRequest(operation, operationAst, operationId);
    }

    const startTime = Date.now();

    return forward(operation).map((result) => {
      if (operationAst) {
        logResponse(operation, operationAst, result, startTime, operationId);
      }
      return result;
    });
  }
}

function logRequest(
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
      operationTypes[operationAst.operation].request +
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

function logResponse(
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
      `%c${operation.operationName}%c %c${Date.now() - startTime} ms`,
    'background: ' +
      operationTypes[operationAst.operation].response +
      '; padding: 2px; color: #ffffff; border-radius: 3px;',
    undefined,
    'font-weight: bold;' +
      (success
        ? 'color: #008000;'
        : 'color: #CC0000; text-decoration: underline; text-decoration-style: dotted'),
    undefined,
    'background: #e4e4e4; padding: 2px 4px; border-radius: 3px; font-size: 11px;',
    results,
  );
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
