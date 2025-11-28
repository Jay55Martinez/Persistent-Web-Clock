import { useEffect } from 'react';
import { googleOAuthLogin } from '../state/user/userSlice';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch } from '../state/store';

declare const google: any;

export default function OAuthLogin() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    useEffect(() => {
        window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_CLIENT_ID,
            callback: handleCredentialResponse
        })

        const btn = document.getElementById("google-login");
        if (btn) {
        google.accounts.id.renderButton(btn, {
            theme: "outline",
            size: "large",
            type: "standard",
        });
        }
    }, [])

    async function handleCredentialResponse(response: any) {
        const { credential } = response;

        if (credential) {
            const resultAction = await dispatch(googleOAuthLogin({ token: credential, rememberMe: false }));
            if (googleOAuthLogin.fulfilled.match(resultAction)) {
                navigate('/timer');
            } 
            else {
                console.error("Google OAuth login failed");
            }
        }
    }

    return <div id="google-login"></div>;
}