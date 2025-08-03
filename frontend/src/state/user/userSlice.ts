import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginUser, logoutUser, signupUser, verifyAuth, verifyAccount, resendVerification as resendVerificationApi } from "../../api/auth";

interface UserState {
    id: string | null;
    email: string | null;
    isVerified: boolean;
    isLoggedIn: boolean;
    verificationTokenExpires: Date | null;
}

const initialState: UserState = {
    id: null,
    email: null,
    isVerified: false,
    isLoggedIn: false,
    verificationTokenExpires: null,
};

// Thunks
export const login = createAsyncThunk("auth/login", async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    try {
        const response = await loginUser(email, password);
        if (response.status === 200) {
            return response.data.user;
        } else {
            return thunkAPI.rejectWithValue("Login failed");
        }
    } catch (error) {
        return thunkAPI.rejectWithValue("Login failed");
    }
});

export const logout = createAsyncThunk("auth/logout", async (email: string, thunkAPI) => {
    try {
        const response = await logoutUser(email);
        if (response.status === 200) {
            return response.data.user;
        } else {
            return thunkAPI.rejectWithValue(response.data.error || "Logout failed");
        }
    } catch (error) {
        return thunkAPI.rejectWithValue("Logout failed");
    }
});

export const signup = createAsyncThunk("auth/signup", async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    try {
        const response = await signupUser(email, password);
        if (response.status === 200) {
            return response.data.user;
        } else {
            return thunkAPI.rejectWithValue(response.data.error || "Logout failed");
        }
    } catch (error) {
        return thunkAPI.rejectWithValue("Signup failed");
    }
});

export const verify = createAsyncThunk("auth/verify", async ({ email, code }: { email: string; code: string }, thunkAPI) => {
    try {
        const response = await verifyAccount(email, code);
        if (response.status === 200) {
            return response.data.user;
        } else {
            return thunkAPI.rejectWithValue(response.data.error || "Verification failed");
        }
    } catch (error) {
        return thunkAPI.rejectWithValue("Verification failed");
    }
});

export const resendVerification = createAsyncThunk<any, string>(
    "auth/resendVerification",
    async (email: string, thunkAPI) => {
        try {
            const response = await resendVerificationApi(email);
            if (response.status === 200) {
                return response.data.user;
            } else {
                return thunkAPI.rejectWithValue(response.data.error || "Resend verification failed");
            }
        } catch (error) {
            return thunkAPI.rejectWithValue("Resend verification failed");
        }
    }
);

// Check auth status via cookie-based session
export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, thunkAPI) => {
    try {
        const response = await verifyAuth();
        if (response.status === 200) {
            return response.data.user;
        } else {
            return thunkAPI.rejectWithValue('Auth check failed');
        }
    } catch (error) {
        return thunkAPI.rejectWithValue('Auth check failed');
    }
});

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(checkAuth.fulfilled, (state, action) => {
                const u = action.payload;
                state.id = u.id;
                state.email = u.email;
                state.isVerified = u.isVerified;
                state.isLoggedIn = true;
            })
            .addCase(checkAuth.rejected, state => {
                state.id = null;
                state.email = null;
                state.isVerified = false;
                state.isLoggedIn = false;
            })
            .addCase(login.fulfilled, (state, action) => {
                const u = action.payload;
                state.id = u.id;
                state.email = u.email;
                state.isVerified = u.isVerified;
                state.isLoggedIn = true;
            })
            .addCase(logout.fulfilled, state => {
                state.id = null;
                state.email = null;
                state.isVerified = false;
                state.isLoggedIn = false;
            })
            .addCase(signup.fulfilled, (state, action) => {
                const u = action.payload;
                state.id = u.id;
                state.email = u.email;
                state.isVerified = u.isVerified;
                state.isLoggedIn = false;
                state.verificationTokenExpires = u.verificationTokenExpires;
            })
            .addCase(verify.fulfilled, (state, action) => {
                const u = action.payload;
                state.id = u.id;
                state.email = u.email;
                state.isVerified = u.isVerified;
                state.isLoggedIn = u.isLoggedIn;
            })
            .addCase(resendVerification.fulfilled, (state, action) => {
                const u = action.payload;
                state.id = u.id;
                state.email = u.email;
                state.isVerified = u.isVerified;
                state.isLoggedIn = false;
                state.verificationTokenExpires = u.verificationTokenExpires;
            });
    }
});



export default userSlice.reducer;