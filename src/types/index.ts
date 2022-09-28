import { Id } from "vis-data/declarations/data-interface";
import { DataSet } from "vis-data";
import { Edge } from "vis-network";
import { USER_ROLES } from "../utils/constants";

export interface dfaValidationResponse {
  isValid: boolean;
}

export interface Node {
  id?: Id;
  label: string;
  final?: boolean;
  x: number;
  y: number;
}

export interface INetworkData {
  nodes: DataSet<Node>;
  edges: DataSet<Edge>;
}

export interface IDfaResponse {
  valid: boolean;
  accepted?: boolean;
  acceptedNodeLabel?: string;
}

export interface IUser {
  id: string;
  username: string;
  role: USER_ROLES;
  group: string;
  firstname: string;
  lastname: string;
}

export interface Group {
  id: string;
  title: string;
  users: [];
  labs: [];
}

export interface Lab {
  id: string;
  title: string;
  automata_code: string;
}
