import React, { FC } from "react";
import { Redirect } from "react-router";
import { useUser } from "../context/user";

function requireAuth(Component: React.ElementType) {
  const ProtectedRoute: FC = (props: any) => {
    const {
      userState: { user },
    } = useUser();

    return user?.id ? (
      <Component {...props} />
    ) : (
        <Redirect
          to={{
            pathname: "/login",
          }}
        />
      );
  };

  return ProtectedRoute;
}

export { requireAuth };
