import { createPortal } from "react-dom";

export default function Portal({ children }) {
    console.log("Portal rendering!");
    return createPortal(
      <div style={{ position: "fixed", top: 100, left: 100, zIndex: 999999, background: "white" }}>
        {children}
      </div>,
      document.body
    );
  }
  
