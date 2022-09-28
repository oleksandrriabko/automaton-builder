import React, { FC, useEffect, useState } from 'react';
import MaterialTable from 'material-table';
import { useSnackbar } from "notistack";
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme, Grid, useTheme, CircularProgress, Box, Paper, Button } from '@material-ui/core';
import { CabinetTitle } from '../components/cabinet-title';
import Http from '../../../utils/http';
import { processGroupData } from './service';
import { columns } from './config';
import { useHistory } from 'react-router-dom';
import { CreateGroupDialog } from '../components/dialogs/groups/CreateGroupDialog';
import http from '../../../utils/http';


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
    groupsHeader: {
        display: 'flex',
        padding: theme.spacing(2),
        justifyContent: 'space-between',
        alignContent: 'center'
    }
});

const Groups: FC = () => {
    const history = useHistory();
    const theme = useTheme();
    const classes = useStyles(theme)();
    const { enqueueSnackbar } = useSnackbar();


    const [groupsData, setGroupsData] = useState<Array<any>>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

    useEffect(() => {
        async function getGroupsData() {
            setIsLoading(true)
            try {
                const response = await Http.get('/groups')
                if (response.status === 200 && response.data) {
                    setGroupsData(processGroupData(response.data));
                }
            } catch (e) {

            }
            setIsLoading(false);
        }
        getGroupsData();
    }, []);

    const handleRowClick = (data: any): void => {
        const { id } = data;
        history.push(`/cabinet/groups/${id}`, { id });
    };

    const handleCreateGroupDialogClose = (): void => {
        setIsCreateGroupModalOpen(false);
    }

    const handleCreateGroupDialogOpen = (): void => {
        setIsCreateGroupModalOpen(true);
    }

    const handleSubmitCreateGroupDialog = async (groupTitle: string): Promise<void> => {
        try {
            const response = await http.post('/groups', { title: groupTitle });
            if (response.status === 200 && response.data) {
                const { group } = response.data;
                setGroupsData([...processGroupData([group]), ...groupsData]);
                enqueueSnackbar(`${group.title} was succesfully created`, { variant: 'success' });
            }
        } catch (error) {
            const errMessage = error.data.error || 'Error! Something went wrong';
            debugger;
            enqueueSnackbar(errMessage, { variant: 'error' });
        }
    }

    const handleGroupRowDelete = async (oldData: any): Promise<void> => {
        const { id } = oldData;
        try {
            const response = await http.delete(`/groups/${id}`);
            if (response.status === 200 && response.data) {
                const { title } = response.data;
                setGroupsData(groupsData.filter(group => group.id !== id));
                enqueueSnackbar(`${title} was succesfully deleted`, { variant: 'success' });
            }
        } catch (error) {
            const errMessage = error.data.error || 'Error! Something went wrong';
            enqueueSnackbar(errMessage, { variant: 'error' });
        }
    }

    return <>
        <Grid container spacing={3} className={classes.container}>
            <Grid item xs={12}>
                <Paper className={classes.groupsHeader}>

                    <CabinetTitle title="Groups" />
                    <Box display="flex">
                        <Button onClick={handleCreateGroupDialogOpen} variant="contained" color="secondary">Create group</Button>
                    </Box>
                </Paper>


            </Grid>

            {isLoading ?
                <Box minHeight={300} width="100%" display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress />
                </Box>
                :
                <Grid item xs={12}>
                    <MaterialTable
                        data={groupsData}
                        columns={columns}
                        editable={{
                            onRowDelete: handleGroupRowDelete
                        }}
                        onRowClick={(e, data) => {
                            handleRowClick(data);
                        }}
                    />
                </Grid>}
        </Grid>
        <CreateGroupDialog title="Create new group" open={isCreateGroupModalOpen} submit={handleSubmitCreateGroupDialog} close={handleCreateGroupDialogClose} />
    </>
};


export { Groups }