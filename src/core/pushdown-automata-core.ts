import { INetworkData, IDfaResponse } from "../types";
import { START_NODE_ID } from "../utils/constants";
import { Edge } from "vis-network";
import { Node } from "../types";
import { uuidv4 } from "../utils/functions";
import { checkIsDataCorrect, getNextNodes, isEmptyEdge, generateResponse } from "./helpers";
import { PUSHDOWN_BOTTOM_SYMBOL } from "../utils/constants";

class Stack {
  values: any[];

  constructor() {
    this.values = [];
  }

  pop() {
    return this.values.pop();
  }

  push(element: any) {
    this.values.push(element);
  }

  size() {
    return this.values.length;
  }
  getTopValue() {
    return this.values[this.values.length - 1];
  }
}

export function preProcessPushdown(edges: Array<any>) {
  const edgesLength = edges.length;

  for (let edgeIndex = 0; edgeIndex < edgesLength; ) {
    const edge = edges[edgeIndex];
    if (!edge.label) {
      throw new Error("Label is not defined for some edge");
    }
    const edgeLabelArray = edge.label.split("\n");
    const edgeTo = edge.to;

    if (edgeLabelArray.length > 1) {
      for (let index = 0; index < edgeLabelArray.length; index++) {
        const edgeLabel = edgeLabelArray[index].trim();
        let previousTo = edge.from;

        const newEdge = {
          id: uuidv4(),
          from: "",
          to: "",
          label: "",
        };
        newEdge.from = previousTo;

        newEdge.to = edgeTo;
        previousTo = newEdge.to;

        newEdge.label = edgeLabel;
        edges.push(newEdge);
      }
      edges.splice(edgeIndex, 1);
    } else {
      edgeIndex += 1;
    }
  }
}

function imitatePushdownAutomata(inputString: string, data: INetworkData) {
  if (!checkIsDataCorrect(data)) {
    throw new Error("Imitation can work only with correct automata data");
  }

  const nodes = data.nodes.get();
  const edges = data.edges.get();
  preProcessPushdown(edges);

  const stack = new Stack();
  stack.push(PUSHDOWN_BOTTOM_SYMBOL);

  const startNode = nodes.find((n) => n.id === START_NODE_ID);
  if (startNode) {
    const final = testPushdownAutomata(inputString, nodes, edges, startNode, stack);
    if (final == null) {
      return generateResponse(true, false);
    }
    return generateResponse(true, true);
  }
  return generateResponse(true, false);
}

function testPushdownAutomata(testString: string, nodes: Node[], edges: Edge[], currentNode: Node, stack: Stack): Node | null {
  if (currentNode.final && testString.length === 0 && stack.size() === 0) {
    return currentNode;
  }

  const nextNodes: { node: Node; edgeFrom: Edge }[] = getNextNodes(nodes, edges, currentNode);

  for (let i = 0; i < nextNodes.length; i++) {
    const { node, edgeFrom } = nextNodes[i];
    const symbols = parseEdgeLabel(edgeFrom);
    if (!symbols) {
      throw new Error("Edge parsing error");
    }
    const { symbol, symbolToPop, symbolToPush }: ParsedEdgeLabel = symbols;
    if (isEmptyEdge(symbol) && stack.getTopValue() === symbolToPop) {
      if (!isEmptyEdge(symbolToPop)) {
        stack.pop();
      }

      const symbolsToPushArr = symbolToPush.split("");
      symbolsToPushArr.forEach((s) => {
        if (isEmptyEdge(s)) {
          return;
        }
        stack.push(s);
      });

      return testPushdownAutomata(testString, nodes, edges, node, stack);
    } else if (testString.length && testString.charAt(0) === String(symbol) && stack.getTopValue() === symbolToPop) {
      if (!isEmptyEdge(symbolToPop)) {
        stack.pop();
      }

      const symbolsToPushArr = symbolToPush.split("");
      symbolsToPushArr.forEach((s) => {
        if (isEmptyEdge(s)) {
          return;
        }
        stack.push(s);
      });
      return testPushdownAutomata(testString.substring(1), nodes, edges, node, stack);
    }
  }

  return null;
}

type ParsedEdgeLabel = { symbol: string; symbolToPop: string; symbolToPush: string };

const parseEdgeLabel = (edge: Edge): ParsedEdgeLabel | null => {
  if (!edge.label) {
    return null;
  }

  const symbolsArr = edge.label.split(";");
  return { symbol: symbolsArr[0], symbolToPop: symbolsArr[1], symbolToPush: symbolsArr[2] };
};

export default imitatePushdownAutomata;
