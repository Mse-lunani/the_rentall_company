// ── src/app/layout.jsx ──
// This top-level layout is a “pass-through.” It does NOT render
// any <html> or <head> tags of its own. Its sole job is to render
// its children, which will then pick up either the (auth) or (main) layout.

export default function RootLayout({ children }) {
  return <>{children}</>;
}
