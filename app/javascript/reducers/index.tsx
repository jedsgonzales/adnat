import { combineReducers } from 'redux';
import authReducer from '../reducers/auth-reducers';

export default combineReducers({
    auth: authReducer
});