import React, { FC, useEffect, useState } from 'react';
import MaterialTable from 'material-table';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme, Grid, useTheme, CircularProgress, Box } from '@material-ui/core';
import { CabinetTitle } from '../components/cabinet-title';
import Http from '../../../utils/http';
import { Group as IGroup } from '../../../types';
// import { processGroupData } from './service';
import { usersColumns, labsColumns } from './config';
import { useSnackbar } from "notistack";
import { useHistory, useParams } from 'react-router-dom';
import { EditableText } from '../../../components/editable-text';
import { parseClassValidatorError } from '../../../utils/functions';


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

const Lab: FC = () => {
    const history = useHistory();
    const theme = useTheme();
    const classes = useStyles(theme)();
    let { id } = useParams<IGroupRoutePrams>();
    const { enqueueSnackbar } = useSnackbar();


    const [groupTitle, setGroupTitle] = useState<string>('');
    const [groupData, setGroupData] = useState<IGroup>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        async function getGroupsData() {
            setIsLoading(true)
            try {
                const response = await Http.get(`/groups/${id}`)
                if (response.status === 200 && response.data) {
                    const { title } = response.data;
                    title && setGroupTitle(title);
                    setGroupData(response.data)
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
            debugger;
            if (response && response.status === 200 && response.data) {
                const { group: { title } } = response.data;

                setGroupTitle(title);
            }
        } catch (e) {
            setGroupTitle(groupTitle);
            let errMessage = 'Error! Something went wrong';
            if (e.data.errors) {
                const { title: titleError } = parseClassValidatorError(e.data.errors)
                errMessage = titleError[0];
            }
            enqueueSnackbar(errMessage, { variant: 'error' });
        }
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
                            onCancel={() => { }}
                        />}
                </Grid>
                <Grid item xs={12}>
                    <MaterialTable title="Students" options={{ pageSize: 10, pageSizeOptions: [10, 15] }} data={groupData?.users ?? []} columns={usersColumns} onRowClick={(e, data) => {
                        handleUserRowClick(data);
                    }} />
                </Grid>
                <Grid item xs={12}>
                    <MaterialTable title="Labs" options={{ pageSize: 5, pageSizeOptions: [5] }} data={groupData?.labs ?? []} columns={labsColumns} onRowClick={(e, data) => {
                        handleLabRowClick(data);
                    }} />
                </Grid>
            </Grid>}
    </>
};


export { Lab };