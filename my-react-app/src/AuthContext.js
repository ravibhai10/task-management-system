import React from "react";

// Shared AuthContext to avoid circular imports between App and Dashboard
export const AuthContext = React.createContext();

export default AuthContext;
