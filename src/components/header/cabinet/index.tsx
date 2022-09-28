import React, { FC, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { useUser } from '../../../context/user'
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AssignmentIcon from '@material-ui/icons/Assignment';
import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles({
    toolbarContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    menuButton: {
        marginRight: 36,
    },
    menuButtonHidden: {
        display: 'none',
    },
});


interface IHeader {
    handleDrawerOpen: () => void,
    isDrawerOpen: boolean,
}

const Header: FC<IHeader> = (props) => {
    const { handleDrawerOpen, isDrawerOpen } = props;
    const clasess = useStyles();

    return (
        <>
            <AppBar position="static">
                <Toolbar variant="dense" className={clasess.toolbarContainer}>
                    <Box display="flex" alignItems="center">
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            className={isDrawerOpen ? clasess.menuButtonHidden : clasess.menuButton}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography>Professor panel</Typography>
                    </Box>
                    <ActionsPanel />
                </Toolbar>
            </AppBar>

        </>
    );
};

export default Header;


const useActivePanelStyles = makeStyles({
    container: {
        display: 'flex',
        alignItems: 'center',
        '& > button': {
            marginRight: '0.5rem',
            marginLeft: '0.5rem'
        }
    },
    actions: {
        display: 'flex',
        alignItems: 'center'
    },
    greeting: {
        marginRight: '1rem'
    },
    action: {
        '& svg': {
            color: 'white'
        }
    }
});


interface IActionItem {
    handler: Function,
    icon: React.ElementType,
}

const ActionsPanel: FC = () => {

    const classes = useActivePanelStyles();
    const history = useHistory();
    const { userState: { user }, updateUserState, handleLsUserStateSave } = useUser();

    const handleSignOutButton = (): void => {
        const resetState = { user: null, accessToken: null, refreshToken: null };
        updateUserState(resetState);
        handleLsUserStateSave(resetState);
    };

    const handleBuilderButton = (): void => { };


    const actionItems: IActionItem[] = [
        { icon: AssignmentIcon, handler: handleBuilderButton },
        { icon: ExitToAppIcon, handler: handleSignOutButton }
    ];


    return (
        <div className={classes.container}>
            <Typography className={classes.greeting}>{`Greetings, ${user?.firstname}`}</Typography>
            {actionItems.map((action: IActionItem, index: number) => (<IconButton key={'professor_action' + index} className={classes.action} onClick={() => action.handler()}><action.icon /></IconButton>))}
        </div>
    );
}