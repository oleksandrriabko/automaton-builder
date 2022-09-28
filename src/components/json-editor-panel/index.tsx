import React, { FC, useEffect, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles'
import ReactJSONEditor from './JsonEditorReact';
import Paper from '@material-ui/core/Paper';
import { Typography, Box, Button, Theme } from '@material-ui/core';
import { INetworkData } from '../../types';


const useStyles = makeStyles((theme: Theme) => ({
    panel: {
        display: 'flex',
        '& .react-json-editor-wrapper': {
            height: '100%',
            '& .jsoneditor': {
                borderColor: theme.palette.primary.main,
            },
            '& .jsoneditor-menu': {
                border: 0,
                backgroundColor: theme.palette.primary.main,
                '& > button': {
                    display: 'none'
                },
                '& > .jsoneditor-search': {
                    width: '100%'
                }
            }
        }
    },
    panelExpanded: {
        width: '25%',
        minHeight: '300px',
    },
    panelCollapsed: {
        width: '2rem'
    },
    panelText: {
        writingMode: 'vertical-lr',
    },
    updateBtn: {
        display: 'block',
        marginLeft: 'auto'
    }
}));

interface IJsonEditorPanel {
    open: boolean;
    openStateChange: () => void,
    onSubmit: (networkData: INetworkData) => void,
    networkData: INetworkData
};

const preproccessJsonData = (data: INetworkData) => {
    let { nodes, edges } = data;
    let nodesArr: any = nodes.get();
    let edgesArr: any = edges.get();

    nodesArr = nodesArr.map(({ label, final, id }: { label: string, final: boolean, id: string }) => ({ label, final, id }));
    edgesArr = edgesArr.map(({ label, from, to }: { from: string, to: string, label: string }) => ({ to, from, label }));

    return { nodes: nodesArr, edges: edgesArr };
};

const JsonEditorPanel: FC<IJsonEditorPanel> = (props) => {
    const classes = useStyles();
    const { open, openStateChange, networkData, onSubmit } = props;
    const [value, setValue] = useState<any>(preproccessJsonData(networkData));

    const handleValueChange = (value: any) => {
        setValue(value);
    }

    const onSubmitHandle = () => {
        onSubmit(value);
    }

    useEffect(() => {
        setValue(preproccessJsonData(networkData));
    }, [networkData, open]);

    return <Paper component="aside" className={`${classes.panel} ${open ? classes.panelExpanded : classes.panelCollapsed}`}>
        {open && <main>
            <Box height="calc(100% - 50px)" mb={1}>
                <ReactJSONEditor values={value} onChange={handleValueChange} />
            </Box>
            <Button variant="contained" color="secondary" className={classes.updateBtn} onClick={onSubmitHandle}>Update</Button>
        </main>}
        <Box height="100%" textAlign="center" display="flex">
            <Typography className={classes.panelText} onClick={openStateChange}>JSON Editing</Typography>
        </Box>
    </Paper>
}

export { JsonEditorPanel };