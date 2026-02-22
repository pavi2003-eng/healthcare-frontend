import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaHeartbeat,
  FaTint,
  FaWeight,
  FaVenusMars,
  FaStethoscope,
  FaSyringe,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPhone,
  FaSpinner
} from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "", // New mobile number field
    password: "",
    age: "",
    gender: "Male",
    bloodPressure: "",
    glucoseLevel: "",
    heartRate: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showHealth, setShowHealth] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [glucoseHigh, setGlucoseHigh] = useState(false);
  const [bpHigh, setBpHigh] = useState(false);
  const [hrHigh, setHrHigh] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });
  const rotateX = useTransform(springY, (v) => v * 0.3);
  const rotateY = useTransform(springX, (v) => -v * 0.3);
  const icon1X = useTransform(springX, (v) => v * 2);
  const icon1Y = useTransform(springY, (v) => v * 1.5);
  const icon2X = useTransform(springX, (v) => -v * 2.5);
  const icon2Y = useTransform(springY, (v) => -v * 2);
  const icon3X = useTransform(springX, (v) => v * 3);
  const icon3Y = useTransform(springY, (v) => -v * 1.8);
  const icon4X = useTransform(springX, (v) => -v * 1.5);
  const icon4Y = useTransform(springY, (v) => v * 2.2);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    const glucose = parseFloat(formData.glucoseLevel);
    setGlucoseHigh(!isNaN(glucose) && glucose > 140);
    const bp = parseFloat(formData.bloodPressure);
    setBpHigh(!isNaN(bp) && bp > 120);
    const hr = parseFloat(formData.heartRate);
    setHrHigh(!isNaN(hr) && hr > 100);
  }, [formData.glucoseLevel, formData.bloodPressure, formData.heartRate]);
  
  const handleMouseMove = (e) => {
    if (isMobile) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    mouseX.set(x);
    mouseY.set(y);
  };
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setTouchedFields({ ...touchedFields, [e.target.name]: true });
  };
  
  const handleBlur = (e) => {
    setTouchedFields({ ...touchedFields, [e.target.name]: true });
  };
  
  const validate = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.includes("@")) return "Valid email required";
    if (!formData.mobileNumber) return "Mobile number is required";
    if (!/^\d{10}$/.test(formData.mobileNumber)) return "Please enter a valid 10-digit mobile number";
    if (formData.password.length < 6)
      return "Password must be at least 6 characters";
    if (!formData.glucoseLevel)
      return "Glucose Level is mandatory";
    return null;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const payload = {
        ...formData,
        age: formData.age ? Number(formData.age) : undefined,
        bloodPressure: formData.bloodPressure
          ? Number(formData.bloodPressure)
          : undefined,
        glucoseLevel: Number(formData.glucoseLevel),
        heartRate: formData.heartRate
          ? Number(formData.heartRate)
          : undefined,
      };
      
      const result = await register(payload);
      
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
          : "url('https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=1600&q=80')",
      }}
      onMouseMove={handleMouseMove}
    >
      <div className={`absolute inset-0 ${isMobile ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-900 bg-opacity-75'}`}></div>
      
      {!isMobile && (
        <>
          <motion.div
            style={{ x: icon1X, y: icon1Y }}
            className="absolute top-20 left-20 text-white text-5xl opacity-20 hidden md:block"
          >
            <FaHeartbeat />
          </motion.div>
          <motion.div
            style={{ x: icon2X, y: icon2Y }}
            className="absolute bottom-20 right-20 text-white text-6xl opacity-20 hidden md:block"
          >
            <FaStethoscope />
          </motion.div>
          <motion.div
            style={{ x: icon3X, y: icon3Y }}
            className="absolute top-1/4 right-10 text-white text-5xl opacity-20 hidden md:block"
          >
            <FaSyringe />
          </motion.div>
          <motion.div
            style={{ x: icon4X, y: icon4Y }}
            className="absolute bottom-1/4 left-10 text-white text-5xl opacity-20 hidden md:block"
          >
            <FaTint />
          </motion.div>
        </>
      )}
      
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative text-center text-white mb-4 sm:mb-6 md:mb-8 px-4 z-10 w-full max-w-lg mx-auto"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg">
          Join MediCare+
        </h1>
        <p className="text-sm sm:text-base md:text-lg drop-shadow-md">
          Create your patient account
        </p>
      </motion.div>
      
      <motion.div
        style={!isMobile ? {
          rotateX: rotateX,
          rotateY: rotateY,
        } : {}}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative bg-white/95 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl w-[95%] sm:w-[500px] md:max-w-lg max-h-[85vh] overflow-y-auto z-10 mx-auto scrollbar-thin scrollbar-thumb-blue-300"
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center text-blue-700">
          Patient Registration
        </h2>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-500 mb-3 sm:mb-4 text-center text-sm sm:text-base bg-red-50 p-2 rounded-lg"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-3 sm:mb-4 relative"
          >
            <FaUser className="absolute left-3 top-3 text-gray-400 text-sm sm:text-base" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={`w-full border p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition text-sm sm:text-base ${
                isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              required
            />
          </motion.div>
          
          {/* Email Field */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-3 sm:mb-4 relative"
          >
            <FaEnvelope className="absolute left-3 top-3 text-gray-400 text-sm sm:text-base" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={`w-full border p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition text-sm sm:text-base ${
                isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              required
            />
          </motion.div>
          
          {/* Mobile Number Field - NEW */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mb-3 sm:mb-4 relative"
          >
            <FaPhone className="absolute left-3 top-3 text-gray-400 text-sm sm:text-base" />
            <input
              type="tel"
              name="mobileNumber"
              placeholder="Mobile Number (10 digits)"
              value={formData.mobileNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={`w-full border p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition text-sm sm:text-base ${
                isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit mobile number"
              required
            />
            {touchedFields.mobileNumber && formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber) && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-500 mt-1"
              >
                Please enter a valid 10-digit mobile number
              </motion.p>
            )}
          </motion.div>
          
          {/* Password Field */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-3 sm:mb-4"
          >
            <div className={`flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-300 transition ${
              isLoading ? 'bg-gray-100' : ''
            }`}>
              <div className="px-2 sm:px-3 text-gray-400">
                <FaLock className="text-sm sm:text-base" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={`w-full py-2 sm:py-2.5 outline-none text-sm sm:text-base ${
                  isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                required
                minLength="6"
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
                {showPassword ? <FaEyeSlash size={isMobile ? 16 : 18} /> : <FaEye size={isMobile ? 16 : 18} />}
              </button>
            </div>
            {touchedFields.password && formData.password.length > 0 && formData.password.length < 6 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-500 mt-1"
              >
                Password must be at least 6 characters
              </motion.p>
            )}
          </motion.div>
          
          {/* Age & Gender Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <FaWeight className="absolute left-3 top-3 text-gray-400 text-sm sm:text-base" />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={`w-full border p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition text-sm sm:text-base ${
                  isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                min="0"
                max="150"
              />
            </motion.div>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <FaVenusMars className="absolute left-3 top-3 text-gray-400 text-sm sm:text-base z-10" />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={`w-full border p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 outline-none transition text-sm sm:text-base appearance-none ${
                  isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </motion.div>
          </div>
          
          {/* Health Details Toggle Button */}
          <motion.button
            whileTap={!isLoading ? { scale: 0.95 } : {}}
            type="button"
            onClick={() => setShowHealth(!showHealth)}
            disabled={isLoading}
            className={`w-full p-2 sm:p-2.5 rounded-lg mb-3 font-semibold transition text-sm sm:text-base flex items-center justify-center gap-2 ${
              isLoading 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <FaInfoCircle className={showHealth ? "text-blue-700" : "text-blue-500"} />
            {showHealth ? "Hide Health Details ▲" : "Add Health Details ▼"}
          </motion.button>
          
          {/* Collapsible Health Section */}
          <AnimatePresence>
            {showHealth && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 p-3 sm:p-4 rounded-lg border mb-3 space-y-3 sm:space-y-4"
              >
                {/* Glucose Field */}
                <motion.div
                  animate={glucoseHigh ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ repeat: glucoseHigh ? Infinity : 0, duration: 1.5 }}
                  className="relative"
                >
                  <FaTint
                    className={`absolute left-3 top-3 z-10 text-sm sm:text-base ${
                      glucoseHigh ? "text-red-500" : "text-blue-400"
                    }`}
                  />
                  <input
                    type="number"
                    name="glucoseLevel"
                    placeholder="Glucose Level (Required) mg/dL"
                    value={formData.glucoseLevel}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    className={`w-full border p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg outline-none transition text-sm sm:text-base ${
                      glucoseHigh && formData.glucoseLevel
                        ? "border-red-300 bg-red-50 focus:ring-red-300"
                        : "border-gray-300 focus:ring-blue-300"
                    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    required
                  />
                  {glucoseHigh && formData.glucoseLevel && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1"
                    >
                      <FaExclamationTriangle size={isMobile ? 8 : 10} />
                      High
                    </motion.span>
                  )}
                  {formData.glucoseLevel && !glucoseHigh && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      Normal
                    </span>
                  )}
                </motion.div>
                
                {/* Blood Pressure Field */}
                <motion.div
                  animate={bpHigh ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ repeat: bpHigh ? Infinity : 0, duration: 1.5 }}
                  className="relative"
                >
                  <FaHeartbeat
                    className={`absolute left-3 top-3 z-10 text-sm sm:text-base ${
                      bpHigh ? "text-red-500" : "text-blue-400"
                    }`}
                  />
                  <input
                    type="number"
                    name="bloodPressure"
                    placeholder="Blood Pressure (Systolic) mmHg"
                    value={formData.bloodPressure}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    className={`w-full border p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg outline-none transition text-sm sm:text-base ${
                      bpHigh && formData.bloodPressure
                        ? "border-red-300 bg-red-50 focus:ring-red-300"
                        : "border-gray-300 focus:ring-blue-300"
                    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  {bpHigh && formData.bloodPressure && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1"
                    >
                      <FaExclamationTriangle size={isMobile ? 8 : 10} />
                      High
                    </motion.span>
                  )}
                  {formData.bloodPressure && !bpHigh && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      Normal
                    </span>
                  )}
                </motion.div>
                
                {/* Heart Rate Field */}
                <motion.div
                  animate={hrHigh ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ repeat: hrHigh ? Infinity : 0, duration: 1.5 }}
                  className="relative"
                >
                  <FaHeartbeat
                    className={`absolute left-3 top-3 z-10 text-sm sm:text-base ${
                      hrHigh ? "text-red-500" : "text-blue-400"
                    }`}
                  />
                  <input
                    type="number"
                    name="heartRate"
                    placeholder="Heart Rate (BPM)"
                    value={formData.heartRate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    className={`w-full border p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg outline-none transition text-sm sm:text-base ${
                      hrHigh && formData.heartRate
                        ? "border-red-300 bg-red-50 focus:ring-red-300"
                        : "border-gray-300 focus:ring-blue-300"
                    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  {hrHigh && formData.heartRate && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1"
                    >
                      <FaExclamationTriangle size={isMobile ? 8 : 10} />
                      High
                    </motion.span>
                  )}
                  {formData.heartRate && !hrHigh && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      Normal
                    </span>
                  )}
                </motion.div>
                
                <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
                  * Normal ranges: Glucose (70-140 mg/dL), BP ({"<"}120 mmHg), Heart Rate (60-100 BPM)
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Submit Button */}
          <motion.button
            whileTap={!isLoading ? { scale: 0.95 } : {}}
            whileHover={!isMobile && !isLoading ? { scale: 1.02, boxShadow: "0 10px 25px -5px rgba(59,130,246,0.5)" } : {}}
            type="submit"
            disabled={isLoading}
            className={`w-full mt-4 sm:mt-6 text-white p-2.5 sm:p-3 rounded-lg transition font-semibold text-sm sm:text-base flex items-center justify-center gap-2 ${
              isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </motion.button>
        </form>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 sm:mt-6 text-center text-sm sm:text-base"
        >
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;