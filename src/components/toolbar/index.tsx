import React, { FC, useState } from "react";
import { Paper, TextField, IconButton, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import {
  ExportImportSection,
  FunctionalSection,
  TestDfaSection,
} from "./parts";

interface IToolbar {
  testString: string;
  setTestString: Function;
  updateNetwork: Function;
  clearNetwork: Function;
  handleExportAsJson: Function;
  handleExportAsImage: Function;
  runTesting: Function;
  openSaveNetworkToLabDialog: Function;
  openDownloadNetworkDialogOpen: Function;
}

const useStyles = makeStyles({
  container: {
    display: "flex",
    padding: "0.7rem 1.5rem",
    alignItems: "center",
    "& .toolbar-part": {
      display: "flex",
      alignItems: "center",
      "&:not(:last-child):not(:first-child)": {
        margin: "0 1.5rem",
      },
      "&:first-child": {
        marginRight: "1.5rem",
      },
      "&:last-child": {
        marginLeft: "1.5rem",
      },
    },
  },
  divider: {
    height: "2.85rem",
  },
});

const Toolbar: FC<IToolbar> = (props) => {
  const {
    clearNetwork,
    updateNetwork,
    handleExportAsJson,
    testString,
    setTestString,
    handleExportAsImage,
    runTesting,
    openSaveNetworkToLabDialog,
    openDownloadNetworkDialogOpen
  } = props;
  const classes = useStyles();

  return (
    <Paper elevation={12}>
      <div className={classes.container}>
        <TestDfaSection
          testString={testString}
          setTestString={setTestString}
          runTesting={runTesting}
        />
        <Divider className={classes.divider} orientation="vertical" />
        <ExportImportSection
          updateNetwork={updateNetwork}
          handleExportAsImage={handleExportAsImage}
          handleExportAsJson={handleExportAsJson}
        />
        <Divider className={classes.divider} orientation="vertical" />
        <FunctionalSection clearNetwork={clearNetwork} openSaveNetworkToLabDialog={openSaveNetworkToLabDialog} openDownloadNetworkDialogOpen={openDownloadNetworkDialogOpen} />
      </div>
    </Paper>
  );
};

export default Toolbar;
