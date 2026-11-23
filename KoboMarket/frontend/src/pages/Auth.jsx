import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, tokens } from "../api/client";
import { Button, Field, Card, act, toast } from "../components/ui";

const Shell = ({ title, sub, children }) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <div className="hidden flex-col justify-between bg-kobo-700 p-12 text-white lg:flex">
      <Link to="/" className="font-display text-2xl font-extrabold">
        KoboMarket
      </Link>
      <div>
        <h2 className="font-display text-5xl font-extrabold leading-tight">
          Pay safe.
          <br />
          Sell sure.
        </h2>
        <p className="mt-4 max-w-sm text-kobo-100">
          Your money sits in escrow until your order arrives. Vendors get paid
          when you confirm.
        </p>
      </div>
      <p className="text-sm text-kobo-100/70">
        Every kobo is tracked in a double-entry ledger.
      </p>
    </div>
    <div className="flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mb-6 mt-1 text-ink/60">{sub}</p>
        {children}
      </div>
    </div>
  </div>
);

export function Login() {
  const { login } = useAuth(),
    nav = useNavigate(),
    [f, setF] = useState({ email: "", password: "" }),
    [l, setL] = useState(false);
  const go = async (e) => {
    e.preventDefault();
    setL(true);
    const ok = await act(() => login(f.email, f.password).then(() => true));
    setL(false);
    ok && nav("/");
  };
  return (
    <Shell title="Welcome back" sub="Log in to your account">
      <form onSubmit={go} className="space-y-4">
        <Field
          label="Email"
          type="email"
          required
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
        />
        <Field
          label="Password"
          type="password"
          required
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
        />
        <Button loading={l} className="w-full">
          Log in
        </Button>
      </form>
      <p className="mt-4 text-sm">
        <Link to="/forgot-password" className="text-kobo-600">
          Forgot password?
        </Link>{" "}
        ·{" "}
        <Link to="/register" className="text-kobo-600">
          Create account
        </Link>
      </p>
    </Shell>
  );
}

export function Register() {
  const nav = useNavigate(),
    [f, setF] = useState({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    }),
    [l, setL] = useState(false);

  const go = async (e) => {
    e.preventDefault();
    setL(true);

    const ok = await act(
      () =>
        api("/user/signup", {
          method: "POST",
          body: f,
        }).then(() => true),
      "Account created. Check your email for your verification code.",
    );

    setL(false);
    ok && nav(`/verify-email?email=${encodeURIComponent(f.email)}`);
  };

  return (
    <Shell title="Create your account" sub="Takes less than a minute">
      <form onSubmit={go} className="space-y-4">
        <Field
          label="First name"
          required
          value={f.firstName}
          onChange={(e) => setF({ ...f, firstName: e.target.value })}
        />

        <Field
          label="Last name"
          required
          value={f.lastName}
          onChange={(e) => setF({ ...f, lastName: e.target.value })}
        />

        <Field
          label="Email"
          type="email"
          required
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
        />

        <Field
          label="Password"
          type="password"
          minLength={8}
          required
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
        />

        <Button loading={l} className="w-full">
          Sign up
        </Button>
      </form>

      <p className="mt-4 text-sm">
        Have an account?{" "}
        <Link to="/login" className="text-kobo-600">
          Log in
        </Link>
      </p>
    </Shell>
  );
}


export function Verify() {
  const [sp] = useSearchParams();
  const [email, setEmail] = useState(sp.get("email") || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const go = async (e) => {
    e.preventDefault();
    setLoading(true);

    const ok = await act(async () => {
      const data = await api("/user/verify-otp", {
        method: "POST",
        body: { email, otp },
      });

      tokens.set(data.accessToken);
      return true;
    }, "Email verified successfully");

    setLoading(false);

    if (ok) {
      nav("/");
      window.location.reload();
    }
  };

  return (
    <Shell
      title="Verify your email"
      sub="Enter the verification code sent to your email"
    >
      <form onSubmit={go} className="space-y-4">
        <Field
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Field
          label="Verification code"
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <Button loading={loading} className="w-full">
          Verify email
        </Button>
      </form>
    </Shell>
  );
}


export function Forgot() {
  const [email, setE] = useState("");
  const [otp, setOtp] = useState("");
  const [pw, setP] = useState("");
  const [step, setS] = useState(1);

  const send = async (e) => {
    e.preventDefault();

    const ok = await act(
      () =>
        api("/user/forgot-password", {
          method: "POST",
          body: { email },
        }).then(() => true),
      "If your account exists, a reset code has been sent.",
    );

    ok && setS(2);
  };

  const reset = async (e) => {
    e.preventDefault();

    const ok = await act(
      () =>
        api("/user/reset-password", {
          method: "POST",
          body: {
            email,
            otp,
            newPassword: pw,
          },
        }).then(() => true),
      "Password updated",
    );

    ok && setS(1);
  };

  return (
    <Shell
      title="Reset password"
      sub={
        step === 1
          ? "We will email you a reset code"
          : "Enter the code and your new password"
      }
    >
      {step === 1 ? (
        <form onSubmit={send} className="space-y-4">
          <Field
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setE(e.target.value)}
          />
          <Button className="w-full">Send reset code</Button>
        </form>
      ) : (
        <form onSubmit={reset} className="space-y-4">
          <Field
            label="Verification code"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <Field
            label="New password"
            type="password"
            minLength={8}
            required
            value={pw}
            onChange={(e) => setP(e.target.value)}
          />

          <Button className="w-full">Update password</Button>
        </form>
      )}

      <Link to="/login" className="mt-4 block text-sm text-kobo-600">
        Back to log in
      </Link>
    </Shell>
  );
}
