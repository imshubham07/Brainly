import { useRef, useState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signinValid, ValidationErrors, validateForm } from "../utils/validation";

export function Signin(): JSX.Element {
  // State for loading status and validation errors
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  // References for the input fields
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  
  // Navigate hook for routing
  const navigate = useNavigate();
  
  // Signin function to handle authentication
  async function signin() {
    try {
      // Get input values
      const username = usernameRef.current?.value || "";
      const password = passwordRef.current?.value || "";
      
      // Validate form data
      const validationErrors = validateForm(signinValid, { username, password });
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      // Clear previous errors
      setErrors({});
      setIsLoading(true);
      
      const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username,
        password
      });
      
      const jwt = response.data.token;
      localStorage.setItem("token", jwt);
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen flex justify-center items-center p-4 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* Large circles */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-pink-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400 opacity-10 rounded-full blur-3xl"></div>
        
        {/* Floating shapes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-300 opacity-20 rounded-lg rotate-12 blur-xl"></div>
        <div className="absolute bottom-1/3 left-2/3 w-40 h-40 bg-green-300 opacity-10 rounded-full blur-2xl"></div>
        
        {/* Animated dots grid (purely decorative) */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden backdrop-blur-sm bg-white/10 border border-white/20 z-10">
        {/* Header section with logo and welcome text */}
        <div className="bg-white/30 backdrop-blur-sm px-8 py-6 border-b border-gray-200/50">
          <div className="flex justify-center mb-3">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800">Welcome back</h1>
          <p className="text-center text-gray-600 mt-1">Sign in to your account</p>
        </div>
        
        {/* Form section */}
        <div className="p-8 bg-white">
          <div className="space-y-6">
            {/* Username field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <Input
                id="username"
                reference={usernameRef}
                placeholder="Enter your username"
                className={`w-full px-4 py-3 border ${
                  errors.username ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>
            
            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                reference={passwordRef}
                type="password"
                placeholder="Enter your password"
                className={`w-full px-4 py-3 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            
            {/* Sign in button */}
            <div>
              <Button
                onClick={signin}
                loading={isLoading}
                variant="primary"
                text={isLoading ? "Signing in..." : "Sign in"}
                fullWidth={true}
                className="py-3 font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all duration-300 focus:ring-4 focus:ring-indigo-300 shadow-lg hover:shadow-xl"
              />
            </div>
            
            {/* Sign up option */}
            <div className="text-center text-sm text-gray-600 pt-2">
              Don't have an account?{" "}
              <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-800">
                Create account
              </a>
            </div>
            
            {/* Validation requirements */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h3>
              <ul className="text-xs text-gray-600 space-y-1 pl-5 list-disc">
                <li>Username must be at least 4 characters</li>
                <li>Password must be at least 8 characters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}