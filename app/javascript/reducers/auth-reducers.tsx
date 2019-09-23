import { AuthState } from "../types/auth-types";
import { DEFAULT_STATE, AuthActions } from "../constants/auth-constants";

export default (state:AuthState = DEFAULT_STATE, action:any):AuthState => {
    switch(action.type){
        case AuthActions.RE_LOGIN:
            return {
                ...state,
                user: null,
                token: ''
            };
        //
        case AuthActions.AUTH_SUCCESSFUL:
            let newAuthState:AuthState = {
                ...state,
                user: action.payload.user,
                token: action.payload.token
            };
            
            return newAuthState;
        //
        case AuthActions.LOGOUT:
            localStorage.removeItem('JWT_TOKEN');
            return {
                ...state,
                user: null,
                token: ''
            };
        //
        default:
            return state;
    }
}