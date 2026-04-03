/**
 * @generated SignedSource<<867ea5bae86d1219c9f63f1f566270b5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type useUploadVideoMutation$variables = {
  file: any;
};
export type useUploadVideoMutation$data = {
  readonly uploadVideo: {
    readonly frames: ReadonlyArray<string> | null | undefined;
    readonly height: number;
    readonly id: any;
    readonly originalName: string;
    readonly path: string;
    readonly posterPath: string | null | undefined;
    readonly posterUrl: string;
    readonly url: string;
    readonly width: number;
  };
};
export type useUploadVideoMutation = {
  response: useUploadVideoMutation$data;
  variables: useUploadVideoMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "file"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "file",
        "variableName": "file"
      }
    ],
    "concreteType": "Video",
    "kind": "LinkedField",
    "name": "uploadVideo",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "height",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "width",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "url",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "path",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "posterPath",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "frames",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "posterUrl",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "originalName",
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
    "name": "useUploadVideoMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useUploadVideoMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f7df9dc4a2708b34e42169a0067c9f34",
    "id": null,
    "metadata": {},
    "name": "useUploadVideoMutation",
    "operationKind": "mutation",
    "text": "mutation useUploadVideoMutation(\n  $file: Upload!\n) {\n  uploadVideo(file: $file) {\n    id\n    height\n    width\n    url\n    path\n    posterPath\n    frames\n    posterUrl\n    originalName\n  }\n}\n"
  }
};
})();

(node as any).hash = "67b1f70a4ba03aac0f04fb0631e9d392";

export default node;
