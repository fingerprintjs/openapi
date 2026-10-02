import fs from 'fs';
import { removeDeprecatedResponsesTransformer } from './removeDeprecatedResponsesTransformer.ts';
import { transformSchema } from './transformSchema.ts';

const simpleYaml = fs.readFileSync('./utils/mocks/simple.yaml');
const schemaWithDeprecatedResponses = fs.readFileSync('./utils/mocks/schemaWithDeprecatedResponses.yaml');
const schemaWithDeprecatedResponsesRemoved = fs.readFileSync('./utils/mocks/schemaWithDeprecatedResponsesRemoved.yaml');

const removeDeprecatedResponses = (yaml: string | Buffer) =>
  transformSchema(yaml, [removeDeprecatedResponsesTransformer]);

describe('Test removeDeprecatedResponsesTransformer', () => {
  it('does not modify schema without deprecated responses', () => {
    const result = removeDeprecatedResponses(simpleYaml);
    expect(result.toString()).toEqual(simpleYaml.toString());
  });

  it('removes responses marked with x-deprecated-response: true', () => {
    const result = removeDeprecatedResponses(schemaWithDeprecatedResponses);
    expect(result.toString()).toEqual(schemaWithDeprecatedResponsesRemoved.toString());
  });
});
