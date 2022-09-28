import React, { FC } from "react";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import SaveIcon from "@material-ui/icons/Save";
import DownloadIcon from "@material-ui/icons/ArrowDownward";

interface IFuncitonal {
  clearNetwork: Function;
  openSaveNetworkToLabDialog: Function;
  openDownloadNetworkDialogOpen: Function;
}

const Functional: FC<IFuncitonal> = (props) => {
  const { clearNetwork, openSaveNetworkToLabDialog, openDownloadNetworkDialogOpen } = props;

  return (
    <div className="toolbar-part">
      <Button
        style={{ marginRight: "0.8rem" }}
        variant="contained"
        color="primary"
        onClick={() => {
          openSaveNetworkToLabDialog();
        }}
      >
        <SaveIcon style={{ marginRight: "0.5rem" }} /> Save automata
      </Button>
      <Button
        style={{ marginRight: "0.8rem" }}
        variant="contained"
        color="primary"
        onClick={() => {
          openDownloadNetworkDialogOpen();
        }}
      >
        <DownloadIcon style={{ marginRight: "0.5rem" }} /> Download automata
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => {
          clearNetwork();
        }}
      >
        <DeleteIcon style={{ marginRight: "0.5rem" }} /> Clear All
      </Button>
    </div>
  );
};

export default Functional;
