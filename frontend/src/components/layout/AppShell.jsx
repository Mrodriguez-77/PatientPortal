import TopNav from "./TopNav.jsx";

const AppShell = ({ children }) => (
  <div className="app-shell">
    <TopNav />
    <main className="page-container">{children}</main>
  </div>
);

export default AppShell;

