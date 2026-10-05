import { Brand } from "./brand";
export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page">
      <aside className="auth-story">
        <Brand />
        <div>
          <p className="eyebrow">THE LOGICSPHERE WORKSPACE</p>
          <h2>
            Clarity.
            <br />
            Control.
            <br />
            <em>Possibility.</em>
          </h2>
          <p>One place to shape your digital presence.</p>
        </div>
        <span className="auth-footnote">LOGICSPHERE INC / SECURE ACCESS</span>
      </aside>
      <main id="main" className="auth-main">
        <div className="auth-card">
          <p className="eyebrow">WORKSPACE ACCESS</p>
          <h1>{title}</h1>
          <p className="muted">{description}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
