import type { OpenApiDocument } from '../openapi.ts';

export const DEPRECATED_RESPONSE_EXTENSION = 'x-deprecated-response';

// Removes responses marked with `x-deprecated-response: true` from path operations.
// Used for the docs schema only, SDK schemas keep these responses to avoid breaking changes.
export function removeDeprecatedResponsesTransformer(apiDefinition: OpenApiDocument): void {
  Object.values(apiDefinition.paths ?? {}).forEach((pathItem: any) => {
    Object.values(pathItem ?? {}).forEach((operation: any) => {
      const responses = operation?.responses;
      if (!responses || typeof responses !== 'object') {
        return;
      }

      Object.entries(responses).forEach(([statusCode, response]: [string, any]) => {
        if (response?.[DEPRECATED_RESPONSE_EXTENSION] === true) {
          delete responses[statusCode];
        }
      });
    });
  });
}
