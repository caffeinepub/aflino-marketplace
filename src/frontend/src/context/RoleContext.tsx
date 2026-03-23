import { createContext, useContext, useState } from "react";

export type Role = "admin" | "seller" | "customer" | null;

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextValue>({
  role: null,
  setRole: () => {},
  logout: () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(null);

  const logout = () => setRole(null);

  return (
    <RoleContext.Provider value={{ role, setRole, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
