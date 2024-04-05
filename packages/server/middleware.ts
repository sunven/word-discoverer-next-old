import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  debug: false,
  ignoredRoutes: [
    '/api',
    // '/api/vocabulary'
  ],
})
