import React, { useState, useRef, useEffect } from 'react';
import './GameListPage.css'; // Or use a separate CreateUserPage.css
import { useNavigate } from 'react-router-dom';
import { postUserToDatabase } from '../api/usersApi';
import gameReviewLogo from "../images/gameReviewLogo.png";
function CreateUserPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const usernameInputRef = useRef(null);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        usernameInputRef.current?.focus();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setPasswordError("Passwords don't match");
            return;
        }

        setPasswordError('');
        const userInfo = {
            password: password,
            username: username
        }
        // Example logic — replace with actual API call or context logic
        try {
            await postUserToDatabase(userInfo);

        }
        catch (err) {
            alert(err.response.data);
            return;
        }

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
                    <p style={{ color: 'red', marginTop: '-0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        {passwordError}
                    </p>
                )}
                <button type="submit" style={styles.button}>
                    Create Account
                </button>
            </form>

            <p style={styles.loginPrompt}>
                Already have an account?{' '}
                <span
                    onClick={() => navigate('/')}
                    style={styles.loginLink}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') navigate('/');
                    }}
                >
                    Login here
                </span>
            </p>
        </div>
    );

}

export default CreateUserPage;
