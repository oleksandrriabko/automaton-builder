import React, { FC } from "react";
import { useUser } from "../context/user";
import { USER_ROLES } from "../utils/constants";
import { PageNotFound } from '../views/PageNotFound';

function requirePermisson(Component: React.ElementType, permissions: Array<USER_ROLES>) {
    const ProtectedRoute: FC = (props: any) => {

        const {
            userState: { user },
        } = useUser();
        const [role]: any = user?.role || [];

        return !permissions || permissions && permissions.includes(role) ? (
            <Component {...props} />
        ) : (
                <PageNotFound />
            );
    };

    return ProtectedRoute;
}

export { requirePermisson };
