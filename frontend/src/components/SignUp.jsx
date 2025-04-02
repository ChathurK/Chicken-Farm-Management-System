import { useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Employee"); // Default role is Employee

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Sign Up:", { firstName, lastName, email, password, role });
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${assets.signUpBg})` }}
    >
      <div className="bg-white bg-opacity-50 backdrop-blur-sm p-8 rounded-lg shadow-lg w-auto">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name and Last Name in one row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-600">First Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-600">Last Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-600">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-600">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-600">Confirm Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-600">Role</label>
            <div className="relative z-20">
              <select
                className="w-full px-3 py-2  appearance-none border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="Admin">Admin</option>
                <option value="Employee">Employee</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </span>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/signin" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
