import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Building2 } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) setError(error.message);
      else setMessage('Password reset link sent to your email!');
    } else if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage('Account created! You can now sign in.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Union Parishad Digital Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Smart Ledger — Financial Tracking System</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {mode === 'forgot' ? 'Reset Password' : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </h2>

          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
          {message && <div className="mb-4 p-3 rounded-lg bg-status-delivered-light text-status-delivered text-sm">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@example.com"
              />
            </div>
            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait...' : mode === 'forgot' ? 'Send Reset Link' : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground space-y-1">
            {mode === 'login' && (
              <>
                <p>
                  <button onClick={() => { setMode('forgot'); setError(''); setMessage(''); }} className="text-primary font-medium hover:underline">
                    Forgot Password?
                  </button>
                </p>
                <p>
                  Don't have an account?{' '}
                  <button onClick={() => { setMode('signup'); setError(''); setMessage(''); }} className="text-primary font-medium hover:underline">
                    Create Account
                  </button>
                </p>
              </>
            )}
            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError(''); setMessage(''); }} className="text-primary font-medium hover:underline">
                  Sign In
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <p>
                <button onClick={() => { setMode('login'); setError(''); setMessage(''); }} className="text-primary font-medium hover:underline">
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Developed & Maintained by Md. Rubel Islam | Digital Center Management System
        </p>
      </div>
    </div>
  );
};

export default Auth;
