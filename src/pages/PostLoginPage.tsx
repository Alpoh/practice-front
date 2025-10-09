import React from 'react';

export default function PostLoginPage({ onExit }: { onExit?: () => void }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <h1>You're in the world</h1>
      {onExit && <button onClick={onExit}>Exit</button>}
    </div>
  );
}
