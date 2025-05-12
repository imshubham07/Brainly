import { useRef, useState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { signupValid, ValidationErrors, validateForm } from "../utils/validation";

export function Signup(): JSX.Element {
  // References for the input fields
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  
  // State for loading status and validation errors
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  // Navigate hook for routing
  const navigate = useNavigate();
  
  // Signup function to handle user registration
  async function signup() {
    try {
      // Get input values
      const username = usernameRef.current?.value || "";
      const password = passwordRef.current?.value || "";
      
      // Validate form data
      const validationErrors = validateForm(signupValid, { username, password });
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      // Clear previous errors
      setErrors({});
      setIsLoading(true);
      
      // Send request to server
      await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
        password
      });
      
      navigate("/signin");
      alert("You have signed up!");
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen flex justify-center items-center p-4 relative overflow-hidden bg-gradient-to-br from-purple-600 to-blue-700">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* Large circles */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-400 opacity-10 rounded-full blur-3xl"></div>
        
        {/* Floating shapes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-300 opacity-20 rounded-lg rotate-12 blur-xl"></div>
        <div className="absolute bottom-1/3 left-2/3 w-40 h-40 bg-indigo-300 opacity-10 rounded-full blur-2xl"></div>
        
        {/* Animated dots grid (purely decorative) */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden backdrop-blur-sm bg-white/10 border border-white/20 z-10">
        {/* Header section with logo and welcome text */}
        <div className="bg-white/30 backdrop-blur-sm px-8 py-6 border-b border-gray-200/50">
          <div className="flex justify-center mb-3">
            <div className="h-16 w-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800">Create Account</h1>
          <p className="text-center text-gray-600 mt-1">Sign up to get started</p>
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
                placeholder="Choose a username"
                className={`w-full px-4 py-3 border ${
                  errors.username ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Only lowercase letters, numbers, and underscores allowed
              </p>
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
                placeholder="Choose a password"
                className={`w-full px-4 py-3 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 characters required
              </p>
            </div>
            
            {/* Sign up button */}
            <div>
              <Button
                onClick={signup}
                loading={isLoading}
                variant="primary"
                text={isLoading ? "Creating account..." : "Create account"}
                fullWidth={true}
                className="py-3 font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg transition-all duration-300 focus:ring-4 focus:ring-purple-300 shadow-lg hover:shadow-xl"
              />
            </div>
            
            {/* Sign in option */}
            <div className="text-center text-sm text-gray-600 pt-2">
              Already have an account?{" "}
              <a href="/signin" className="font-medium text-purple-600 hover:text-purple-800">
                Sign in
              </a>
            </div>
            
            {/* Validation requirements */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h3>
              <ul className="text-xs text-gray-600 space-y-1 pl-5 list-disc">
                <li>Username must be at least 4 characters</li>
                <li>Username can only contain lowercase letters, numbers, and underscores</li>
                <li>Password must be at least 8 characters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}