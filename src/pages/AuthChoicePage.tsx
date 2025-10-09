import React from 'react';

export default function AuthChoicePage({ onSignIn, onRegister }: { onSignIn: () => void; onRegister: () => void }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <h1>Choose an option</h1>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onSignIn}>Sign In</button>
        <button onClick={onRegister}>Register</button>
      </div>
    </div>
  );
}
