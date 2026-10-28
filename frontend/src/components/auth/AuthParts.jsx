import { useState } from "react";
import { Eye, EyeOff, Lock, Sprout } from "lucide-react";

export function AuthShell({ title, subtitle, footer, children }) {
  return (
    <main className="ca-auth">
      <section className="ca-auth-card" aria-labelledby="ca-auth-title">
        <div className="ca-auth-brand">
          <Sprout size={22} aria-hidden="true" />
          <span>Krishi Mitra</span>
        </div>
        <h1 id="ca-auth-title">{title}</h1>
        <p className="ca-auth-sub">{subtitle}</p>
        {children}
        <p className="ca-auth-switch">{footer}</p>
      </section>
    </main>
  );
}

export function Field({ id, label, icon: Icon, error, trailing, ...inputProps }) {
  return (
    <div className="ca-field">
      <label htmlFor={id}>{label}</label>
      <div className={`ca-input${error ? " ca-input--error" : ""}`}>
        <Icon size={18} aria-hidden="true" />
        <input
          id={id}
          name={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-err` : undefined}
          {...inputProps}
        />
        {trailing}
      </div>
      {error && (
        <p className="ca-error" id={`${id}-err`}>
          {error}
        </p>
      )}
    </div>
  );
}

export function PasswordField(props) {
  const [show, setShow] = useState(false);
  return (
    <Field
      {...props}
      icon={Lock}
      type={show ? "text" : "password"}
      trailing={
        <button
          type="button"
          className="ca-eye"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  );
}
