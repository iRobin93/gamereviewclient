import React, { useState, useRef, useEffect } from 'react';
import './GameListPage.css'; // Or use a separate CreateUserPage.css
import { useNavigate } from 'react-router-dom';
import { postUserToDatabase } from '../api/usersApi';
import gameReviewLogo from "../images/gameReviewLogo.png";
import { FaSpinner } from 'react-icons/fa';
function CreateUserPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const usernameInputRef = useRef(null);
    const emailInputRef = useRef(null);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [accountCreation, setAccountCreation] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        usernameInputRef.current?.focus();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (accountCreation)
            return;

        if (password !== confirmPassword) {
            setPasswordError("Passwords don't match");
            return;
        }
        setAccountCreation(true)
        setPasswordError('');
        const userInfo = {
            password: password,
            username: username,
            email: email
        }
        // Example logic — replace with actual API call or context logic
        try {
            await postUserToDatabase(userInfo);

        }
        catch (err) {
            alert(err.message);
            setAccountCreation(false);
            return;
        }
        setAccountCreation(false);
        // Navigate back to login (optional)
        navigate('/');
    };

    const styles = {
        container: {
            maxWidth: 400,
            margin: '3rem auto',
            padding: '2rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            borderRadius: 8,
            backgroundColor: '#fff',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        },
        heading: {
            marginBottom: '1.5rem',
            color: '#333',
            textAlign: 'center',
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
        },
        input: {
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            borderRadius: 6,
            border: '1px solid #ccc',
            outlineColor: '#007bff',
            transition: 'border-color 0.3s',
        },
        button: {
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#fff',
            backgroundColor: '#007bff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'background-color 0.3s',
        },
        buttonDisabled: {
            backgroundColor: '#6c757d',
            cursor: 'not-allowed',
        },
        loginPrompt: {
            marginTop: '1.5rem',
            fontSize: '0.9rem',
            color: '#555',
            textAlign: 'center',
        },
        loginLink: {
            color: '#007bff',
            textDecoration: 'underline',
            cursor: 'pointer',
            outline: 'none',
            userSelect: 'none',
        },
    };

    return (
        <div style={styles.container}>
            {/* Logo Section */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                <img
                    src={gameReviewLogo}
                    alt="GameReview Logo"
                    style={{ width: "150px", height: "auto" }}
                />
            </div>

            <h2 style={styles.heading}>Create New User</h2>

            <form onSubmit={handleCreateUser} style={styles.form}>
                <input
                    ref={usernameInputRef}
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={styles.input}
                    autoComplete="username"
                />
                <input
                    ref={emailInputRef}
                    type="text"
                    placeholder="Email (for verification)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                    autoComplete="email"
                />
                <input
                    type="password"
                    placeholder="Choose a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                    autoComplete="new-password"
                />
                <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={styles.input}
                    autoComplete="new-password"
                />

                {passwordError && (
                    <p style={{ color: "red", marginTop: "-0.5rem", marginBottom: "1rem", fontSize: "0.9rem" }}>
                        {passwordError}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={accountCreation}
                    style={accountCreation ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                >
                    {accountCreation ? (
                        <>
                            Creating account... <FaSpinner className="spin" />
                        </>
                    ) : (
                        "Create Account"
                    )}
                </button>

                {/* 🔔 Email verification notice */}
                <p
                    style={{
                        color: "#555",
                        fontSize: "0.9rem",
                        textAlign: "center",
                        marginTop: "1rem",
                        backgroundColor: "#f1f7ff",
                        borderRadius: "6px",
                        padding: "0.75rem 1rem",
                        border: "1px solid #cce1ff",
                    }}
                >
                    📧 After creating your account, you’ll receive an email with a verification link.
                    Please check your inbox (and spam folder) before logging in.
                </p>
            </form>

            <p style={styles.loginPrompt}>
                Already have an account?{" "}
                <span
                    onClick={() => navigate("/")}
                    style={styles.loginLink}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") navigate("/");
                    }}
                >
                    Login here
                </span>
            </p>
        </div>
    );


}

export default CreateUserPage;
