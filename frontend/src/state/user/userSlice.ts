import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginUser, logoutUser, signupUser, verifyAuth, verifyAccount, resendVerification as resendVerificationApi, resetPassword as resetPasswordApi } from "../../api/auth";

interface UserState {
    email: string | null;
    isVerified: boolean;
    isLoggedIn: boolean;
    verificationTokenExpires: Date | null;
}

const initialState: UserState = {
    email: null,
    isVerified: false,
    isLoggedIn: false,
    verificationTokenExpires: null,
};

// Thunks
export const login = createAsyncThunk("auth/login", async ({ email, password, rememberMe }: { email: string; password: string; rememberMe: boolean}, thunkAPI) => {
    try {
        const response = await loginUser(email, password, rememberMe);
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
            return thunkAPI.rejectWithValue(response.data.error || "Signup failed");
        }
    } catch (error) {
        return thunkAPI.rejectWithValue("Signup failed");
    }
});

export const verify = createAsyncThunk("auth/verify", async ({ email, code, rememberMe }: { email: string; code: string; rememberMe: boolean }, thunkAPI) => {
    try {
        const response = await verifyAccount(email, code, rememberMe);
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

export const resetPassword = createAsyncThunk(
    "auth/resetPassword",
    async ({ email, password, code, rememberMe }: { email: string; password: string; code: number; rememberMe: boolean }, thunkAPI) => {
        try {
            const response = await resetPasswordApi(email, password, code, rememberMe);
            if (response.status === 200) {
                return response.data.user;
            } else {
                return thunkAPI.rejectWithValue(response.data.error || "Password reset failed");
            }
        } catch (error) {
            return thunkAPI.rejectWithValue("Password reset failed");
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
        reducers: {
        forceLogout: (state) => {
            state.email = null;
            state.isVerified = false;
            state.isLoggedIn = false;
            state.verificationTokenExpires = null;
        }
    },
    extraReducers: builder => {
        builder
            .addCase(checkAuth.fulfilled, (state, action) => {
                const u = action.payload;
                state.email = u.email;
                state.isVerified = u.isVerified;
                state.isLoggedIn = true;
            })
            .addCase(checkAuth.rejected, state => {
                state.email = null;
                state.isVerified = false;
                state.isLoggedIn = false;
            })
            .addCase(login.fulfilled, (state, action) => {
                const u = action.payload;
                state.email = u.email;
                state.isVerified = u.isVerified;
                state.isLoggedIn = true;
            })
            .addCase(logout.fulfilled, state => {
                state.email = null;
                state.isVerified = false;
                state.isLoggedIn = false;
            })
            .addCase(signup.fulfilled, (state, action) => {
                const u = action.payload;
                state.email = u.email;
                state.isVerified = u.isVerified;
                state.isLoggedIn = false;
                state.verificationTokenExpires = u.verificationTokenExpires;
            })
            .addCase(verify.fulfilled, (state, action) => {
                const u = action.payload;
                state.email = u.email;
                state.isVerified = u.isVerified;
                state.isLoggedIn = u.isLoggedIn;
            })
            .addCase(resendVerification.fulfilled, (state, action) => {
                const u = action.payload;
                state.email = u.email;
                state.isVerified = u.isVerified;
                state.isLoggedIn = false;
                state.verificationTokenExpires = u.verificationTokenExpires;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                const u = action.payload;
                state.email = u.email;
                state.isVerified = u.isVerified;
                state.isLoggedIn = u.isLoggedIn;
                state.verificationTokenExpires = null; // Clear verification token on successful password reset
            });
    }
});


export const { forceLogout } = userSlice.actions;
export default userSlice.reducer;