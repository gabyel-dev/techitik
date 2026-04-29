import { createContext, useContext, useState } from "react";

const SidebarContext = createContext(null);

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const toggleSidebar = () => {
    setIsPinned(!isPinned);
    setIsOpen(!isPinned);
  };

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        setIsOpen,
        isPinned,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
