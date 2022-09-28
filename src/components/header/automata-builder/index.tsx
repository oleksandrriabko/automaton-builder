import React, { FC, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import SettingsIcon from '@material-ui/icons/Settings';
import { SettingsDialog } from '../../settings';
import { useUser } from '../../../context/user'
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { USER_ROLES } from "../../../utils/constants";

const useStyles = makeStyles({
  toolbarContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  settingsIcon: {
    color: 'white'
  }
});

const Header: FC = () => {
  const clasess = useStyles();
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState<boolean>(false);

  return (
    <>
      <AppBar position="static">
        <Toolbar variant="dense" className={clasess.toolbarContainer}>
          <Typography>Automata Builder</Typography>
          <Box display="flex">
            <ActionsPanel />
            <IconButton onClick={() => { setIsSettingsDialogOpen(true) }}>
              <SettingsIcon className={clasess.settingsIcon} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <SettingsDialog close={() => { setIsSettingsDialogOpen(false) }} open={isSettingsDialogOpen} />
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
  text?: string,
  handler: Function,
  restrictions?: Array<USER_ROLES> | undefined,
  icon?: React.ElementType | undefined
}

const ActionsPanel: FC = () => {
  const classes = useActivePanelStyles();
  const history = useHistory();
  const { userState: { user }, updateUserState, handleLsUserStateSave } = useUser();


  const handleSignInButton = (): void => {
    history.push('/login');
  };
  const handleSignUpButton = (): void => {
    history.push('/registration');
  };
  const handleSignOutButton = (): void => {
    const resetState = { user: null, accessToken: null, refreshToken: null };
    updateUserState(resetState);
    handleLsUserStateSave(resetState);
  };
  const handleProfessorCabinetButton = (): void => {
    history.push('/cabinet/groups');
  };

  const noAuthActions: IActionItem[] = [
    { text: 'Sign In', handler: handleSignInButton },
    { text: 'Sign Up', handler: handleSignUpButton }
  ];

  const authActions: IActionItem[] = [
    { icon: AssignmentIcon, handler: handleProfessorCabinetButton, restrictions: [USER_ROLES.PROFESSOR] },
    { icon: ExitToAppIcon, handler: handleSignOutButton }
  ];

  const renderAction = (action: IActionItem, key: string) => {
    const [role]: any = user?.role ?? [];

    if (action.restrictions && role && !action.restrictions.includes(role)) {
      return null;
    }

    const ActionComponentType = action.icon ?
      <IconButton key={key} className={classes.action} onClick={() => action.handler()}><action.icon /></IconButton> :
      <Button key={key} className={classes.action} variant="contained" color="secondary" onClick={() => action.handler()}>
        {action.text}
      </Button>;

    return ActionComponentType
  };

  return (
    <div className={classes.container}>
      {user?.id ?
        <>
          <Typography className={classes.greeting}>{`Greetings, ${user?.firstname}`}</Typography>
          <div className={classes.actions}>
            {authActions.map((action, index) => renderAction(action, 'action_auth' + index))}
          </div>
        </> :
        <>
          {noAuthActions.map((action, index) => renderAction(action, 'action_noauth' + index))}
        </>
      }
    </div>
  );
}