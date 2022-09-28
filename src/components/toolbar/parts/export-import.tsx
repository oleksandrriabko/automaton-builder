import React, { FC, useState } from "react";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import CodeIcon from "@material-ui/icons/Code";
import ImageIcon from "@material-ui/icons/Image";

interface IExportImport {
  handleExportAsImage: Function;
  handleExportAsJson: Function;
  updateNetwork: Function;
}

const ExportImport: FC<IExportImport> = (props) => {
  const { handleExportAsImage, handleExportAsJson, updateNetwork } = props;

  const [exportMenuAnchor, setExportMenuAnchor] = useState<HTMLElement | null>(
    null
  );

  const handleExportMenuClose = (): void => {
    setExportMenuAnchor(null);
  };

  const handleExportButtonClick = (
    event: React.MouseEvent<HTMLElement>
  ): void => {
    setExportMenuAnchor(event.currentTarget);
  };

  const exportAsPNG = (): void => {
    setExportMenuAnchor(null);
    const imgBlob = handleExportAsImage();
    const download = document.createElement("a");
    download.href = imgBlob;
    download.download = "export.png";
    download.click();
    download.remove();
  };

  const handleImportOnChange = (event: any): void => {
    const fileReader = new FileReader();
    const { files } = event.target;

    fileReader.readAsText(files[0]);
    fileReader.onload = (e) => {
      if (e.target?.result) {
        const data = JSON.parse(String(e.target.result));
        updateNetwork(data);
      }
    };
    event.target.value = null;
  };

  return (
    <div className="toolbar-part">
      <Button
        style={{ marginRight: "0.8rem" }}
        aria-controls="export-menu"
        aria-haspopup="true"
        variant="contained"
        color="primary"
        onClick={handleExportButtonClick}
      >
        Export
      </Button>
      <Menu
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        id="export-menu"
        anchorEl={exportMenuAnchor}
        keepMounted
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportMenuClose}
      >
        <MenuItem onClick={() => handleExportAsJson()}>
          <CodeIcon style={{ marginRight: "0.5rem" }} />
          As JSON
        </MenuItem>

        <MenuItem onClick={() => exportAsPNG()}>
          <ImageIcon style={{ marginRight: "0.5rem" }} />
          As Image
        </MenuItem>
      </Menu>

      <Button variant="contained" color="primary">
        <label htmlFor="icon-button-photo"> Import </label>
        <input
          accept=".json"
          id="icon-button-photo"
          type="file"
          onChange={handleImportOnChange}
          hidden
        />
      </Button>
    </div>
  );
};

export default ExportImport;
