import type { GlobalProvider } from "@ladle/react";
import { useEffect, useState } from "react";
import "../src/styles.css";

export const Provider: GlobalProvider = ({ children, globalState }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Force re-render after mount to ensure styles are applied
    setMounted(true);
  }, []);

  return (
    <div key={mounted ? 'mounted' : 'initial'} style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
};
