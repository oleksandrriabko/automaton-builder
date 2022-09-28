import React, { FC } from 'react'
import Button from '@material-ui/core/Button'
import Home from '@material-ui/icons/Home'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'

const useStyles = makeStyles((theme) => ({
  icon: {
    width: 192,
    height: 192,
    color: theme.palette.secondary.main,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: `100%`,
  },
  button: {
    marginTop: 20,
  },
}))

const PageNotFound: FC = () => {
  const classes = useStyles()

  return (
    <Container>

      <div className={classes.container}>
        <Typography variant="h4">404</Typography>
        <Typography variant="subtitle1">
          Page not found
          </Typography>
        <Button
          color="secondary"
          aria-label="home"
          href="/"
          className={classes.button}
        >
          <Home />
        </Button>
      </div>
    </Container>
  )
}

export { PageNotFound }