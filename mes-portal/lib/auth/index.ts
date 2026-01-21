// Re-export from root auth.ts for backward compatibility
export { handlers, auth, signIn, signOut } from '@/auth'
export { authorizeCredentials, jwtCallback, sessionCallback } from './auth.config'
