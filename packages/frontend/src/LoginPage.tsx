import React from "react";
import "./LoginPage.css";
import { Link } from "react-router";
import { useNavigate } from "react-router";

interface ILoginPageProps {
    isRegistering: boolean;
    onLogin?: (token: string) => void;
}

export function LoginPage(props: ILoginPageProps) {
    const usernameInputId = React.useId();
    const passwordInputId = React.useId();
    const navigate = useNavigate();

    function handleRegistration(username: string, password: string) {
        return fetch("/auth/register", {
            method: "POST", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: username, password: password }),
        })
            .then(res => {
                if (res.status >= 400) {
                    throw new Error("HTTP " + res.status);
                }
                return res.json();
            })
            .then((returnval) => {
                console.log("successfully created account");
                console.log("Token: ", returnval.token);
                props.onLogin?.(returnval.token);
                navigate("/");
                return { success: true, message: "" };
            })
            .catch(() => {
                return { success: false, message: "Failed to create account, try again" };
            });
    }

    function handleLogin(username: string, password: string) {
        return fetch("/auth/login", {
            method: "POST", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: username, password: password }),
        })
            .then(res => {
                if (res.status >= 400) {
                    throw new Error("HTTP " + res.status);
                }
                return res.json();
            })
            .then((returnval) => {
                console.log("Token: ", returnval.token);
                props.onLogin?.(returnval.token);
                navigate("/");
                return { success: true, message: "" };
            })
            .catch(() => {
                return { success: false, message: "Failed to login, try again" };
            });
    }

    const [result, submitAction, isPending] = React.useActionState(
        async (_: any, formData: FormData) => {
            const username = formData.get("username") as string;
            const password = formData.get("password") as string;

            if (props.isRegistering) {
                return handleRegistration(username, password);
            } else {
                return handleLogin(username, password);
            }
        },
        null
    );



    return (
        <>
            <h2>{props.isRegistering ? "Register a new account" : "Login"}</h2>
            <form className="LoginPage-form" action={submitAction}>
                <label htmlFor={usernameInputId}>Username</label>
                <input id={usernameInputId} name="username" required disabled={isPending}/>

                <label htmlFor={passwordInputId}>Password</label>
                <input id={passwordInputId} name="password" type="password" required disabled={isPending} />

                <input type="submit" value={isPending ? "Submitting..." : "Submit"} disabled={isPending} />
                {result?.success === false &&
                    <div id="error-announce" aria-live="polite" style={{ color: "red" }}>
                        {result.message}
                    </div>}
            </form>
            {!props.isRegistering && (
                <p>
                    Don't have an account? <Link to="/register"> Register here</Link>
                </p>
            )}
        </>
    );
}
