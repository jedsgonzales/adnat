import { AuthState } from './auth-types';

export interface AdnatState {
    auth: AuthState;
}

export interface User {
    id: number;
    name: string;
    email: string;
    organizations?: Array<Organization>;
    created_at?: string;
    updated_at?: string;
}

export interface Organization {
    id: number;
    name: string;
    hourly_rate: number;
    users?: Array<User>;
    created_at?: string;
    updated_at?: string;
}

export interface Shift {
    id: number;
    organization?: Organization;
    user?: User;
    shift_date: string;
    start_time_val: string;
    end_time_val: string;
    breaks: Array<number>;
    total_worked: number;
    total_breaks: number;
    shift_cost: number;
}