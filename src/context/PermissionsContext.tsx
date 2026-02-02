import React, { createContext, useContext } from 'react';

export type UserRole = 'admin' | 'user' | 'moderator';

export interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
  manage_users: boolean;
}

interface PermissionsContextType {
  userRole: UserRole | null;
  permissions: Permission;
  hasPermission: (permission: keyof Permission) => boolean;
  setUserRole: (role: UserRole) => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  admin: {
    create: true,
    read: true,
    update: true,
    delete: true,
    export: true,
    manage_users: true,
  },
  moderator: {
    create: true,
    read: true,
    update: true,
    delete: false,
    export: true,
    manage_users: false,
  },
  user: {
    create: false,
    read: true,
    update: false,
    delete: false,
    export: false,
    manage_users: false,
  },
};

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);

  const permissions = userRole ? ROLE_PERMISSIONS[userRole] : {
    create: false,
    read: false,
    update: false,
    delete: false,
    export: false,
    manage_users: false,
  };

  const hasPermission = (permission: keyof Permission): boolean => {
    return permissions[permission] === true;
  };

  return (
    <PermissionsContext.Provider value={{ userRole, permissions, hasPermission, setUserRole }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions deve ser usado dentro de PermissionsProvider');
  }
  return context;
}
