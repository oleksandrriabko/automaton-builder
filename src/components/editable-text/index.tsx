import React, { FC, useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckIcon from '@material-ui/icons/Check'
import makeStyles from '@material-ui/core/styles/makeStyles'


const useStyles = makeStyles({
    editModeButtonWrapper: {
        '& > button': {
            marginRight: '0.5rem',
            '&:not(:last-child)': {
                marginRight: 0
            }
        }
    }
});

interface IEditableText {
    text: string,
    onSave: (inputValue: string) => void,
    [key: string]: any
}

const EditableText: FC<IEditableText> = (props) => {
    const { text, onSave, ...other } = props;
    const classes = useStyles();
    const [inputValue, setInputValue] = useState(text);
    const [editMode, setEditMode] = useState(false);


    useEffect(() => {
        setInputValue(text)
    }, [text, editMode]);

    const handleSaveButton = (): void => {
        onSave(inputValue);
        setEditMode(false);
    }

    const handleEditButton = (): void => {
        setEditMode(true);
    }

    const handleCancleButton = (): void => {
        setEditMode(false)
        setInputValue(text);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { value } = e.target;
        setInputValue(value);
    }

    return <Box display="flex" alignItems="center">
        {editMode ? <TextField value={inputValue} onChange={handleInputChange} /> : <Typography {...other}>{text}</Typography>}
        <Box display="flex" alignItems="center" ml={3} className={classes.editModeButtonWrapper}>
            {editMode ?
                <>
                    <IconButton onClick={handleSaveButton}><CheckIcon /></IconButton>
                    <IconButton onClick={handleCancleButton}><CancelIcon /></IconButton>
                </> :
                <IconButton onClick={handleEditButton}>
                    <EditIcon />
                </IconButton>
            }</Box>
    </Box>
}

export { EditableText }