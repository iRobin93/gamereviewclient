import React from "react";
import "../css/policy.css";
import { useNavigate } from "react-router-dom";
export default function TermsOfUsePage() {
    const navigate = useNavigate();
    return (
        <div className="policy-container">
            <button className="back-button" onClick={() => navigate(-1)}>
                ← Back
            </button>
            <h1>Terms of Use</h1>
            <p><strong>Effective Date:</strong> October 13, 2025</p>
            <p>
                By using GameReview, you agree to follow these terms. You are
                responsible for the content you post and agree not to upload illegal,
                abusive, or copyrighted material.
            </p>
            <p>
                GameReview is provided “as is” without warranties. The creator is not
                liable for losses or damages resulting from use of this app.
            </p>
            <p>
                You may delete your account at any time. Continued use of this service
                means you accept these Terms of Use.
            </p>
        </div>
    );
}
