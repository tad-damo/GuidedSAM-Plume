/**
 * @generated SignedSource<<a760e8b4ae15702ac664f9579ac4ee56>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type SegmenterVideoGalleryQuery$variables = Record<PropertyKey, never>;
export type SegmenterVideoGalleryQuery$data = {
  readonly videos: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly height: number;
        readonly id: any;
        readonly path: string;
        readonly posterPath: string | null | undefined;
        readonly posterUrl: string;
        readonly url: string;
        readonly width: number;
      };
    }>;
  };
};
export type SegmenterVideoGalleryQuery = {
  response: SegmenterVideoGalleryQuery$data;
  variables: SegmenterVideoGalleryQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "VideoConnection",
    "kind": "LinkedField",
    "name": "videos",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "VideoEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Video",
            "kind": "LinkedField",
            "name": "node",
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
                "name": "url",
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
                "name": "height",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "width",
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
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "SegmenterVideoGalleryQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SegmenterVideoGalleryQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "6a1786e2f73a8a9d92eb6d30b63f1572",
    "id": null,
    "metadata": {},
    "name": "SegmenterVideoGalleryQuery",
    "operationKind": "query",
    "text": "query SegmenterVideoGalleryQuery {\n  videos {\n    edges {\n      node {\n        id\n        path\n        posterPath\n        url\n        posterUrl\n        height\n        width\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "34015bb17c024b6a9a2a25e22c2bcef5";

export default node;
