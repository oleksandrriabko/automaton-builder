import React, { FC, useState } from 'react';
import { useHistory } from 'react-router-dom';
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import Box from '@material-ui/core/Box';
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Http from '../../../utils/http';
import { Typography } from '@material-ui/core';
import { useUser } from '../../../context/user';

const useStyles = makeStyles((theme) => ({
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    registerLink: {
        display: 'block',
        textAlign: 'center'
    }

}));

const LoginForm: FC = () => {
    const classes = useStyles();

    const history = useHistory();
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const { updateUserState, handleLsUserStateSave } = useUser();
    const [formState, setFormState] = useState({
        username: '',
        password: ''
    })

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        const { username, password } = formState;

        try {
            setIsLoading(true);
            const response = await Http.post('/login', { password, username });
            if (response.status === 200 && response.data.success) {
                setError("");
                const { user, accessToken, refreshToken } = response.data;
                handleLsUserStateSave({ user, accessToken, refreshToken });
                updateUserState({ user, accessToken, refreshToken });
                history.push('/');
            }
        } catch (err) {
            const { data: { message } } = err;
            setError(message);
        }
        setIsLoading(false);
    }

    const handleFormStateUpdate = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormState({ ...formState, [name]: value });
    };

    return (
        <form className={classes.form} noValidate method="POST" onSubmit={handleFormSubmit}>
            <TextField
                variant="outlined"
                margin="normal"
                required
                disabled={isLoading}
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoFocus
                onChange={handleFormStateUpdate}
            />
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                disabled={isLoading}
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={handleFormStateUpdate}
            />

            <Button
                type="submit"
                disabled={isLoading}
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
            >
                Sign In
            </Button>
            {error && <Box textAlign="center" my={3}>
                <Typography color="error">{error}</Typography>
            </Box>}

            <Grid container>
                <Grid item xs={12}>
                    <Link href="/registration" variant="body2" className={classes.registerLink}>
                        {"Don't have an account? Sign Up"}
                    </Link>
                </Grid>
            </Grid>
        </form >
    );

}

export { LoginForm }


