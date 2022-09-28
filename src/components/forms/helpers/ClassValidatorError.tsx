import React, { FC } from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

interface IClassValidatorError {
    errors: Array<string>
}

export const ClassValidatorError: FC<IClassValidatorError> = (props) => {
    const { errors } = props;

    if (!errors) {
        return null;
    }

    return (
        <>
            {errors.map((err) => {
                return (
                    <Box my={1}>
                        <Typography variant="caption" color="error">{err[0].toUpperCase() + err.substring(1, err.length - 1)}</Typography>
                    </Box>
                );
            })}
        </>
    );
};