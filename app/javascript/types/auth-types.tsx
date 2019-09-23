import { User } from ".";
import { AuthActions } from "../constants/auth-constants";

export interface AuthState {
    user: User | null;
    token: string;
    remember: boolean;
}

//actions
export interface RedirectToLoginAction {
    type: typeof AuthActions.RE_LOGIN;
}

export interface UserLogoutAction {
    type: typeof AuthActions.LOGOUT;
}

export interface AuthSuccessAction {
    type: typeof AuthActions.AUTH_SUCCESSFUL;
    payload: {
        user: User;
        token: string;
    }
}