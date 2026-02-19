import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
} from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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

  const { register } = useAuth();
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.includes("@")) return "Valid email required";
    if (formData.password.length < 6)
      return "Password must be at least 6 characters";
    if (!formData.glucoseLevel)
      return "Glucose Level is mandatory";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

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
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=1600&q=80')",
      }}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 bg-blue-900 bg-opacity-75"></div>

      {/* Floating Icons (Parallax) */}
      <motion.div
        style={{ x: useTransform(springX, (v) => v * 2), y: useTransform(springY, (v) => v * 1.5) }}
        className="absolute top-20 left-20 text-white text-5xl opacity-20"
      >
        <FaHeartbeat />
      </motion.div>
      <motion.div
        style={{ x: useTransform(springX, (v) => -v * 2.5), y: useTransform(springY, (v) => -v * 2) }}
        className="absolute bottom-20 right-20 text-white text-6xl opacity-20"
      >
        <FaStethoscope />
      </motion.div>
      <motion.div
        style={{ x: useTransform(springX, (v) => v * 3), y: useTransform(springY, (v) => -v * 1.8) }}
        className="absolute top-1/4 right-10 text-white text-5xl opacity-20"
      >
        <FaSyringe />
      </motion.div>
      <motion.div
        style={{ x: useTransform(springX, (v) => -v * 1.5), y: useTransform(springY, (v) => v * 2.2) }}
        className="absolute bottom-1/4 left-10 text-white text-5xl opacity-20"
      >
        <FaTint />
      </motion.div>

      {/* Register Card with 3D Tilt */}
      <motion.div
        style={{
          rotateX: useTransform(springY, (v) => v * 0.3),
          rotateY: useTransform(springX, (v) => -v * 0.3),
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto z-10"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
          Patient Registration
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
          {/* Name */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4 relative"
          >
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-2 pl-10 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition"
              required
            />
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4 relative"
          >
            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-2 pl-10 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition"
              required
            />
          </motion.div>

          {/* Password with Toggle */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-300 transition">

              {/* Left Lock Icon */}
              <div className="px-3 text-gray-400">
                <FaLock />
              </div>

              {/* Input */}
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full py-2 outline-none"
                required
              />

              {/* Right Eye Icon */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 text-gray-500 hover:text-blue-600 transition"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>

            </div>
          </motion.div>


          {/* Age */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-4 relative"
          >
            <FaWeight className="absolute left-3 top-3 text-gray-400" />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              className="w-full border p-2 pl-10 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition"
            />
          </motion.div>

          {/* Gender */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-4 relative"
          >
            <FaVenusMars className="absolute left-3 top-3 text-gray-400" />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border p-2 pl-10 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 outline-none transition"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </motion.div>

          {/* Collapse Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setShowHealth(!showHealth)}
            className="w-full bg-blue-100 text-blue-700 p-2 rounded-lg mb-3 font-semibold hover:bg-blue-200 transition"
          >
            {showHealth ? "Hide Health Details ▲" : "Add Health Details ▼"}
          </motion.button>

          {/* Collapsible Health Section */}
          {showHealth && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 p-4 rounded-lg border"
            >
              {/* Glucose (Required) */}
              <div className="mb-4 relative">
                <FaTint className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  name="glucoseLevel"
                  placeholder="Glucose Level (Required)"
                  value={formData.glucoseLevel}
                  onChange={handleChange}
                  className="w-full border p-2 pl-10 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition"
                />
              </div>

              {/* Blood Pressure */}
              <div className="mb-4 relative">
                <FaHeartbeat className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  name="bloodPressure"
                  placeholder="Blood Pressure"
                  value={formData.bloodPressure}
                  onChange={handleChange}
                  className="w-full border p-2 pl-10 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition"
                />
              </div>

              {/* Heart Rate */}
              <div className="relative">
                <FaHeartbeat className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  name="heartRate"
                  placeholder="Heart Rate"
                  value={formData.heartRate}
                  onChange={handleChange}
                  className="w-full border p-2 pl-10 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition"
                />
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(59,130,246,0.5)" }}
            type="submit"
            className="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Register
          </motion.button>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 text-center"
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