import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function SSOCallback() {
  // Handle the callback and redirect the user
  return <AuthenticateWithRedirectCallback />
}
