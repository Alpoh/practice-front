import './App.css'
import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import SignInPage from './pages/SignInPage'

type View = 'landing' | 'choice' | 'register' | 'signin' | 'success'

function App() {
    const [view, setView] = useState<View>('landing')

    return (
        <>
            {view === 'landing' && (
                <LandingPage onNext={() => setView('choice')} />
            )}

            {view === 'choice' && (
                <div style={{ padding: 24 }}>
                    <h2>Welcome! Choose an option</h2>
                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                        <button type="button" onClick={() => setView('register')}>Register</button>
                        <button type="button" onClick={() => setView('signin')}>Sign In</button>
                    </div>
                </div>
            )}

            {view === 'register' && (
                <RegisterPage onBack={() => setView('choice')} onGoToSignIn={() => setView('signin')} />
            )}

            {view === 'signin' && (
                <SignInPage onBack={() => setView('choice')} onSuccess={() => setView('success')} />
            )}

            {view === 'success' && (
                <div style={{ padding: 24 }}>
                    <h1>You're in the world!</h1>
                    <p>Welcome back. You are now logged in.</p>
                </div>
            )}
        </>
    )
}

export default App
