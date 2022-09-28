import React, { FC, useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Box,
    makeStyles
} from "@material-ui/core";

const useStyles = makeStyles({
    textInputsContainer: {
        display: 'flex',
        alignItems: 'center',
    }
});

interface IPushdownCreateEdgeModal {
    open: boolean;
    title: string;
    submit: (value: string) => void;
    close: () => void;
    contentText: string;
    defaultEmptySymbol: string;
};


const PushdownCreateEdge: FC<IPushdownCreateEdgeModal> = (props) => {
    const { open, close, title, contentText, submit, defaultEmptySymbol } = props;
    const classes = useStyles();

    const [errorString, setErrorString] = useState<string | null>(null);
    const [symbol, setSymbol] = useState<string>("");
    const [pushToStack, setPushToStack] = useState<string>("");
    const [popFromStack, setPopFromStack] = useState<string>("");

    const handleCancelButton = (): void => {
        setErrorString(null);
        close();
    };

    const handleEnterButton = () => {
        let result = '';
        const textElements = [symbol, popFromStack, pushToStack];
        for (let i = 0; i < textElements.length; i++) {
            const text = textElements[i].trim();
            if (text.includes(";") || text.includes("\\")) {
                setErrorString("Label can't have a ; or \\");
                return;
            }
            result += i !== textElements.length - 1 ? (text || defaultEmptySymbol) + ';' : text || defaultEmptySymbol;
        }

        setErrorString(null);
        submit && submit(result);
    }

    return <Dialog
        open={open}
        fullWidth
        maxWidth="md"
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
            <Box className={classes.textInputsContainer}>
                <TextField
                    autoFocus
                    autoComplete="off"
                    margin="dense"
                    value={symbol}
                    label="Symbol"
                    onChange={(e) => {
                        setErrorString(null);
                        setSymbol(e.target.value);
                    }}
                    fullWidth
                />
                <TextField
                    autoFocus
                    autoComplete="off"
                    margin="dense"
                    value={popFromStack}
                    label="Symbol to pop from stack"
                    onChange={(e) => {
                        setErrorString(null);
                        setPopFromStack(e.target.value)
                    }}
                    fullWidth
                />
                <TextField
                    autoFocus
                    autoComplete="off"
                    margin="dense"
                    value={pushToStack}
                    label="Symbol to push to stack"
                    onChange={(e) => {
                        setErrorString(null);
                        setPushToStack(e.target.value);
                    }}
                    fullWidth
                />
            </Box>

        </DialogContent>
        <DialogActions>
            <Button onClick={handleCancelButton} color="primary">
                Cancel
      </Button>
            <Button onClick={handleEnterButton} disabled={!!errorString} color="primary">
                Enter
      </Button>
        </DialogActions>
    </Dialog>
}

export { PushdownCreateEdge };