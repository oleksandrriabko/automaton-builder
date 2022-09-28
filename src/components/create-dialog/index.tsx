import React, { useRef, useState, FC } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@material-ui/core";

interface ICreateDialog {
  title: string | undefined;
  contentText?: string;
  open: boolean;
  submit: Function | undefined;
  close: Function;
  allowEmpty?: boolean;
}

const CreateDialog: FC<ICreateDialog> = (props) => {
  const { title, contentText, open, submit, close, allowEmpty } = props;

  const inputRef = useRef<HTMLInputElement | null>(null);

  const getInputRef = (): HTMLInputElement | null => {
    return inputRef.current;
  };

  const [errorString, setErrorString] = useState<string | null>(null);

  const handleEnterButton = () => {
    const ref = getInputRef();
    if (ref && ref.hasOwnProperty("value")) {
      const { value } = ref;
      const textInput = value.trim();

      if (!allowEmpty && textInput === "") {
        setErrorString("Field shouldn't not be empty");
        return;
      }
      if (textInput.includes(",") || textInput.includes("\\")) {
        setErrorString("Label can't have a , or \\");
        return;
      }
      setErrorString(null);
      submit && submit(textInput);
    }
  };

  const handleCancelButton = () => {
    setErrorString(null);
    close();
  };

  return (
    <Dialog
      open={open}
      onClose={() => close()}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{contentText}</DialogContentText>
        {errorString !== null ? (
          <DialogContentText style={{ color: "red", fontSize: "0.85rem" }}>
            {errorString}
          </DialogContentText>
        ) : (
          ""
        )}
        <TextField
          autoFocus
          autoComplete="off"
          margin="dense"
          id="label"
          inputRef={inputRef}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelButton} color="primary">
          Cancel
        </Button>
        <Button onClick={handleEnterButton} color="primary">
          Enter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateDialog;
