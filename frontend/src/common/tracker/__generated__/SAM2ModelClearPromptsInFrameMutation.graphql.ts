/**
 * @generated SignedSource<<ddaba374817417ddb8f72fde6814cb58>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type ClearPromptsInFrameInput = {
  frameIndex: number;
  objectId: number;
  sessionId: string;
};
export type SAM2ModelClearPromptsInFrameMutation$variables = {
  input: ClearPromptsInFrameInput;
};
export type SAM2ModelClearPromptsInFrameMutation$data = {
  readonly clearPromptsInFrame: {
    readonly frameIndex: number;
    readonly rleMaskList: ReadonlyArray<{
      readonly metadata: {
        readonly contoursCoords: ReadonlyArray<ReadonlyArray<ReadonlyArray<number>>>;
        readonly morphParams: string;
      };
      readonly objectId: number;
      readonly rleMask: {
        readonly counts: string;
        readonly size: ReadonlyArray<number>;
      };
    }>;
  };
};
export type SAM2ModelClearPromptsInFrameMutation = {
  response: SAM2ModelClearPromptsInFrameMutation$data;
  variables: SAM2ModelClearPromptsInFrameMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "RLEMaskListOnFrame",
    "kind": "LinkedField",
    "name": "clearPromptsInFrame",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "frameIndex",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "RLEMaskForObject",
        "kind": "LinkedField",
        "name": "rleMaskList",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "objectId",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "MaskMetadata",
            "kind": "LinkedField",
            "name": "metadata",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "contoursCoords",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "morphParams",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "RLEMask",
            "kind": "LinkedField",
            "name": "rleMask",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "counts",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "size",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "SAM2ModelClearPromptsInFrameMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SAM2ModelClearPromptsInFrameMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ee93da298d5789c4f40921aa2efa5629",
    "id": null,
    "metadata": {},
    "name": "SAM2ModelClearPromptsInFrameMutation",
    "operationKind": "mutation",
    "text": "mutation SAM2ModelClearPromptsInFrameMutation(\n  $input: ClearPromptsInFrameInput!\n) {\n  clearPromptsInFrame(input: $input) {\n    frameIndex\n    rleMaskList {\n      objectId\n      metadata {\n        contoursCoords\n        morphParams\n      }\n      rleMask {\n        counts\n        size\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a62346124fb653892c60c16918b27742";

export default node;
