import React, { FC, useEffect, useState } from 'react';
import MaterialTable from 'material-table';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme, Grid, useTheme, CircularProgress, Box, Button } from '@material-ui/core';
import Http from '../../../../utils/http';
import { Group as IGroup, Lab, IUser } from '../../../../types';
// import { processGroupData } from './service';
import { usersColumns, labsColumns } from './config';
import { useSnackbar } from "notistack";
import { useHistory, useParams } from 'react-router-dom';
import { EditableText } from '../../../../components/editable-text';
import { parseClassValidatorError } from '../../../../utils/functions';
import { DEFAULT_ERROR_API_RESPONSE_MESSAGE } from '../../../../utils/constants';
import { AddLabDialog } from '../../components/dialogs/group/AddLabDialog';
import { AddUserDialog, IUserSearchShape } from '../../components/dialogs/group/AddUserDialog';


const useStyles = (theme: Theme) => makeStyles({
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        backgroundColor: theme.palette.primary.main,
        ...theme.mixins.toolbar,
        '& > h6': {
            color: 'white'
        },
        '& svg': {
            fill: 'white'
        }
    },
    drawer: {
        width: 250
    },
    container: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
    },
});

interface IGroupRoutePrams {
    id: string;
}

const Group: FC = () => {
    const history = useHistory();
    const theme = useTheme();
    const classes = useStyles(theme)();
    let { id } = useParams<IGroupRoutePrams>();
    const { enqueueSnackbar } = useSnackbar();


    const [groupTitle, setGroupTitle] = useState<string>('');
    const [groupLabs, setGroupLabs] = useState<Lab[]>([]);
    const [groupUsers, setGroupUsers] = useState<IUser[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [isUsersTableLoading, setIsUsersTableLoading] = useState<boolean>(false);
    const [isLabsTableLoading, setIsLabsTableLoading] = useState<boolean>(false);

    const [addLabDialogOpen, setAddLabDialogOpen] = useState<boolean>(false);
    const [addUserDialogOpen, setAddUserDialogOpen] = useState<boolean>(false);

    useEffect(() => {
        async function getGroupsData() {
            setIsLoading(true)
            try {
                const response = await Http.get(`/groups/${id}`)
                if (response.status === 200 && response.data) {
                    const { title, labs, users } = response.data;
                    title && setGroupTitle(title);
                    users && setGroupUsers(users);
                    labs && setGroupLabs(labs);
                }
            } catch (e) {

            }
            setIsLoading(false);
        }
        getGroupsData();
    }, []);

    const handleUserRowClick = (data: any): void => {
        const { id } = data;
        history.push(`/cabinet/user/${id}`, { id: id });
    };

    const handleLabRowClick = (data: any): void => {
        const { id } = data;
        history.push(`/cabinet/lab/${id}`, { id: id });
    };

    const handleGroupTitleChange = async (title: string): Promise<void> => {
        try {
            const response = await Http.put('/groups', { id, title });
            if (response && response.status === 200 && response.data) {
                const { group: { title } } = response.data;

                setGroupTitle(title);
            }
        } catch (e) {
            setGroupTitle(groupTitle);
            let errMessage = DEFAULT_ERROR_API_RESPONSE_MESSAGE;
            if (e.data.errors) {
                const { title: titleError } = parseClassValidatorError(e.data.errors)
                errMessage = titleError[0];
            }
            enqueueSnackbar(errMessage, { variant: 'error' });
        }
    }

    const handleAddLabDialogOpen = (): void => {
        setAddLabDialogOpen(true);
    };

    const handleAddLabDialogClose = (): void => {
        setAddUserDialogOpen(false);
    };

    const handleSubmitAddLabDialog = async (selectedLab: Lab): Promise<void> => {
        setIsLabsTableLoading(true);
        try {
            const response = await Http.put('/groups', { id, lab: selectedLab });

            if (response && response.status === 200 && response.data) {
                const { group: { labs } } = response.data;
                labs && setGroupLabs(labs);
            }
        } catch (e) {
            let errMessage = e.data.message || DEFAULT_ERROR_API_RESPONSE_MESSAGE;
            if (e.data.errors) {
                const { labs } = parseClassValidatorError(e.data.errors)
                errMessage = labs[0];
            }
            enqueueSnackbar(errMessage, { variant: 'error' });
        }
        setIsLabsTableLoading(false);
    }
    const handleAddUserDialogOpen = (): void => {
        setAddUserDialogOpen(true);
    };

    const handleAddUserDialogClose = (): void => {
        setAddUserDialogOpen(false);
    }

    const handleSubmitAddUserDialog = async (selectedUsers: any[]): Promise<void> => {
        setIsUsersTableLoading(true);
        try {
            const response = await Http.put('/groups', { id, users: selectedUsers.map(user => user.id) });

            if (response && response.status === 200 && response.data) {
                const { group: { users } } = response.data;
                users && setGroupUsers(users);
            }
        } catch (e) {
            let errMessage = e.data.message || DEFAULT_ERROR_API_RESPONSE_MESSAGE;
            if (e.data.errors) {
                const { users } = parseClassValidatorError(e.data.errors)
                errMessage = users[0];
            }
            enqueueSnackbar(errMessage, { variant: 'error' });
        }
        setIsUsersTableLoading(false);
    }

    const handleLabRowDelete = async (oldData: any): Promise<void> => {
        setIsLabsTableLoading(true);
        const { id: labId, title } = oldData;
        try {
            const response = await Http.delete(`/delete-group-lab/${id}/${labId}`);
            if (response.status === 200 && response.data) {
                const { group: { labs } } = response.data;
                labs && setGroupLabs(labs);
                enqueueSnackbar(`${title} was succesfully deleted`, { variant: 'success' });
            }
        } catch (error) {
            const errMessage = error.data.message || DEFAULT_ERROR_API_RESPONSE_MESSAGE;
            enqueueSnackbar(errMessage, { variant: 'error' });
        }
        setIsLabsTableLoading(false);
    }

    const handleUserRowDelete = async (oldData: any): Promise<void> => {
        setIsUsersTableLoading(true);
        const { id: userId, username } = oldData;
        try {
            const response = await Http.delete(`/delete-group-user/${id}/${userId}`);
            if (response.status === 200 && response.data) {
                const { group: { users } } = response.data;
                users && setGroupUsers(users);
                enqueueSnackbar(`${username} was succesfully deleted`, { variant: 'success' });
            }
        } catch (error) {
            const errMessage = error.data.message || DEFAULT_ERROR_API_RESPONSE_MESSAGE;
            enqueueSnackbar(errMessage, { variant: 'error' });
        }
        setIsUsersTableLoading(false);
    }

    return <>
        {isLoading ?
            <Box minHeight={300} width="100%" display="flex" justifyContent="center" alignItems="center">
                <CircularProgress />
            </Box>
            :
            <Grid container spacing={3} className={classes.container}>
                <Grid item xs={12}>
                    {groupTitle &&
                        <EditableText
                            variant="h4"
                            color="primary"
                            text={groupTitle}
                            onSave={(title) => { handleGroupTitleChange(title) }}
                        />}
                </Grid>
                {/** Users */}
                <Grid item xs={12}>
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                        <Button onClick={handleAddUserDialogOpen} variant="contained" color="secondary">Add student</Button>
                        <AddUserDialog groupId={id} open={addUserDialogOpen} submit={handleSubmitAddUserDialog} close={handleAddUserDialogClose} />
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <MaterialTable
                        isLoading={isUsersTableLoading}
                        title="Students"
                        options={{ pageSize: 10, pageSizeOptions: [10, 15] }}
                        data={groupUsers}
                        columns={usersColumns}
                        editable={{
                            onRowDelete: handleUserRowDelete
                        }}
                        onRowClick={(e, data) => {
                            handleUserRowClick(data);
                        }}
                    />
                </Grid>
                {/** Labs */}
                <Grid item xs={12}>
                    <Box display="flex" alignItems="center" justifyContent="flex-end" mt={5}>
                        <Button onClick={handleAddLabDialogOpen} variant="contained" color="secondary">Add lab</Button>
                        <AddLabDialog groupId={id} open={addLabDialogOpen} submit={handleSubmitAddLabDialog} close={handleAddLabDialogClose} />
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <MaterialTable
                        isLoading={isLabsTableLoading}
                        title="Labs"
                        options={{ pageSize: 5, pageSizeOptions: [5] }}
                        data={groupLabs}
                        columns={labsColumns}
                        editable={{
                            onRowDelete: handleLabRowDelete
                        }}
                        onRowClick={(e, data) => {
                            handleLabRowClick(data);
                        }}
                    />
                </Grid>
            </Grid>}
    </>
};


export { Group };