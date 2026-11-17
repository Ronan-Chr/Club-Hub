// Login page for CH1. One form that switches between "Sign up" and "Log in".
import { useState } from 'react';
import api, { getErrorMessage } from '../api';

function Login({ onLoggedIn }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isSignup = mode === 'signup';

  async function handleSubmit(event) {
    event.preventDefault(); // stop the page from reloading
    setError('');
    try {
      const url = isSignup ? '/auth/signup' : '/auth/login';
      const body = isSignup ? { name, email, password } : { email, password };
      const response = await api.post(url, body);

      // Save the login token so the user stays logged in
      localStorage.setItem('token', response.data.token);
      onLoggedIn(response.data.user);
    } catch (err) {
      setError(getErrorMessage(err)); // e.g. "Wrong email or password."
    }
  }

  return (
    <section className="home">
      <h1>{isSignup ? 'Create your account' : 'Log in'}</h1>

      <form className="auth_form" onSubmit={handleSubmit}>
        {isSignup && (
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <p className="error">{error}</p>}

        <button type="submit" className="button">{isSignup ? 'Sign up' : 'Log in'}</button>
      </form>

      <p>
        {isSignup ? 'Already have an account? ' : "Don't have an account? "}
        <a href="#" className="switch_link" onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); }}>
          {isSignup ? 'Log in' : 'Sign up'}
        </a>
      </p>
    </section>
  );
}

export default Login;
