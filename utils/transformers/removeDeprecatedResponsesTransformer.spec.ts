import { parseYaml } from './parseYaml.ts';
import { removeDeprecatedResponsesTransformer } from './removeDeprecatedResponsesTransformer.ts';
import { transformSchema } from './transformSchema.ts';

const yamlWithDeprecatedResponses = `
openapi: 3.1.1
paths:
  /events:
    get:
      responses:
        '200':
          description: OK
        '504':
          description: Gateway Timeout
          x-deprecated-response: true
    parameters:
      - name: foo
        in: query
  /events/{event_id}:
    get:
      responses:
        '200':
          description: OK
        '500':
          description: Workspace error
          x-deprecated-response: false
        '504':
          description: Gateway Timeout
          x-deprecated-response: true
    patch:
      responses:
        '200':
          description: OK
`;

describe('removeDeprecatedResponsesTransformer', () => {
  it('removes responses marked with x-deprecated-response: true', () => {
    const result = transformSchema(yamlWithDeprecatedResponses, [removeDeprecatedResponsesTransformer]);
    const parsed = parseYaml(result);

    expect(Object.keys(parsed.paths['/events'].get.responses)).toEqual(['200']);
    expect(Object.keys(parsed.paths['/events/{event_id}'].get.responses)).toEqual(['200', '500']);
  });

  it('keeps responses where x-deprecated-response is not true', () => {
    const result = transformSchema(yamlWithDeprecatedResponses, [removeDeprecatedResponsesTransformer]);
    const parsed = parseYaml(result);

    expect(parsed.paths['/events/{event_id}'].get.responses['500']['x-deprecated-response']).toBe(false);
    expect(Object.keys(parsed.paths['/events/{event_id}'].patch.responses)).toEqual(['200']);
  });

  it('leaves path-level fields that are not operations untouched', () => {
    const result = transformSchema(yamlWithDeprecatedResponses, [removeDeprecatedResponsesTransformer]);
    const parsed = parseYaml(result);

    expect(parsed.paths['/events'].parameters).toEqual([{ name: 'foo', in: 'query' }]);
  });

  it('is a no-op when the document has no paths', () => {
    const yamlWithoutPaths = `
openapi: 3.1.1
components: {}
`;
    const result = transformSchema(yamlWithoutPaths, [removeDeprecatedResponsesTransformer]);
    const parsed = parseYaml(result);

    expect(parsed).toEqual({ openapi: '3.1.1', components: {} });
  });
});
