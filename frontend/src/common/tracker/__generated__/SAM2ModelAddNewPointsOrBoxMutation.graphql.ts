/**
 * @generated SignedSource<<4767131c0d033d5b28ba3ccb594d1896>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type AddPointsOrBoxInput = {
  box?: ReadonlyArray<number> | null | undefined;
  clearOldPoints: boolean;
  frameIndex: number;
  labels: ReadonlyArray<number>;
  objectId: number;
  points: ReadonlyArray<ReadonlyArray<number>>;
  sessionId: string;
};
export type SAM2ModelAddNewPointsOrBoxMutation$variables = {
  input: AddPointsOrBoxInput;
};
export type SAM2ModelAddNewPointsOrBoxMutation$data = {
  readonly addPointsOrBox: {
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
export type SAM2ModelAddNewPointsOrBoxMutation = {
  response: SAM2ModelAddNewPointsOrBoxMutation$data;
  variables: SAM2ModelAddNewPointsOrBoxMutation$variables;
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
    "name": "addPointsOrBox",
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
    "name": "SAM2ModelAddNewPointsOrBoxMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SAM2ModelAddNewPointsOrBoxMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9ca3a40fccf0980d7fc191f688068612",
    "id": null,
    "metadata": {},
    "name": "SAM2ModelAddNewPointsOrBoxMutation",
    "operationKind": "mutation",
    "text": "mutation SAM2ModelAddNewPointsOrBoxMutation(\n  $input: AddPointsOrBoxInput!\n) {\n  addPointsOrBox(input: $input) {\n    frameIndex\n    rleMaskList {\n      objectId\n      metadata {\n        contoursCoords\n        morphParams\n      }\n      rleMask {\n        counts\n        size\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f6bd38da5f2e1293ac75b873c368341b";

export default node;
