import React, { useState, FC } from "react";
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
    submit: (title: string) => any | undefined;
    close: () => void;
}

const MIN_TITLE_LENGTH = 2;

const CreateGroupDialog: FC<ICreateDialog> = (props) => {
    const { title, contentText, open, submit, close } = props;


    const [groupTitle, setGroupTitle] = useState<string>("");

    const [errorString, setErrorString] = useState<string | null>(null);


    const handleCancelButton = () => {
        setErrorString(null);
        close();
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        validateTitle(value);
        setGroupTitle(value);
    }

    const handleEnterButton = (): void => {
        setErrorString(null);
        close();
        submit && submit(groupTitle);
    }

    const validateTitle = (value: string): void => {
        if (!value) {
            setErrorString('Group title should be empty');
            return;
        }

        if (value.length < MIN_TITLE_LENGTH) {
            setErrorString('Group title should have at lease 2 letters');
            return;
        }

        setErrorString(null);
    };



    return (
        <Dialog
            open={open}
            onClose={() => close()}
            fullWidth
            maxWidth="sm"
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
                    value={groupTitle}
                    fullWidth
                    onChange={handleTitleChange}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancelButton} color="primary">
                    Cancel
        </Button>
                <Button onClick={handleEnterButton} color="primary" disabled={!!errorString}>
                    Enter
        </Button>
            </DialogActions>
        </Dialog>
    );
};

export { CreateGroupDialog };
