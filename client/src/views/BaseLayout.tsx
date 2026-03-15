import { ReactNode } from "react";

interface BaseLayoutProps {
  children: ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <main id="content">{children}</main>
    </div>
  );
};

export default BaseLayout;
