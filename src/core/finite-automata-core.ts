import { INetworkData, IDfaResponse } from "../types";
import { START_NODE_ID, EMPTY_EDGE_LABEL_SIGN } from "../utils/constants";
import { Edge, IdType } from "vis-network";
import { Node } from "../types";
import { uuidv4 } from "../utils/functions";
import { checkIsDataCorrect, getNextNodes, isEmptyEdge, generateResponse } from "./helpers";

/**
 * Do pre processing of network as required
 * Add extra edges if any multi length labels are found.
 *
 *  input:
 *  1. q1 --b --> q2
 *          a
 *  output:
 *  1. q1 --a--> q2
 *  2. q1 --b--> q2
 */
export function preProcessFinite(edges: Array<any>) {
  const edgesLength = edges.length;

  for (let edgeIndex = 0; edgeIndex < edgesLength; ) {
    const edge = edges[edgeIndex];

    const edgeLabelArray = edge.label.split("\n");
    const edgeTo = edge.to;

    if (edgeLabelArray.length > 1) {
      for (let index = 0; index < edgeLabelArray.length; index++) {
        const edgeLabel = edgeLabelArray[index].trim();
        let previousTo = edge.from;

        /**
         * Iterate over each character of edge and create a new edge.
         */
        for (let edgeLabelIndex = 0; edgeLabelIndex < edgeLabel.length; edgeLabelIndex += 1) {
          // creating and adding new edge
          const newEdge = {
            id: uuidv4(),
            from: "",
            to: "",
            label: "",
          };
          newEdge.from = previousTo;
          if (edgeLabelIndex + 1 === edgeLabel.length) {
            debugger;
            newEdge.to = edgeTo;
          } else {
            newEdge.to = uuidv4();
            previousTo = newEdge.to;
          }
          newEdge.label = edgeLabel.charAt(edgeLabelIndex);
          edges.push(newEdge);
        }
      }

      //deleting preprocessed edge
      edges.splice(edgeIndex, 1);
    } else {
      edgeIndex += 1;
    }
  }
}

function isUniqueEdges(edges: Edge[]): boolean {
  const edgesLength = edges.length;
  for (let edgeIndex = 0; edgeIndex < edgesLength; edgeIndex += 1) {
    const edge = edges[edgeIndex];
    for (let searchIndex = edgeIndex + 1; searchIndex < edgesLength; searchIndex += 1) {
      const searchEdge = edges[searchIndex];
      if (edge.from === searchEdge.from && edge.label === searchEdge.label) {
        return false;
      }
    }
  }
  return true;
}

function hasEmptyEdges(edges: Edge[]): boolean {
  if (edges.length) {
    const edgeWithEmptySymbol = edges.find(
      (edge) => edge.label === EMPTY_EDGE_LABEL_SIGN.EPSILON || edge.label === EMPTY_EDGE_LABEL_SIGN.LAMBDA
    );
    if (edgeWithEmptySymbol !== undefined) {
      return true;
    }
  }
  return false;
}

/**
 * checks if the network is a valid DFA
 *
 * @param nodes
 * @param edges
 * @return boolean
 */
function isValidDFA(edges: Array<Edge>): boolean {
  /**
   * DFA edges should be deterministic.
   * For a given state and a given input alphabet there should be only one edge
   */
  return isUniqueEdges(edges) && !hasEmptyEdges(edges);
}

function imitateDFA(inputString: string, data: INetworkData): IDfaResponse {
  if (checkIsDataCorrect(data)) {
    const nodes = data.nodes.get();
    const edges = data.edges.get();

    preProcessFinite(edges);

    const nodesLength = nodes.length;
    const edgesLength = edges.length;

    const isDetermistic = isValidDFA(edges);

    const inputStringLength = inputString.length;
    if (isDetermistic) {
      let currentNode: IdType = START_NODE_ID;

      for (let inputIndex = 0; inputIndex < inputStringLength; inputIndex++) {
        const inputChar = inputString[inputIndex];
        /**
         *  lets  suppose that for the given input alphabet we don't have a valid edge with the given node.
         *  we shouldn't be traversing further
         */
        let toContinueSearch = false;
        for (let edgeIndex = 0; edgeIndex < edgesLength; edgeIndex++) {
          const edge = edges[edgeIndex];
          if (edge.to && edge.from === currentNode && edge.label === inputChar) {
            currentNode = edge.to;
            toContinueSearch = true;
            break;
          }
        }
        if (!toContinueSearch) {
          return generateResponse(isDetermistic, false);
        }
      }

      /**
       * check if the node we end up on is final node or not
       */
      for (let index = 0; index < nodesLength; index += 1) {
        const node = nodes[index];
        if (node.id === currentNode && node.final) {
          //return generateResponse(isValid, true, node.label);
          return generateResponse(isDetermistic, true, node.label);
        }
      }
      //return generateResponse(isValid, false);
      return generateResponse(isDetermistic, false);
    } else {
      const startNode = nodes.find((n) => n.id === START_NODE_ID);
      if (startNode) {
        const final = testNondetermistic(inputString, nodes, edges, startNode);
        if (final == null) {
          return generateResponse(true, false);
        }
        return generateResponse(true, true);
      }

      return generateResponse(true, false);
    }
  }
  throw new TypeError("Function only accepts Dataset");
}

function testNondetermistic(testString: string, nodes: Node[], edges: Edge[], currentNode: Node): Node | null {
  if (currentNode.final && testString.length === 0) {
    return currentNode;
  }

  const nextNodes: { node: Node; edgeFrom: Edge }[] = getNextNodes(nodes, edges, currentNode);

  for (let i = 0; i < nextNodes.length; i++) {
    const { node, edgeFrom } = nextNodes[i];
    const { label } = edgeFrom;
    if (isEmptyEdge(String(label))) {
      return testNondetermistic(testString, nodes, edges, node);
    } else if (testString.length && testString.charAt(0) === String(edgeFrom.label)) {
      return testNondetermistic(testString.substring(1), nodes, edges, node);
    }
  }

  return null;
}

export default imitateDFA;
