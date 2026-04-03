/**
 * @generated SignedSource<<2e45a6a15bd587299914e3b1e2f0f5ff>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type ClearPromptsInVideoInput = {
  sessionId: string;
};
export type SAM2ModelClearPromptsInVideoMutation$variables = {
  input: ClearPromptsInVideoInput;
};
export type SAM2ModelClearPromptsInVideoMutation$data = {
  readonly clearPromptsInVideo: {
    readonly success: boolean;
  };
};
export type SAM2ModelClearPromptsInVideoMutation = {
  response: SAM2ModelClearPromptsInVideoMutation$data;
  variables: SAM2ModelClearPromptsInVideoMutation$variables;
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
    "concreteType": "ClearPromptsInVideo",
    "kind": "LinkedField",
    "name": "clearPromptsInVideo",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "success",
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
    "name": "SAM2ModelClearPromptsInVideoMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SAM2ModelClearPromptsInVideoMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d89a4198031418254ee2c6dd9c060649",
    "id": null,
    "metadata": {},
    "name": "SAM2ModelClearPromptsInVideoMutation",
    "operationKind": "mutation",
    "text": "mutation SAM2ModelClearPromptsInVideoMutation(\n  $input: ClearPromptsInVideoInput!\n) {\n  clearPromptsInVideo(input: $input) {\n    success\n  }\n}\n"
  }
};
})();

(node as any).hash = "be6daa10b6e1357edb06631c2dddbc16";

export default node;
