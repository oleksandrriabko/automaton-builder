import React, { FC, useEffect, useRef, useState } from "react";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";

import { DataSet } from "vis-data";
import { Edge, Network, Options } from "vis-network";
import { Id } from "vis-data/declarations/data-interface";
import fileDownload from "js-file-download";
import { useSnackbar } from "notistack";

import Toolbar from "../components/toolbar";
import CreateDialog from "../components/create-dialog";
import { PushdownCreateEdge } from '../components/pushdown-create-edge-dialog';

import { uuidv4 } from "../utils/functions";
import {
  START_NODE_ID,
  ACTIVATE_DRAW_EDGE_KEY_NAME,
  ACTIVATE_DELETE_ELEMENTS_KEY_NAME,
  DEFAULT_ERROR_API_RESPONSE_MESSAGE,
  AUTOMATA_TYPE
} from "../utils/constants";

import { Node, INetworkData } from "../types";
import { useSettings } from "../context/settings";
import { useUser } from '../context/user';
import imitateDFA from "../core/finite-automata-core";
import imitatePushdown from '../core/pushdown-automata-core';
import { SaveNetworkToLabDialog } from "../components/network-to-lab-dialog";
import Http from '../utils/http';
import { JsonEditorPanel } from "../components/json-editor-panel";

let NODES: DataSet<Node> = new DataSet([
  {
    id: START_NODE_ID,
    label: "Start Node",
    final: false,
    x: -184,
    y: -41,
  },
]);

let EDGES: DataSet<Edge> = new DataSet([]);

const data: INetworkData = {
  nodes: NODES,
  edges: EDGES,
};

const OPTIONS: Options = {
  nodes: {
    shape: "circle",
    widthConstraint: {
      minimum: 50,
      maximum: 50,
    },
  },
  edges: {
    arrows: {
      to: { enabled: true, scaleFactor: 1, type: "arrow" },
    },

    smooth: { type: "curvedCW", roundness: 0.5, enabled: true },
  },
  physics: {
    enabled: false,
  },
  manipulation: {
    enabled: false,
  },
  interaction: {
    selectConnectedEdges: false,
  },
};

const getEdge = (edgeData: Edge): Edge | null => {
  let edge = null;
  const list = EDGES.get();

  list.forEach((item: Edge) => {
    if (item.from === edgeData.from && item.to === edgeData.to) {
      edge = item;
    }
  });

  return edge;
};

const Workspace: FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const firstRenderRef = useRef<boolean>(true);

  const networkReference = useRef<Network | null>(null);

  const getNetwork = (): Network | null => {
    return networkReference.current;
  };

  const setNetwork = (network: Network): void => {
    networkReference.current = network;
  };

  const curEdgeObject = useRef<Edge | null>(null);

  const getCurEdge = (): Edge | null => {
    return curEdgeObject.current;
  };

  const setCurEdge = (edge: Edge | null): void => {
    curEdgeObject.current = edge;
  };

  const curNodeObject = useRef<Node | null>(null);

  const getCurNode = (): Node | null => {
    return curNodeObject.current;
  };

  const setCurNode = (node: Node | null): void => {
    curNodeObject.current = node;
  };

  const selectedElementLabelRef = useRef<HTMLTextAreaElement | null>(null);

  const getSelectedElementLabelRefValue = (): string | null => {
    if (!selectedElementLabelRef?.current) {
      return null;
    }

    return selectedElementLabelRef.current.value;
  };

  const setSelectedElementLabelRefValue = (value: string): void => {
    if (!selectedElementLabelRef?.current) {
      return;
    }

    selectedElementLabelRef.current.value = value;
  };

  const addNode = (label: string, x: number, y: number) => {
    const nodeObject = {
      id: uuidv4(),
      label: label || "Node",
      x,
      y,
    };
    setCurNode(nodeObject);
    NODES.add(nodeObject);
    setNetworkData(getNetworkData());
  };

  const getNetworkData = (): INetworkData => {
    return {
      nodes: NODES,
      edges: EDGES
    }
  };

  const {
    settingsState: { defaultEmptyEdge, automataType },
    previousSettingsState,
  } = useSettings();

  const { userState: { user } } = useUser();


  /** State declarations */
  const [isNodeModalOpen, setIsNodeModalOpen] = useState<boolean>(false);
  const [isEdgeModalOpen, setIsEdgeModalOpen] = useState<boolean>(false);
  const [inputTestString, setInputTestString] = useState<string>("");
  const [isNetworkToLabDialogOpen, setIsNetworkToLabDialogOpen] = useState<boolean>(false);
  const [isLabToNetworkDialogOpen, setIsLabToNetworkDialogOpen] = useState<boolean>(false);
  const [isEditJsonPanelOpen, setIsEditJsonPanelOpen] = useState<boolean>(false);
  const [networkData, setNetworkData] = useState(getNetworkData());

  const initWorkspace = (): void => {
    const container: HTMLElement | null =
      document.getElementById("network-canvas");
    if (container) {
      const opt = setupNetworkOptions(OPTIONS);
      const createdNetwork = new Network(container, data, opt);
      createdNetwork.on("click", handleClickOnNetwork);
      createdNetwork.on("doubleClick", handleDoubleClickOnNetwork);
      createdNetwork.on("beforeDrawing", handleBeforeDrawingEvent);
      createdNetwork.on("selectNode", handleNodeSelection);
      createdNetwork.on("selectEdge", handleEdgeSelection);
      createdNetwork.on("deselectNode", handleNodeDeselection);
      createdNetwork.on("deselectEdge", handleEdgeDeselection);
      setNetwork(createdNetwork);
      bindKeysToNetworkContainer(container);
    }
  };

  const updateNetwork = (networkData: any): void => {
    clearNetwork();
    if (!networkData.nodes && !networkData.edges) {
      enqueueSnackbar("Not valid JSON for network creation", {
        variant: "error",
      });
    }

    NODES.add(networkData.nodes.splice(1));
    EDGES.add(networkData.edges);

    enqueueSnackbar('Your automata was succesfully downloaded', { variant: 'success' });
  };

  const clearNetwork = (): void => {
    const nodesIds = NODES.getIds();

    NODES.remove(nodesIds.splice(1));
    EDGES.clear();
  };

  const handleExportAsJSON = (): void => {
    const payload = {
      nodes: NODES.get(),
      edges: EDGES.get(),
    };
    const payloadJson: string = JSON.stringify(payload);
    fileDownload(payloadJson, "exportDFA.json");
  };

  const handleExportAsImage = (): string | null => {
    const network = getNetwork();
    if (!network) {
      return null;
    }

    let blob = null;
    network.on("afterDrawing", (ctx: CanvasRenderingContext2D) => {
      blob = ctx.canvas.toDataURL();
    });

    /** triger redraw to get image blob */
    network.redraw();

    return blob;
  };

  const drawArrowForStartNode = (ctx: CanvasRenderingContext2D): void => {
    const network = getNetwork();
    if (!network) {
      return;
    }

    const startNode = START_NODE_ID;
    const startNodePosition = network.getPositions([startNode]);

    // in order to keep the default dx as 30, we need to limit the length of node label, otherwise arrow and node will overlap
    const x1 = startNodePosition[startNode].x - 30;
    const y1 = startNodePosition[startNode].y;
    const x2 = startNodePosition[startNode].x - 80;
    const y2 = startNodePosition[startNode].y;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "#2B7CE9";
    ctx.stroke();

    const startRadians =
      Math.atan((y2 - y1) / (x2 - x1)) +
      ((x2 >= x1 ? -90 : 90) * Math.PI) / 180;

    ctx.save();
    ctx.beginPath();
    ctx.translate(x1, y1);
    ctx.rotate(startRadians);
    ctx.moveTo(0, 0);
    ctx.lineTo(5, 18);
    ctx.lineTo(0, 16);
    ctx.lineTo(-5, 18);
    ctx.closePath();
    ctx.restore();
    ctx.fillStyle = "#2B7CE9";
    ctx.fill();
  };

  const drawCircleForFinalNodes = (ctx: CanvasRenderingContext2D): void => {
    const network = getNetwork();
    if (!network) {
      return;
    }

    const finalNodesIds = NODES.getIds({
      filter: (node: Node) => {
        return Boolean(node.final);
      },
    });

    ctx.save();

    const finalNodePositions = network.getPositions(finalNodesIds);
    ctx.strokeStyle = "#2B7CE9";
    finalNodesIds.forEach((value) => {
      ctx.beginPath();
      ctx.arc(
        finalNodePositions[value].x,
        finalNodePositions[value].y,
        36,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    });

    ctx.save();
  };

  const setupNetworkOptions = (options: Options): Options => {
    options.manipulation.addEdge = (edgeData: any, callback: Function) => {
      edgeData.smooth = { type: "curvedCW", roundness: 0.2 };
      const edge = getEdge(edgeData);
      if (edge == null) {
        setCurEdge(edgeData);
        callback(edgeData);
      } else {
        setCurEdge(edge);
      }
      setIsEdgeModalOpen(true);
    };
    return options;
  };

  /** Event handlers */
  const handleBeforeDrawingEvent = (ctx: CanvasRenderingContext2D): void => {
    drawArrowForStartNode(ctx);
    drawCircleForFinalNodes(ctx);
  };

  /** Handle clearing textarea value, when click wasn't on any element */
  const handleClickOnNetwork = (eventParams: any): void => {
    const { nodes, edges } = eventParams;
    if (!nodes.length && !edges.length) {
      setSelectedElementLabelRefValue("");
    }
  };

  const handleDoubleClickOnNetwork = (eventParams: any): void => {
    const {
      pointer: {
        canvas: { x, y },
      },
      nodes,
    } = eventParams;
    const nodeId: Id = nodes[0];
    if (nodeId) {
      const selected = NODES.get(nodeId);
      selected && NODES.update({ id: nodeId, final: !selected.final });
    } else {
      addNode("", x, y);
      setIsNodeModalOpen(true);
    }
  };

  const handleNodeSelection = (eventParams: any): void => {
    const { nodes } = eventParams;
    const nodeId: Id = nodes[0];
    if (nodeId) {
      const selected = NODES.get(nodeId);
      if (selected) {
        setCurNode(selected);
        setSelectedElementLabelRefValue(selected.label);
      }
    }
  };

  const handleEdgeSelection = (eventParams: any): void => {
    const { edges } = eventParams;
    const edgeId: Id = edges[0];
    if (edgeId) {
      const selected: Edge | null = EDGES.get(edgeId);
      if (selected) {
        setCurEdge(selected);
        setSelectedElementLabelRefValue(selected.label || "");
      }
    }
  };

  const handleNodeDeselection = (): void => {
    setCurNode(null);
  };

  const handleEdgeDeselection = (): void => {
    setCurEdge(null);
  };

  const handleDeletionOnNetwork = (): void => {
    const network = getNetwork();
    if (!network) {
      return;
    }

    const selection = network.getSelection();
    const { nodes, edges } = selection;

    /** Handling node deletion */
    if (nodes.length) {
      if (nodes[0] === START_NODE_ID) {
        console.error("Start node can't be deleted");
        return;
      }
      const connectedEdges = network.getConnectedEdges(nodes[0]);
      EDGES.remove(connectedEdges);
      network.deleteSelected();
      network.getOptionsFromConfigurator()
      setCurNode(null);
      setNetworkData(getNetworkData());
      return;
    }

    /** Handling edges deletion */
    if (edges.length) {
      network.deleteSelected();
      setCurEdge(null);
      setNetworkData(getNetworkData());
    }
  };

  const handleSelectedElementLabel = (): void => {
    const selectedNode = getCurNode();
    const selectedEdge = getCurEdge();
    const value = getSelectedElementLabelRefValue();

    if (value == null) {
      return;
    }

    const newLabelForElement = value.trim();

    if (newLabelForElement === "") {
      return;
    }
    if (newLabelForElement.includes("\\")) {
      return;
    }

    if (selectedNode?.id) {
      NODES.update({ id: selectedNode.id, label: newLabelForElement });
      setCurNode(null);
    }

    if (selectedEdge?.id) {
      const newLabelEdgeArr = newLabelForElement
        .split("\n")
        .map((label: string) => label.trim())
        .filter((label: string) => label !== "");

      const label = Array.from(new Set<string>(newLabelEdgeArr)).join("\n");
      EDGES.update({ id: selectedEdge.id, label: label });
      setCurEdge(null);
    }
    setNetworkData(getNetworkData());
  };


  const bindKeysToNetworkContainer = (target: HTMLElement): void => {
    if (!target) {
      return;
    }
    const network = getNetwork();
    if (!network) {
      return;
    }

    target.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === ACTIVATE_DRAW_EDGE_KEY_NAME) {
        network.addEdgeMode();
        return;
      }

      if (event.key === ACTIVATE_DELETE_ELEMENTS_KEY_NAME) {
        handleDeletionOnNetwork();
      }
    });

    target.addEventListener("keyup", (event: KeyboardEvent) => {
      if (event.key === ACTIVATE_DRAW_EDGE_KEY_NAME) {
        network.disableEditMode();
      }
    });
  };

  /** Modal submit/close handlers */
  const handleSubmitNodeModal = (labelValue: string): void => {
    const node = getCurNode();
    if (node) {
      NODES.update({ id: node.id, label: labelValue });
    }
    setNetworkData(getNetworkData());
    setIsNodeModalOpen(false);
  };

  const handleSubmitEdgesModal = (labelValue: string): void => {
    const edge: Edge | null = getCurEdge();
    if (!edge || !edge?.id) {
      return;
    }

    const existedEdge: Edge | null = EDGES.get(edge.id);
    if (existedEdge?.label !== undefined) {
      let label = `${labelValue || defaultEmptyEdge}\n${existedEdge.label}`;
      let edgeLabelArr = label.split("\n").map((item) => item.trim());
      edgeLabelArr = Array.from(new Set<string>(edgeLabelArr));
      labelValue = edgeLabelArr.join("\n");
    }

    EDGES.update({
      id: edge.id,
      label: labelValue || defaultEmptyEdge,
    });

    setNetworkData(getNetworkData());

    setIsEdgeModalOpen(false);
  };

  const handleCloseNodeModal = (): void => {
    const node = getCurNode();
    node?.id && NODES.remove(node.id);
    setCurNode(null);
    setIsNodeModalOpen(false);
  };

  const handleCloseEdgeModal = (): void => {
    setCurEdge(null);
    setIsEdgeModalOpen(false);
  };

  /** Test automata */
  const runImitation = () => {
    const imitateFunc = automataType === AUTOMATA_TYPE.FINITE ? imitateDFA : imitatePushdown;
    try {
      const networkData = getNetworkData();
      const { accepted, valid } = imitateFunc(inputTestString, networkData);
      if (!valid) {
        enqueueSnackbar("Your automata is not valid", { variant: "error" });
        return;
      }

      if (accepted) {
        enqueueSnackbar("Input accepted", { variant: "success" });
      } else {
        enqueueSnackbar("Input rejected", { variant: "error" });
      }
    } catch (e) {
      enqueueSnackbar(e.message || "Error", { variant: "error" });
    }
  };


  useEffect(() => {
    initWorkspace();
  }, []);

  /** Handling changing empty edge symbol from settings */
  useEffect(() => {
    //skip 1st render
    if (firstRenderRef.current === true) {
      firstRenderRef.current = false;
      return;
    }

    if (previousSettingsState?.defaultEmptyEdge) {
      let edgesArr = EDGES.get();
      edgesArr = edgesArr
        .filter((edge) =>
          edge.label?.includes(previousSettingsState.defaultEmptyEdge)
        )
        .map((edge) => ({
          ...edge,
          label: edge.label?.replace(
            previousSettingsState.defaultEmptyEdge,
            defaultEmptyEdge
          ),
        }));
      EDGES.update(edgesArr);
    }
  }, [defaultEmptyEdge]);

  /** Clear node object when add edge dialog box is closed */
  useEffect(() => {
    if (!isNodeModalOpen) {
      setCurNode(null);
    }
  }, [isNodeModalOpen]);

  /** Clear edge object when add edge dialog box is closed */
  useEffect(() => {
    if (!isEdgeModalOpen) {
      setCurNode(null);
      setCurEdge(null);
    }
  }, [isEdgeModalOpen]);

  const saveNetworkToLab = async (labId: string) => {
    try {
      const payload = {
        nodes: NODES.get(),
        edges: EDGES.get(),
      };
      const response = await Http.post('/save-user-lab', { labId, userId: user?.id, automataCodes: JSON.stringify(payload) });
      if (response && response.status === 200) {
        enqueueSnackbar('Your automata was succesfully saved', { variant: 'success' });
      }
    } catch (e) {
      const message = e.data.message || DEFAULT_ERROR_API_RESPONSE_MESSAGE;
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const downloadLabToNetwork = async (labId: string) => {
    try {
      const response = await Http.get(`/get-user-lab/${user?.id}/${labId}`);
      if (response.status === 200 && response.data) {
        const { lab: { automataCodes } } = response.data;
        if (automataCodes) {
          updateNetwork(JSON.parse(automataCodes));
        }
      }

    } catch (e) {
      const message = e.data?.message || DEFAULT_ERROR_API_RESPONSE_MESSAGE;
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleSaveNetworkDialogOpen = (): void => {
    setIsNetworkToLabDialogOpen(true);
  };
  const handleSaveNetworkDialogClose = (): void => {
    setIsNetworkToLabDialogOpen(false);
  };

  const handleDownloadNetworkDialogClose = (): void => {
    setIsLabToNetworkDialogOpen(false);
  };
  const handleDownloadNetworkDialogOpen = (): void => {
    setIsLabToNetworkDialogOpen(true);
  };

  const handleEditJsonPanelOpenChange = (): void => {
    setIsEditJsonPanelOpen(!isEditJsonPanelOpen);
  }

  return (
    <>
      <main style={{ height: "calc(100% - 48px)" }}>
        <Toolbar
          testString={inputTestString}
          setTestString={setInputTestString}
          runTesting={runImitation}
          updateNetwork={updateNetwork}
          clearNetwork={clearNetwork}
          handleExportAsJson={handleExportAsJSON}
          handleExportAsImage={handleExportAsImage}
          openSaveNetworkToLabDialog={handleSaveNetworkDialogOpen}
          openDownloadNetworkDialogOpen={handleDownloadNetworkDialogOpen}
        />
        <Paper
          elevation={12}
          style={{
            height: "calc(100% - 75px)",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <JsonEditorPanel
            open={isEditJsonPanelOpen}
            openStateChange={handleEditJsonPanelOpenChange}
            onSubmit={updateNetwork}
            networkData={networkData}
          />
          <div style={{ flexGrow: 1 }}>
            <textarea
              ref={selectedElementLabelRef}
              onBlur={handleSelectedElementLabel}
              style={{ resize: "none", width: '100%' }}
            />
            {/*<TextField*/}
            {/*  variant="outlined"*/}
            {/*  fullWidth*/}
            {/*  inputRef={selectedElementLabelRef}*/}
            {/*  onBlur={handleSelectedElementLabel}*/}
            {/*  // onKeyDown={(event) => handleKeyPressForInput(event)}*/}
            {/*  placeholder="Edit label of Node/Edge"*/}
            {/*/>*/}
            <div style={{ height: "calc(100% - 56px)" }} id="network-canvas" />
          </div>

        </Paper>
      </main>
      <CreateDialog
        submit={handleSubmitNodeModal}
        open={isNodeModalOpen}
        close={handleCloseNodeModal}
        title="Add Node"
        contentText="Please enter a label for your new node"
      />
      {automataType === AUTOMATA_TYPE.FINITE ?
        <CreateDialog
          allowEmpty
          submit={handleSubmitEdgesModal}
          open={isEdgeModalOpen}
          close={handleCloseEdgeModal}
          title="Add Edge"
          contentText="Please enter a label for your new edge"
        /> : <PushdownCreateEdge
          defaultEmptySymbol={defaultEmptyEdge}
          submit={handleSubmitEdgesModal}
          open={isEdgeModalOpen}
          close={handleCloseEdgeModal}
          title="Add Edge for pushdown automata"
          contentText=""
        />
      }
      <SaveNetworkToLabDialog
        open={isNetworkToLabDialogOpen}
        close={handleSaveNetworkDialogClose}
        title="Save automata"
        noAuthMessage="Please login if you want to save your work"
        submit={saveNetworkToLab}
      />
      <SaveNetworkToLabDialog
        open={isLabToNetworkDialogOpen}
        close={handleDownloadNetworkDialogClose}
        title="Download automata"
        noAuthMessage="Please login if you want to get your automata code"
        submit={downloadLabToNetwork}
      />
    </>
  );
};

export { Workspace };
