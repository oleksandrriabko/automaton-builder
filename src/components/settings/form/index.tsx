import React, { FC } from 'react';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import InputLabel from '@material-ui/core/InputLabel';
import { useSettings } from '../../../context/settings';
import { EMPTY_EDGE_LABEL_SIGN, AUTOMATA_TYPE } from '../../../utils/constants';

const useStyles = makeStyles({
    formLabel: {
        marginBottom: '0.5rem'
    }
});

const SettingsForm: FC = () => {
    const classes = useStyles();
    const { updateSettingsState, settingsState: { defaultEmptyEdge, automataType } } = useSettings();

    const handleFieldChange = (event: React.ChangeEvent<{ value: unknown, name?: string }>): void => {
        const { name, value } = event.target;
        name && updateSettingsState(name, value);
    };

    return (
        <>
            <Box mb={7}>
                <InputLabel className={classes.formLabel} id="defaultEmptyEdgeLabel">Default symbol for empty transition (edge)</InputLabel>
                <Select
                    fullWidth
                    labelId="defaultEmptyEdgeLabel"
                    name="defaultEmptyEdge"
                    value={defaultEmptyEdge}
                    onChange={(event) => { handleFieldChange(event) }}
                >
                    <MenuItem value={EMPTY_EDGE_LABEL_SIGN.EPSILON}>{EMPTY_EDGE_LABEL_SIGN.EPSILON}</MenuItem>
                    <MenuItem value={EMPTY_EDGE_LABEL_SIGN.LAMBDA}>{EMPTY_EDGE_LABEL_SIGN.LAMBDA}</MenuItem>
                </Select>

            </Box>
            <Box mb={2}>
                <InputLabel className={classes.formLabel} id="automataTypeLabel">Automata type</InputLabel>
                <Select
                    fullWidth
                    labelId="automataTypeLabel"
                    name="automataType"
                    value={automataType}
                    onChange={(event) => { handleFieldChange(event) }}
                >
                    <MenuItem value={AUTOMATA_TYPE.FINITE}>{AUTOMATA_TYPE.FINITE}</MenuItem>
                    <MenuItem value={AUTOMATA_TYPE.PUSHDOWN}>{AUTOMATA_TYPE.PUSHDOWN}</MenuItem>
                </Select>

            </Box>
        </>
    );
};

export default SettingsForm;