import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Routes, Route, MemoryRouter, useNavigate } from 'react-router-dom'
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  useAuth,
  useUser,
  ClerkProvider,
  useClerk,
} from '@clerk/chrome-extension'

function HelloUser() {
  const { isSignedIn, user } = useUser()
  const { getToken, signOut } = useAuth()

  const [sessionToken, setSessionToken] = React.useState('')

  if (!isSignedIn) {
    return null
  }

  useEffect(() => {
    getToken().then(setSessionToken)
  }, [])

  return (
    <div style={{ overflow: 'hidden' }}>
      <p>Hi, {user.primaryEmailAddress?.emailAddress}!</p>
      <p>Clerk Session Token: {sessionToken}</p>
      <p>
        <button onClick={() => signOut()}>Sign out</button>
      </p>
    </div>
  )
}

const publishableKey = 'pk_test_ZGFyaW5nLXJoaW5vLTQ0LmNsZXJrLmFjY291bnRzLmRldiQ'

function ClerkProviderWithRoutes() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <ClerkProvider
        publishableKey={publishableKey}
        navigate={(to) => navigate(to)}
        // syncSessionWithTab
      >
        <Routes>
          <Route path="/sign-up/*" element={<SignUp signInUrl="/" />} />
          <Route
            path="/"
            element={
              <>
                <SignedIn>
                  <HelloUser />
                </SignedIn>
                <SignedOut>
                  <SignIn afterSignInUrl="/"  signUpUrl="/sign-up" />
                </SignedOut>
              </>
            }
          />
        </Routes>
      </ClerkProvider>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <MemoryRouter>
      <ClerkProviderWithRoutes />
    </MemoryRouter>
  </React.StrictMode>,
)
