import React, { useState, FC } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Box,
} from "@material-ui/core";
import Http from "../../../../../utils/http";
import Autocomplete from '@material-ui/lab/Autocomplete';

interface ICreateDialog {
    groupId: string;
    contentText?: string;
    open: boolean;
    submit: (user: (IUserSearchShape | string)[]) => any | undefined;
    close: () => void;
}
export interface IUserSearchShape {
    id: string;
    username: string;
}
const AddUserDialog: FC<ICreateDialog> = (props) => {
    const { open, submit, close } = props;

    const [users, setUsers] = useState<IUserSearchShape[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

    const [errorString, setErrorString] = useState<string | null>(null);


    const handleCancelButton = () => {
        setErrorString(null);
        close();
    };

    const handleEnterButton = async (): Promise<void> => {
        setErrorString(null);
        close();
        submit && submit(selectedUsers);
    }


    const handleSearchInputUpdate = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const { value } = e.target;
        if (value) {
            try {
                const response = await Http.get(`/users-search/?search=${value}`)
                if (response.status === 200 && response.data) {
                    setUsers(response.data);
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    const handleChange = (_: any, selected: any[]) => {
        setSelectedUsers(selected);
    }

    return (
        <Dialog
            open={open}
            onClose={() => close()}
            fullWidth
            maxWidth="sm"
            aria-labelledby="form-dialog-title"
        >
            <Box display="flex" justifyContent="space-between">
                <DialogTitle id="form-dialog-title">Add student to group</DialogTitle>
            </Box>

            <DialogContent>
                <Autocomplete
                    freeSolo
                    multiple
                    onChange={handleChange}
                    getOptionLabel={(option) => option.username}
                    disableClearable
                    options={users.filter(userOption => !selectedUsers.some(selected => selected.id === userOption.id))}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            onChange={handleSearchInputUpdate}
                            label="Search user by username"
                            margin="normal"
                            fullWidth
                            variant="outlined"
                            InputProps={{ ...params.InputProps, type: 'search' }}
                        />
                    )}
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

export { AddUserDialog };
