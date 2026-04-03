/**
 * @generated SignedSource<<f457eacd20a61cba601921caee2a18f5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import {ConcreteRequest, Query} from 'relay-runtime';
export type SegmenterPageQuery$variables = Record<PropertyKey, never>;
export type SegmenterPageQuery$data = {
  readonly defaultVideo: {
    readonly height: number;
    readonly path: string;
    readonly posterPath: string | null | undefined;
    readonly posterUrl: string;
    readonly url: string;
    readonly width: number;
  };
};
export type SegmenterPageQuery = {
  response: SegmenterPageQuery$data;
  variables: SegmenterPageQuery$variables;
};

const node: ConcreteRequest = (function () {
  var v0 = [
    {
      alias: null,
      args: null,
      concreteType: 'Video',
      kind: 'LinkedField',
      name: 'defaultVideo',
      plural: false,
      selections: [
        {
          alias: null,
          args: null,
          kind: 'ScalarField',
          name: 'path',
          storageKey: null,
        },
        {
          alias: null,
          args: null,
          kind: 'ScalarField',
          name: 'posterPath',
          storageKey: null,
        },
        {
          alias: null,
          args: null,
          kind: 'ScalarField',
          name: 'url',
          storageKey: null,
        },
        {
          alias: null,
          args: null,
          kind: 'ScalarField',
          name: 'posterUrl',
          storageKey: null,
        },
        {
          alias: null,
          args: null,
          kind: 'ScalarField',
          name: 'height',
          storageKey: null,
        },
        {
          alias: null,
          args: null,
          kind: 'ScalarField',
          name: 'width',
          storageKey: null,
        },
      ],
      storageKey: null,
    },
  ];
  return {
    fragment: {
      argumentDefinitions: [],
      kind: 'Fragment',
      metadata: null,
      name: 'SegmenterPageQuery',
      selections: v0 /*: any*/,
      type: 'Query',
      abstractKey: null,
    },
    kind: 'Request',
    operation: {
      argumentDefinitions: [],
      kind: 'Operation',
      name: 'SegmenterPageQuery',
      selections: v0 /*: any*/,
    },
    params: {
      cacheID: '71cbafce4d2d047acdc54d86504f2d2e',
      id: null,
      metadata: {},
      name: 'SegmenterPageQuery',
      operationKind: 'query',
      text: 'query SegmenterPageQuery {\n  defaultVideo {\n    path\n    posterPath\n    url\n    posterUrl\n    height\n    width\n  }\n}\n',
    },
  };
})();

(node as any).hash = '63c9465d78b30d42d6fc11e50a9af142';

export default node;
