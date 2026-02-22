import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  FaHeartbeat,
  FaStethoscope,
  FaUserMd,
  FaHospital,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaPhone,
  FaSpinner
} from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState("email");
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });
  const heartbeatX = useTransform(springX, (v) => v * 1.5);
  const heartbeatY = useTransform(springY, (v) => v * 1.5);
  const stethoscopeX = useTransform(springX, (v) => -v * 2);
  const stethoscopeY = useTransform(springY, (v) => -v * 2);
  const userMdX = useTransform(springX, (v) => v * 2.5);
  const userMdY = useTransform(springY, (v) => -v * 1.2);
  const hospitalX = useTransform(springX, (v) => -v * 1.8);
  const hospitalY = useTransform(springY, (v) => v * 1.8);
  const cardRotateX = useTransform(springY, (v) => v * 0.5);
  const cardRotateY = useTransform(springX, (v) => -v * 0.5);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const handleMouseMove = (e) => {
    if (isMobile) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    mouseX.set(x);
    mouseY.set(y);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    // Validate based on login method
    if (loginMethod === "email") {
      if (!email) {
        setError("Email is required");
        return;
      }
      if (!email.includes('@')) {
        setError("Please enter a valid email address");
        return;
      }
    } else {
      if (!mobileNumber) {
        setError("Mobile number is required");
        return;
      }
      if (!/^\d{10}$/.test(mobileNumber)) {
        setError("Please enter a valid 10-digit mobile number");
        return;
      }
    }
    
    if (!password) {
      setError("Password is required");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Prepare login credentials based on method
      const credentials = loginMethod === "email" 
        ? { email, password }
        : { mobileNumber, password };
      
      const result = await login(credentials);
      
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative overflow-y-auto py-4 sm:py-6 md:py-8"
      style={{
        backgroundImage: isMobile
          ? "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"
          : "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80')",
      }}
      onMouseMove={handleMouseMove}
    >
      <div className={`absolute inset-0 ${isMobile ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-900 bg-opacity-70'}`}></div>
      
      {!isMobile && (
        <>
          <motion.div
            style={{ x: heartbeatX, y: heartbeatY }}
            className="absolute top-20 left-20 text-white text-5xl opacity-20 hidden md:block"
          >
            <FaHeartbeat />
          </motion.div>

          <motion.div
            style={{ x: stethoscopeX, y: stethoscopeY }}
            className="absolute bottom-20 right-20 text-white text-6xl opacity-20 hidden md:block"
          >
            <FaStethoscope />
          </motion.div>

          <motion.div
            style={{ x: userMdX, y: userMdY }}
            className="absolute top-1/3 right-10 text-white text-5xl opacity-20 hidden md:block"
          >
            <FaUserMd />
          </motion.div>

          <motion.div
            style={{ x: hospitalX, y: hospitalY }}
            className="absolute bottom-1/3 left-10 text-white text-5xl opacity-20 hidden md:block"
          >
            <FaHospital />
          </motion.div>
        </>
      )}
      
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative text-center text-white mb-4 sm:mb-6 md:mb-8 px-4 z-10 w-full max-w-md mx-auto"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2 md:mb-3 drop-shadow-lg">
          Welcome to MediCare+
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl drop-shadow-md">
          Your Health, Our Priority
        </p>
      </motion.div>
      
      <motion.div
        style={!isMobile ? {
          rotateX: cardRotateX,
          rotateY: cardRotateY,
        } : {}}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative bg-white/95 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl w-[90%] sm:w-[400px] md:w-96 z-10 mx-auto"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-blue-700">
          Login
        </h2>
        
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 mb-3 sm:mb-4 text-center text-sm sm:text-base bg-red-50 p-2 rounded-lg"
          >
            {error}
          </motion.p>
        )}
        
        {/* Login Method Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("email");
              setError("");
              setEmail("");
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
              loginMethod === "email"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FaEnvelope className={loginMethod === "email" ? "text-white" : "text-gray-500"} />
            Email
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod("mobile");
              setError("");
              setMobileNumber("");
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
              loginMethod === "mobile"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FaPhone className={loginMethod === "mobile" ? "text-white" : "text-gray-500"} />
            Mobile
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {loginMethod === "email" ? (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-3 sm:mb-4"
            >
              <label className="block mb-1 font-medium text-sm sm:text-base">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className={`w-full border p-2 sm:p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm sm:text-base ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter your email"
                  required={loginMethod === "email"}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-3 sm:mb-4"
            >
              <label className="block mb-1 font-medium text-sm sm:text-base">Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  disabled={isLoading}
                  className={`w-full border p-2 sm:p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm sm:text-base ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter 10-digit mobile number"
                  maxLength="10"
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit mobile number"
                  required={loginMethod === "mobile"}
                />
              </div>
            </motion.div>
          )}
          
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4 sm:mb-6"
          >
            <label className="block mb-1 font-medium text-sm sm:text-base">Password</label>
            <div className={`flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 transition ${
              isLoading ? 'bg-gray-100' : ''
            }`}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={`w-full p-2 sm:p-3 rounded-l-lg outline-none text-sm sm:text-base ${
                  isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className={`px-2 sm:px-3 text-gray-500 hover:text-blue-600 transition ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={isMobile ? 18 : 20} /> : <FaEye size={isMobile ? 18 : 20} />}
              </button>
            </div>
          </motion.div>
          
          <motion.button
            whileTap={!isLoading ? { scale: 0.95 } : {}}
            whileHover={!isMobile && !isLoading ? { scale: 1.02, boxShadow: "0 10px 25px -5px rgba(59,130,246,0.5)" } : {}}
            type="submit"
            disabled={isLoading}
            className={`w-full text-white p-2.5 sm:p-3 rounded-lg transition duration-300 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 ${
              isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </motion.button>
        </form>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 sm:mt-6 text-center text-gray-600 text-sm sm:text-base"
        >
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Register
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;