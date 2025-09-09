import { Routes, Route, Link } from "react-router-dom";
import Subscription from "./Subscription";
import Login from "./login";

function App() {
  return (
    <>
      {/* Navbar */}
      <nav className="p-4 bg-blue-600 text-white flex gap-6 shadow-md">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/subscription" className="hover:underline">Subscription</Link>
        <Link to="/login" className="hover:underline">Login</Link>
      </nav>

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
              <h1 className="text-5xl font-extrabold text-blue-700 mb-4">
                Welcome to FloatChat 🚀
              </h1>
              <p className="text-lg text-gray-700">
                Explore ocean data with ease. Start by checking out our plans!
              </p>
              <Link
                to="/subscription"
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
              >
                View Plans
              </Link>
            </div>
          }
        />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
