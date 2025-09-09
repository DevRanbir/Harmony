import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          Welcome to FloatChat 🌊
        </h1>
        <p className="text-gray-600 mb-8">
          Sign in to explore ARGO ocean data and visualization.
        </p>

        {/* If user is not signed in, show sign in & sign up buttons */}
        <SignedOut>
          <div className="flex flex-col gap-4">
            <SignInButton mode="modal">
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="w-full px-6 py-3 bg-gray-100 text-blue-600 rounded-xl shadow hover:bg-gray-200 transition">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </SignedOut>

        {/* If user is signed in, show profile button */}
        <SignedIn>
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg font-medium text-green-600">You’re signed in ✅</p>
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
