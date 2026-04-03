/**
 * @generated SignedSource<<1eaff264e4f6ea38df8953dfc2dcd643>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type RemoveObjectInput = {
  objectId: number;
  sessionId: string;
};
export type SAM2ModelRemoveObjectMutation$variables = {
  input: RemoveObjectInput;
};
export type SAM2ModelRemoveObjectMutation$data = {
  readonly removeObject: ReadonlyArray<{
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
  }>;
};
export type SAM2ModelRemoveObjectMutation = {
  response: SAM2ModelRemoveObjectMutation$data;
  variables: SAM2ModelRemoveObjectMutation$variables;
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
    "name": "removeObject",
    "plural": true,
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
    "name": "SAM2ModelRemoveObjectMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SAM2ModelRemoveObjectMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "03f3d96e2b820f0b18fd02edbc8d1c6b",
    "id": null,
    "metadata": {},
    "name": "SAM2ModelRemoveObjectMutation",
    "operationKind": "mutation",
    "text": "mutation SAM2ModelRemoveObjectMutation(\n  $input: RemoveObjectInput!\n) {\n  removeObject(input: $input) {\n    frameIndex\n    rleMaskList {\n      objectId\n      metadata {\n        contoursCoords\n        morphParams\n      }\n      rleMask {\n        counts\n        size\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0cb8b96ca643b6641758e3e6e5c40c60";

export default node;
