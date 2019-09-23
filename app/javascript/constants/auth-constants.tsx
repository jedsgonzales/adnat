import { AuthState } from "../types/auth-types";

export const AuthActions = {
    RE_LOGIN: "redirectToLogin",
    AUTH_SUCCESSFUL: "authSuccessful",
    LOGOUT: "userLogout"
}

export const DEFAULT_STATE:AuthState = {
    user: null,
    token: '',
    remember: false
}