import { RedirectToLoginAction } from "../types/auth-types"
import { AuthActions } from "../constants/auth-constants"
import { AuthSuccessAction } from '../types/auth-types';
import { User } from "../types";
import { UserLogoutAction } from './../types/auth-types';
import axios, { AxiosResponse, AxiosError } from 'axios';

export const redirectToLogin = ():RedirectToLoginAction => ({
    type: AuthActions.RE_LOGIN
})

export const logoutUser = ():UserLogoutAction => ({
    type: AuthActions.LOGOUT
})

export const authSuccess = (user:User, token:string):AuthSuccessAction => ({
    type: AuthActions.AUTH_SUCCESSFUL,
    payload: { user, token }
})

export const authByToken = (token:string) => {
    return async (dispatch: Function): Promise<any> => {
        try {
            return await axios.post("/api/users/get-session",
            {}, {
                headers: { 
                'Content-Type':     'application/json',
                'Authorization': token
                }
            }).then( (resp:AxiosResponse) => {
                dispatch(authSuccess(resp.data.user, resp.data.token));
                
            }).catch( (error:AxiosError) => {
                setTimeout(() => dispatch(authByToken(token)), 2000);
            });
        } catch(error) {
            setTimeout(() => dispatch(authByToken(token)), 2000);
        }
    };
    
}