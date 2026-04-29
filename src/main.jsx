import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/authContext.jsx";
import { RoomProvider } from "./context/roomContext.jsx";
import { SidebarProvider } from "./context/sidebarContext.jsx";
import { Toaster } from "react-hot-toast";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <SidebarProvider>
        <RoomProvider>
          <App />
        </RoomProvider>
      </SidebarProvider>
    </AuthProvider>
    <Toaster
      position="top-center"
      toastOptions={{ duration: 4000, removeDelay: 1000 }}
    />
  </GoogleOAuthProvider>,
);
