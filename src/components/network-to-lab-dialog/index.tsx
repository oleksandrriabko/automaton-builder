import React, { useState, FC, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Box,
    CircularProgress,
    Select,
    MenuItem,
    Typography,
    Link
} from "@material-ui/core";
import Http from '../../utils/http';
import { useUser } from "../../context/user";
import { DEFAULT_ERROR_API_RESPONSE_MESSAGE } from '../../utils/constants'

interface ICreateDialog {
    title: string | undefined;
    noAuthMessage: string;
    open: boolean;
    submit: Function | undefined;
    close: Function;
}

const SaveNetworkToLabDialog: FC<ICreateDialog> = (props) => {
    const { title, noAuthMessage, open, submit, close } = props;

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedLab, setSelectedLab] = useState<any>(null);
    const [errorString, setErrorString] = useState<string | null>(null);
    const [userLabs, setUserLabs] = useState([]);
    const { userState: { user } } = useUser();

    const handleEnterButton = () => {
        setErrorString(null);
        submit && submit(selectedLab);

    };

    const handleCancelButton = () => {
        setErrorString(null);
        close();
    };

    useEffect(() => {
        async function getAndSetUserLabs() {
            if (open && user?.id) {
                setIsLoading(true);
                try {
                    const response = await Http.get(`/user-group-labs/${user?.id}`);
                    if (response.status === 200 && response.data) {
                        setUserLabs(response.data.labs);
                    }
                } catch (e) {
                    const message = e.data?.message || DEFAULT_ERROR_API_RESPONSE_MESSAGE;
                    setErrorString(message);
                }
                setIsLoading(false);
            }
        };
        getAndSetUserLabs();
    }, [open]);

    const handleSelectedLabChange = (e: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>): void => {
        const { value } = e.target;
        value && setSelectedLab(value);
    }

    return (
        <Dialog
            open={open}
            onClose={() => close()}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">{title}</DialogTitle>
            <DialogContent>

                {user?.id ? <>
                    {isLoading ?
                        <Box display="flex" justifyContent="center" alignItems="center">
                            <CircularProgress />
                        </Box> :
                        <Select onChange={handleSelectedLabChange} fullWidth value={selectedLab}>
                            {userLabs.map((lab: any) => (<MenuItem value={lab.lab_id}>{lab.lab_title}</MenuItem>))}
                        </Select>}
                </> :
                    <Typography>{noAuthMessage}{' '}
                        <Link href="/login" variant="body1">
                            Sign In
                        </Link>
                    </Typography>}

            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancelButton} color="primary">
                    Cancel
        </Button>
                <Button onClick={handleEnterButton} disabled={!user?.id || !selectedLab} color="primary">
                    Enter
        </Button>
            </DialogActions>
        </Dialog >
    );
};

export { SaveNetworkToLabDialog };
