import React, { FC } from 'react';
import { Route, Switch } from 'react-router-dom';

import { requireAuth } from './hoc/requireAuth';

import { PageNotFound } from './views/PageNotFound';
import { Login } from './views/Login';
import { Register } from './views/Register';
import { Workspace } from './views/Workspace';
import { Cabinet } from './views/cabinet';
import Header from './components/header/automata-builder';
import { requirePermisson } from './hoc/requirePermission';
import { USER_ROLES } from './utils/constants';


interface IRouteProps {
    name: string;
    path: string;
    component: React.ComponentType<any>;
    isProtected: boolean;
    exact: boolean;
    permissions?: Array<USER_ROLES>;
}

/** Routes declaration */
const routes: IRouteProps[] = [
    {
        name: "login",
        path: "/login",
        component: Login,
        isProtected: false,
        exact: true,
    },
    {
        name: "registration",
        path: "/registration",
        component: Register,
        isProtected: false,
        exact: true,
    },
    {
        name: 'cabinet',
        path: '/cabinet',
        component: Cabinet,
        isProtected: true,
        exact: false,
        permissions: [USER_ROLES.PROFESSOR]
    },
    {
        name: 'workspace',
        path: '/',
        component: Workspace,
        isProtected: false,
        exact: true
    }
];

const AppRoute: FC<IRouteProps> = (props) => {
    const { isProtected, permissions, component, ...rest } = props;
    return (
        <>
            {!isProtected && <Header />}
            <Route component={isProtected ? requireAuth(requirePermisson(component, permissions || [])) : component} {...rest} />
        </>
    );
};

const Routes: FC = () => {
    return (
        <Switch>
            {Boolean(routes.length) && routes.map((routeProps: IRouteProps) => (
                <AppRoute key={routeProps.name} {...routeProps} />
            ))}
            <Route component={PageNotFound} />
        </Switch>
    );
}

export { Routes }