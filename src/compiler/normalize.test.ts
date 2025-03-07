import type { GoslingSpec } from '@gosling-lang/gosling-schema';
import { replaceDisplacements } from './normalize';
import * as uuid from '../core/utils/uuid';

vi.mock('../core/utils/uuid');

describe('normalize spec', () => {
  it('displacement', () => {
    vi.mocked(uuid.uuid).mockReturnValueOnce('random-string');
    const spec: GoslingSpec = {
      tracks: [
        {
          displacement: { type: 'pile' },
          x: { field: 'x' },
          xe: { field: 'xe' }
        }
      ]
    };
    replaceDisplacements(spec);
    expect(spec).toMatchInlineSnapshot(`
      {
        "tracks": [
          {
            "dataTransform": [
              {
                "boundingBox": {
                  "endField": "xe",
                  "padding": undefined,
                  "startField": "x",
                },
                "method": "pile",
                "newField": "random-string",
                "type": "displace",
              },
            ],
            "displacement": {
              "type": "pile",
            },
            "row": {
              "field": "random-string",
              "type": "nominal",
            },
            "x": {
              "field": "x",
            },
            "xe": {
              "field": "xe",
            },
          },
        ],
      }
    `);
  });
});
