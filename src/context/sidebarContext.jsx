import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext(null);

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isDesktop) {
      setIsPinned(!isPinned);
      setIsOpen(!isPinned);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isPinned, setIsPinned, toggleSidebar, isDesktop }}>
      {children}
    </SidebarContext.Provider>
  );
};
