import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  FaHeartbeat,
  FaStethoscope,
  FaUserMd,
  FaHospital,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Mouse position for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20; // range -10 to 10
    const y = (clientY / innerHeight - 0.5) * 20;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80')",
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-blue-900 bg-opacity-70"></div>

      {/* Floating Icons (Parallax) */}
      <motion.div
        style={{ x: useTransform(springX, (v) => v * 1.5), y: useTransform(springY, (v) => v * 1.5) }}
        className="absolute top-20 left-20 text-white text-5xl opacity-20"
      >
        <FaHeartbeat />
      </motion.div>
      <motion.div
        style={{ x: useTransform(springX, (v) => -v * 2), y: useTransform(springY, (v) => -v * 2) }}
        className="absolute bottom-20 right-20 text-white text-6xl opacity-20"
      >
        <FaStethoscope />
      </motion.div>
      <motion.div
        style={{ x: useTransform(springX, (v) => v * 2.5), y: useTransform(springY, (v) => -v * 1.2) }}
        className="absolute top-1/3 right-10 text-white text-5xl opacity-20"
      >
        <FaUserMd />
      </motion.div>
      <motion.div
        style={{ x: useTransform(springX, (v) => -v * 1.8), y: useTransform(springY, (v) => v * 1.8) }}
        className="absolute bottom-1/3 left-10 text-white text-5xl opacity-20"
      >
        <FaHospital />
      </motion.div>

      {/* Top Center Text */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative text-center text-white mb-8 px-4 z-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">
          Welcome to MediCare+
        </h1>
        <p className="text-lg md:text-xl drop-shadow-md">
          Your Health, Our Priority
        </p>
      </motion.div>

      {/* Login Card with 3D Tilt */}
      <motion.div
        style={{
          rotateX: useTransform(springY, (v) => v * 0.5),
          rotateY: useTransform(springX, (v) => -v * 0.5),
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96 z-10"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
          Login
        </h2>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 mb-4 text-center"
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Enter your email"
              required
            />
          </motion.div>

<motion.div
  initial={{ x: -20, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ delay: 0.2 }}
  className="mb-4"
>
  <label className="block mb-1 font-medium">Password</label>

  <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 transition">
    
    <input
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full p-3 rounded-l-lg outline-none"
      placeholder="Enter your password"
      required
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="px-3 text-gray-500 hover:text-blue-600 transition"
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </button>

  </div>
</motion.div>


          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(59,130,246,0.5)" }}
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
          >
            Login
          </motion.button>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center text-gray-600"
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