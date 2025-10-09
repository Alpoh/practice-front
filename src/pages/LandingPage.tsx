export default function LandingPage({ onNext }: { onNext: () => void }) {
    return (
        <div className="landing-page" style={{ padding: 24 }}>
            <h1>Hello, World</h1>
            <p>Welcome! This is an informative landing page. Press Next to continue.</p>
            <button type="button" onClick={onNext} style={{ marginTop: 12 }}>Next</button>
        </div>
    );
}
