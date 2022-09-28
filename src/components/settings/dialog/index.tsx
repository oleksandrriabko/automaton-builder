import React, { FC, useEffect, useState } from 'react';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import SettingsForm from '../form';


const styles = (theme: Theme) => createStyles({
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        //color: theme.palette.grey[500],
    },
});

interface DialogTitleProps extends WithStyles<typeof styles> {
    children: React.ReactNode;
    onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
    const { children, classes, onClose, ...other } = props;

    return (
        <MuiDialogTitle disableTypography {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

interface ISettingsDialog {
    open: boolean;
    close: () => void;
}

const SettingsDialog: FC<ISettingsDialog> = (props) => {
    const { open, close } = props;

    const [isOpen, setIsOpen] = useState<boolean>(open);

    const handleClose = (): void => {
        setIsOpen(false);
        close();
    };

    useEffect(() => {
        if (open) {
            setIsOpen(open);
        }
    }, [open]);

    return <Dialog open={isOpen} fullWidth maxWidth="md">
        <DialogTitle onClose={handleClose}>Settings</DialogTitle>
        <DialogContent>
            <SettingsForm />
        </DialogContent>
    </Dialog >
}

export default SettingsDialog;
