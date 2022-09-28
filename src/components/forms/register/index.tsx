import React, { FC, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import TextField from "@material-ui/core/TextField";
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from "@material-ui/core/styles";
import Box from '@material-ui/core/Box';
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Http from '../../../utils/http';
import { FormControl, Typography } from '@material-ui/core';
import { useUser } from '../../../context/user';
import CircularProgress from '@material-ui/core/CircularProgress'
import http from '../../../utils/http';
import { Group } from '../../../types';
import { ParsedClassValidatorError } from '../../../types/errors';
import { ClassValidatorError } from '../helpers/ClassValidatorError';
import { parseClassValidatorError } from '../../../utils/functions';

const useStyles = makeStyles((theme) => ({
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(2),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    loginLink: {
        display: 'block',
        textAlign: 'center'
    },
    formControl: {
        marginTop: '0.5rem',
        width: '100%'
    },
    selectLabel: {
        '&.MuiInputLabel-shrink': {
            transform: 'translate(15px, 5px) scale(0.75)'
        }
    }

}));


const RegisterForm: FC = () => {
    const classes = useStyles();

    const history = useHistory();
    const [errors, setErrors] = useState<ParsedClassValidatorError>({});
    const [isLoading, setIsLoading] = useState(false);
    const { updateUserState, handleLsUserStateSave } = useUser();
    const [formState, setFormState] = useState({
        username: '',
        password: '',
        lastname: '',
        firstname: '',
        group: ''
    });
    const [groups, setGroups] = useState<Array<Group> | null>(null);
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        async function loadAndSetGroups() {
            setIsLoading(true);
            try {
                const response = await http.get('/groups');
                if (response.status === 200 && response.data) {
                    setGroups(response.data);
                }
            } catch (e) {
                console.log(e);
            }
            setIsLoading(false);
        }

        loadAndSetGroups();
    }, []);

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        const { username, password, lastname, firstname, group } = formState;

        try {
            setIsLoading(true);
            const response = await Http.post('/register', { password, username, group, lastname, firstname });
            if (response.status === 200 && response.data.success) {
                setErrors({});
                setMessage('');
                const { user, accessToken, refreshToken } = response.data;
                handleLsUserStateSave({ user, accessToken, refreshToken });
                updateUserState({ user, accessToken, refreshToken });
                history.push('/');
            }
        } catch (err) {
            const { data: { message, errors } } = err;
            if (errors && errors.length) {
                const parsed = parseClassValidatorError(errors);
                Object.keys(parsed).length && setErrors(parsed);
            }
            setFormState(formState);
            setMessage(message);
        }
        setIsLoading(false);
    }

    const handleFormStateUpdate = (e: React.ChangeEvent<{ value: unknown, name?: string | undefined }>): void => {
        const { name, value } = e.target;
        if (name) {
            setFormState({ ...formState, [name]: value });
        }
    };

    return (
        <>
            { isLoading ?
                <Box minHeight={300} display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress />
                </Box> : <form className={classes.form} noValidate method="POST" onSubmit={handleFormSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                autoComplete="fname"
                                name="firstname"
                                variant="outlined"
                                required
                                fullWidth
                                id="firstname"
                                label="First Name"
                                value={formState.firstname}
                                autoFocus
                                onChange={handleFormStateUpdate}
                            />
                            <ClassValidatorError errors={errors['firstname']} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="lastname"
                                label="Last Name"
                                name="lastname"
                                autoComplete="lname"
                                value={formState.lastname}
                                onChange={handleFormStateUpdate}
                            />
                            <ClassValidatorError errors={errors['lastname']} />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                value={formState.username}
                                name="username"
                                onChange={handleFormStateUpdate}
                            />
                            <ClassValidatorError errors={errors['username']} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                onChange={handleFormStateUpdate}
                                autoComplete="current-password"
                            />
                            <ClassValidatorError errors={errors['password']} />
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl variant="filled" className={classes.formControl}>

                            <InputLabel id="group-label" className={classes.selectLabel}>
                                Group
                            </InputLabel>

                            <Select
                                labelId="group-label"
                                name="group"
                                fullWidth
                                variant="outlined"
                                value={formState.group}
                                onChange={handleFormStateUpdate}
                            >
                                <MenuItem value="">
                                    None
                            </MenuItem>
                                {groups ? groups.map((group: Group) => {
                                    return <MenuItem value={group.id} key={group.id}>
                                        {group.title}
                                    </MenuItem>
                                }) : null}
                            </Select>

                        </FormControl>
                        <ClassValidatorError errors={errors['group']} />
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        Sign Up
                    </Button>
                    {message && <Box textAlign="center" my={3}>
                        <Typography color="error">{message}</Typography>
                    </Box>}

                    <Grid container>
                        <Grid item xs={12}>
                            <Link href="/login" variant="body2" className={classes.loginLink}>
                                {"Already have an account? Sign In"}
                            </Link>
                        </Grid>
                    </Grid>
                </form>}
        </>
    );

}

export { RegisterForm }


