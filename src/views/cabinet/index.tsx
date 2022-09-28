import React, { FC, useEffect, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Switch, Route, useRouteMatch } from 'react-router-dom';

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { Grid, Drawer, Theme, IconButton, Divider, List, ListItem, Link, useTheme, Container } from '@material-ui/core';
import { ChevronLeft, } from '@material-ui/icons';
import Header from '../../components/header/cabinet';
import { Groups } from './groups';
import { Group } from './groups/group';
import { Lab } from './lab';
import { requireAuth } from '../../hoc/requireAuth';
import { USER_ROLES } from '../../utils/constants';
import { requirePermisson } from '../../hoc/requirePermission'

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

const mainListItems = [{ text: 'Groups', link: '/cabinet/groups' }, { text: 'Labs', link: '/cabinet/labs' }, { text: 'Users', link: '/cabinet/users' }];

const Cabinet: FC = () => {
    const theme = useTheme();
    const classes = useStyles(theme)();
    let { path } = useRouteMatch();
    const permissons = [USER_ROLES.PROFESSOR];

    useEffect(() => {
        document.getElementsByTagName('body')[0].classList.add('cabinet-page');
        return () => document.getElementsByTagName('body')[0].classList.remove('cabinet-page');
    }, []);

    const [open, setOpen] = useState<boolean>(false);

    const handleDrawerOpen = (): void => {
        setOpen(true);
    };
    const handleDrawerClose = (): void => {
        setOpen(false);
    };

    return <Box>
        <Header isDrawerOpen={open} handleDrawerOpen={handleDrawerOpen} />
        <Drawer
            variant="temporary"
            open={open}
            classes={{ paper: classes.drawer, }}
        >
            <div className={classes.toolbar}>
                <Typography variant="h6">Menu</Typography>
                <IconButton onClick={handleDrawerClose}>
                    <ChevronLeft />
                </IconButton>
            </div>
            <Divider />
            <List>{mainListItems.map(listItem => (
                <Link href={listItem.link}>
                    <ListItem button>
                        <Typography>{listItem.text}</Typography>
                    </ListItem>
                </Link>))}</List>
        </Drawer>
        <Container>
            <Switch>
                <Route component={requireAuth(requirePermisson(Groups, permissons))} path={`${path}/groups`} exact />
                <Route component={requireAuth(requirePermisson(Group, permissons))} path={`${path}/groups/:id`} />
                <Route component={requireAuth(requirePermisson(Lab, permissons))} path={`${path}/lab/:id`} />
            </Switch>

        </Container>
    </Box >
}

export { Cabinet }