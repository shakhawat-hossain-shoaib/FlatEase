import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface BaseLayoutProps {
  children: ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <header className="d-flex align-items-center my-1 bg-light navbar-mx">
        <h3>
          <Link className="text-decoration-none text-dark" to="/">
            FlatEase
          </Link>
        </h3>
        <div className="flex-grow-1"></div>
      </header>
      <main id="content">{children}</main>
    </div>
  );
};

export default BaseLayout;
