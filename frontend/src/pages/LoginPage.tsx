import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

interface LocationState {
  from?: { pathname: string };
}

function LoginPage() {
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const from = state?.from?.pathname ?? "/";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result =
      mode === "login"
        ? await signIn(email, password)
        : await signUp(email, password, fullName);

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (mode === "login") {
      navigate(from, { replace: true });
    } else {
      setMode("login");
      setError("Account created. Check your email to confirm, then sign in.");
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setError(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold uppercase tracking-tight text-on-background">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-on-surface-variant">
          {mode === "login"
            ? "Sign in to join events and book resources."
            : "Join CampusConnect to get started."}
        </p>
      </div>

      {error ? (
        <div className="rounded-[1rem] border-2 border-on-background bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "signup" ? (
          <Input
            label="Full name"
            type="text"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        ) : null}
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Please wait…"
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </Button>
      </form>

      <div className="flex items-center gap-4">
        <div className="h-0.5 flex-1 bg-outline-variant" />
        <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          or
        </span>
        <div className="h-0.5 flex-1 bg-outline-variant" />
      </div>

      <Button variant="secondary" onClick={handleGoogle} disabled={submitting}>
        Continue with Google
      </Button>

      <p className="text-center text-sm text-on-surface-variant">
        {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={switchMode}
          className="font-bold text-primary underline"
        >
          {mode === "login" ? "Create one" : "Sign in"}
        </button>
      </p>
    </div>
  );
}

export default LoginPage;