import React, { useState, FC, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Box,
    makeStyles,
    useTheme,
    Theme,
    Switch,
    FormControlLabel,
    Select,
    CircularProgress,
    MenuItem,
    Typography,
    TextareaAutosize
} from "@material-ui/core";
import Http from "../../../../../utils/http";
import { Lab } from '../../../../../types';

interface ICreateDialog {
    groupId: string;
    contentText?: string;
    open: boolean;
    submit: (lab: Lab) => any | undefined;
    close: () => void;
}

const useStyles = (theme: Theme) => makeStyles({
    switchContainer: {
        padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`
    },
    textarea: {
        width: '100%'
    },
    fileName: {
        marginTop: 16
    }
});


const AddLabDialog: FC<ICreateDialog> = (props) => {
    const { open, submit, close, contentText, groupId } = props;

    const theme = useTheme();
    const classes = useStyles(theme)();
    const [modalTitle, setModalTitle] = useState<string>("");
    const [createLabMode, setCreateLabMode] = useState<boolean>(false);

    const [createLabState, setCreateLabState] = useState({
        title: '',
        description: '',
        automataCodes: ''
    });
    const [selectedFileName, setSelectedFileName] = useState('');

    /** Adding lab state **/
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedLab, setSelectedLab] = useState<any>(null);
    const [availabelLabs, setAvailableLabs] = useState([]);


    const [errorString, setErrorString] = useState<string | null>(null);


    useEffect(() => {
        if (createLabMode) {
            setModalTitle('Create new lab')
        }
        setModalTitle('Add new lab');
    }, [createLabMode]);

    useEffect(() => {
        async function getAndSetAvaialbleLabs() {
            setIsLoading(true);
            try {
                const response = await Http.get(`/available-labs/${groupId}`);
                if (response.status === 200 && response.data) {
                    setAvailableLabs(response.data);
                }
            } catch (e) {
                const errMessage = e.data?.message || 'Error! Something went wrong';
                setErrorString(errMessage);
            }
            setIsLoading(false);
        }
        open && getAndSetAvaialbleLabs();
    }, [open]);


    const handleCancelButton = () => {
        setErrorString(null);
        close();
    };

    const handleEnterButton = async (): Promise<void> => {
        setErrorString(null);
        let selectedLabId = selectedLab;
        if (createLabMode) {
            try {
                const response = await Http.post('/labs', { ...createLabState });
                if (response.status === 200 && response.data) {
                    selectedLabId = response.data.id;
                }
            } catch (e) {
                const errMessage = e.data?.message || 'Error! Something went wrong';
            }
        }
        close();
        submit && submit(selectedLabId);
    }

    const handleSelectedLabChange = (e: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>) => {
        const { value } = e.target;
        setSelectedLab(value);
    };

    const handleCreationInputUpdate = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCreateLabState({ ...createLabState, [name]: value });
    };

    const handleImportOnChange = (event: any): void => {
        const fileReader = new FileReader();
        const { files } = event.target;
        const name = files[0].name || '';
        fileReader.readAsText(files[0]);
        fileReader.onload = (e) => {
            if (e.target?.result) {
                setSelectedFileName(name);
                const data = JSON.stringify(String(e.target.result));
                if (data) {
                    setCreateLabState({ ...createLabState, 'automataCodes': data });
                }
            }
        };
        event.target.value = null;
    };


    return (
        <Dialog
            open={open}
            onClose={() => close()}
            fullWidth
            maxWidth="sm"
            aria-labelledby="form-dialog-title"
        >
            <Box display="flex" justifyContent="space-between">
                <DialogTitle id="form-dialog-title">{modalTitle}</DialogTitle>
                <Box className={classes.switchContainer}>
                    <FormControlLabel
                        control={<Switch checked={createLabMode} onChange={() => setCreateLabMode(!createLabMode)} />}
                        label="Create new lab"
                    />
                </Box>
            </Box>

            <DialogContent>
                {
                    createLabMode ? <>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            disabled={isLoading}
                            fullWidth
                            id="title"
                            label="title"
                            name="title"
                            autoFocus
                            onChange={handleCreationInputUpdate}
                        />
                        <TextareaAutosize className={classes.textarea} rowsMin={3} name="description" onChange={handleCreationInputUpdate} />
                        <br />
                        <Button variant="contained" color="primary">
                            <label htmlFor="icon-button-photo">Import Default Automata</label>
                            <input
                                accept=".json"
                                id="icon-button-photo"
                                type="file"
                                onChange={handleImportOnChange}
                                hidden
                            />

                        </Button>
                        <Typography className={classes.fileName}>{selectedFileName}</Typography>
                    </> : <Box>
                            {
                                isLoading ?
                                    <Box display="flex" width="100%" alignItems="center" justifyContent="center">
                                        <CircularProgress />
                                    </Box>
                                    :
                                    <Select onChange={handleSelectedLabChange} fullWidth value={selectedLab}>
                                        {availabelLabs.map((lab: any) => (<MenuItem value={lab.lab_id}>{lab.lab_title}</MenuItem>))}
                                    </Select>
                            }

                        </Box>

                }
                <Typography variant="caption" color="error">{errorString}</Typography>
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

export { AddLabDialog };
