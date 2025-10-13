import React from "react";
import "../css/policy.css";
import { useNavigate } from "react-router-dom";
export default function PrivacyPolicyPage() {
    const navigate = useNavigate();
    return (
        <div className="policy-container">
            <button className="back-button" onClick={() => navigate(-1)}>
                ← Back
            </button>
            <h1>Privacy Policy</h1>
            <p><strong>Effective Date:</strong> October 13, 2025</p>
            <p>
                GameReview collects usernames and emails solely for account creation
                and login purposes. Your data is securely stored and never shared with
                third parties. You may request deletion of your data at any time by
                contacting us at <strong>robinsjothun@getacademy.no</strong>
            </p>
            <p>
                This site does not use tracking cookies or analytics. Data is retained
                only as long as your account remains active.
            </p>
        </div>
    );
}
