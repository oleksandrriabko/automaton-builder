import { DataSet } from "vis-data";
import { EMPTY_EDGE_LABEL_SIGN } from "../../utils/constants";
import { Edge } from "vis-network";
import { Node } from "../../types";
import { IDfaResponse } from "../../types";

export function isEmptyEdge(edgeLabel: Edge): boolean {
  return edgeLabel === EMPTY_EDGE_LABEL_SIGN.EPSILON || edgeLabel === EMPTY_EDGE_LABEL_SIGN.LAMBDA;
}

function getEdgesBeginingFrom(edges: Edge[], node: Node): Edge[] {
  return edges.filter((edge) => {
    return edge.from === node.id;
  });
}

export function getNextNodes(nodes: Node[], edges: Edge[], node: Node): Array<{ node: Node; edgeFrom: Edge }> {
  const pairs: { node: Node; edgeFrom: Edge }[] = [];

  const edgesFrom = getEdgesBeginingFrom(edges, node);

  edgesFrom.forEach((edge: Edge) => {
    const n = nodes.find((node) => node.id === edge.to);
    if (n) {
      pairs.push({ node: n, edgeFrom: edge });
    }
  });

  return pairs;
}

export function checkIsDataCorrect(data: any): boolean {
  if (data.hasOwnProperty("nodes") && data.hasOwnProperty("edges")) {
    if (data.nodes instanceof DataSet && data.edges instanceof DataSet) {
      return true;
    }
  }

  return false;
}

export function generateResponse(valid: boolean, accepted?: boolean, acceptedNodeLabel?: string): IDfaResponse {
  if (accepted === undefined && acceptedNodeLabel === undefined) {
    return {
      valid,
    };
  }

  if (acceptedNodeLabel === undefined) {
    return {
      valid,
      accepted,
    };
  }

  return {
    valid,
    accepted,
    acceptedNodeLabel,
  };
}
