import React, { useState, useEffect, useRef } from "react";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  FaCamera,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserTag,
  FaInfoCircle,
  FaHeartbeat,
  FaTint,
  FaNotesMedical,
  FaCloudSun,
  FaLeaf,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaExclamationTriangle
} from "react-icons/fa";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Mouse position values (normalized -1 to 1)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Transform values for different elements
  const bgX = useTransform(smoothX, [-1, 1], [-20, 20]);
  const bgY = useTransform(smoothY, [-1, 1], [-20, 20]);

  const icon1X = useTransform(smoothX, [-1, 1], [-30, 30]);
  const icon1Y = useTransform(smoothY, [-1, 1], [-30, 30]);
  const icon2X = useTransform(smoothX, [-1, 1], [20, -20]);
  const icon2Y = useTransform(smoothY, [-1, 1], [20, -20]);
  const icon3X = useTransform(smoothX, [-1, 1], [-40, 40]);
  const icon3Y = useTransform(smoothY, [-1, 1], [40, -40]);

  const cardRotateX = useTransform(smoothY, [-1, 1], [2, -2]);
  const cardRotateY = useTransform(smoothX, [-1, 1], [-2, 2]);

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
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Profile state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    username: "",
    bio: "",
    profilePicture: ""
  });

  const [vitals, setVitals] = useState({
    bloodPressure: "",
    glucoseLevel: "",
    heartRate: ""
  });

  // Health warning states
  const [glucoseHigh, setGlucoseHigh] = useState(false);
  const [bpHigh, setBpHigh] = useState(false);
  const [hrHigh, setHrHigh] = useState(false);

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const isPatient = user?.role === "patient";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/profile/me");
        setFormData(res.data);

        if (isPatient && user.patientId) {
          const patientRes = await API.get(`/patients/${user.patientId}`);
          setVitals(patientRes.data);
        }
      } catch {
        Swal.fire({
          title: "Error",
          text: "Could not load profile",
          icon: "error",
          background: isMobile ? "#fff" : undefined,
          width: isMobile ? "90%" : "32rem"
        });
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [user, isPatient, isMobile]);

  // Monitor health levels
  useEffect(() => {
    const glucose = parseFloat(vitals.glucoseLevel);
    setGlucoseHigh(!isNaN(glucose) && glucose > 140);

    const bp = parseFloat(vitals.bloodPressure);
    setBpHigh(!isNaN(bp) && bp > 120);

    const hr = parseFloat(vitals.heartRate);
    setHrHigh(!isNaN(hr) && hr > 100);
  }, [vitals.glucoseLevel, vitals.bloodPressure, vitals.heartRate]);

  const handleChange = (e) => {
    if (e.target.name === "mobileNumber") {
      // Only allow digits and limit to 10 characters
      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [e.target.name]: value });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleVitalsChange = (e) =>
    setVitals({ ...vitals, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) =>
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate mobile number if provided
      if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
        Swal.fire({
          title: "Error",
          text: "Please enter a valid 10-digit mobile number",
          icon: "error",
          background: isMobile ? "#fff" : undefined,
          width: isMobile ? "90%" : "32rem"
        });
        setLoading(false);
        return;
      }

      // Update user profile
      await API.put("/profile/me", formData);

      // Handle profile picture upload if file selected
      if (file) {
        const formData = new FormData();
        formData.append("profilePicture", file);
        await API.post("/profile/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      // Update patient vitals if user is patient
      if (isPatient) {
        await API.put(`/patients/${user.patientId}`, vitals);
      }

      Swal.fire({
        title: "Success",
        text: "Profile updated successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        background: isMobile ? "#fff" : undefined,
        width: isMobile ? "90%" : "32rem"
      });
      
      if (updateUser) updateUser();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Update failed",
        icon: "error",
        background: isMobile ? "#fff" : undefined,
        width: isMobile ? "90%" : "32rem"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        title: "Error",
        text: "New passwords do not match",
        icon: "error",
        background: isMobile ? "#fff" : undefined,
        width: isMobile ? "90%" : "32rem"
      });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      Swal.fire({
        title: "Error",
        text: "Password must be at least 6 characters",
        icon: "error",
        background: isMobile ? "#fff" : undefined,
        width: isMobile ? "90%" : "32rem"
      });
      return;
    }

    setChangingPassword(true);
    try {
      await API.post("/profile/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      Swal.fire({
        title: "Success",
        text: "Password changed successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        background: isMobile ? "#fff" : undefined,
        width: isMobile ? "90%" : "32rem"
      });
      
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordSection(false);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to change password",
        icon: "error",
        background: isMobile ? "#fff" : undefined,
        width: isMobile ? "90%" : "32rem"
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-100 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="mr-3 text-3xl sm:text-4xl text-blue-500"
        >
          <FaHeartbeat />
        </motion.div>
        <span className="text-blue-800 text-base sm:text-xl">Loading Profile...</span>
      </div>
    );
  }

  const imageUrl =
    preview ||
    (formData.profilePicture
      ? `https://healthcare-backend-kj7h.onrender.com${formData.profilePicture}`
      : null);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen relative flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden bg-gradient-to-br from-blue-200 via-blue-100 to-white"
    >
      {/* Background with parallax - hidden on mobile */}
      {!isMobile && (
        <motion.div
          style={{
            x: bgX,
            y: bgY,
            backgroundImage:
              "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')"
          }}
          className="absolute inset-0 bg-cover bg-center opacity-20"
        />
      )}

      {/* Floating Icons - hidden on mobile */}
      {!isMobile && (
        <>
          <motion.div
            style={{ x: icon1X, y: icon1Y }}
            className="absolute top-20 left-10 text-blue-300 text-5xl opacity-30 pointer-events-none"
          >
            <FaCloudSun />
          </motion.div>
          <motion.div
            style={{ x: icon2X, y: icon2Y }}
            className="absolute bottom-20 right-10 text-blue-300 text-6xl opacity-30 pointer-events-none"
          >
            <FaLeaf />
          </motion.div>
          <motion.div
            style={{ x: icon3X, y: icon3Y }}
            className="absolute top-1/3 right-20 text-blue-200 text-4xl opacity-20 pointer-events-none"
          >
            <FaHeartbeat />
          </motion.div>
        </>
      )}

      {/* Main Card */}
      <motion.div
        style={!isMobile ? {
          rotateX: cardRotateX,
          rotateY: cardRotateY,
          transformPerspective: 1000
        } : {}}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="relative bg-white/90 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl border border-blue-200"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-blue-600 mb-4 sm:mb-6 flex items-center justify-center gap-2">
          <FaUser className="text-blue-400 text-xl sm:text-2xl" /> My Profile
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Profile Image */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <motion.div
              whileHover={!isMobile ? { scale: 1.1, rotate: 5 } : {}}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-200 to-blue-400 shadow-lg border-4 border-white">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "";
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-3xl sm:text-4xl md:text-5xl font-bold text-white bg-blue-400">
                    {formData.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <input
                type="file"
                id="profileUpload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              <motion.label
                whileHover={!isMobile ? { scale: 1.2 } : {}}
                htmlFor="profileUpload"
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 sm:p-2.5 md:p-3 rounded-full shadow-lg cursor-pointer hover:bg-blue-600 transition-colors border-2 border-white"
              >
                <FaCamera size={isMobile ? 14 : 16} />
              </motion.label>
            </motion.div>
          </div>

          {/* Form fields */}
          <div className="space-y-3 sm:space-y-4">
            {/* Name Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <FaUser className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition text-sm sm:text-base"
                placeholder="Full Name"
                required
              />
            </motion.div>

            {/* Email Field (Disabled) */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <FaEnvelope className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg sm:rounded-xl bg-blue-50 text-gray-600 text-sm sm:text-base cursor-not-allowed"
              />
            </motion.div>

            {/* Mobile Number Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="relative"
            >
              <FaPhone className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber || ""}
                onChange={handleChange}
                className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition text-sm sm:text-base"
                placeholder="Mobile Number (10 digits)"
                maxLength="10"
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit mobile number"
              />
              {formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber) && (
                <p className="text-xs text-red-500 mt-1">
                  Please enter a valid 10-digit mobile number
                </p>
              )}
            </motion.div>

            {/* Username Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <FaUserTag className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
              <input
                type="text"
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition text-sm sm:text-base"
                placeholder="Username"
              />
            </motion.div>

            {/* Bio Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <FaInfoCircle className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
              <textarea
                name="bio"
                rows="3"
                value={formData.bio || ""}
                onChange={handleChange}
                className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition text-sm sm:text-base resize-none"
                placeholder="Short bio..."
              />
            </motion.div>
          </div>

          {/* Vitals Section (only for patients) */}
          {isPatient && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 sm:mt-6"
            >
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-blue-600 flex items-center gap-2">
                <FaNotesMedical className="text-blue-500 text-sm sm:text-base" /> Health Vitals
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Blood Pressure with Warning */}
                <motion.div
                  animate={bpHigh ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ repeat: bpHigh ? Infinity : 0, duration: 1 }}
                  className="relative"
                >
                  <FaHeartbeat
                    className={`absolute left-3 top-3 text-sm sm:text-base ${
                      bpHigh ? "text-red-500" : "text-blue-400"
                    }`}
                  />
                  <input
                    type="number"
                    name="bloodPressure"
                    value={vitals.bloodPressure || ""}
                    onChange={handleVitalsChange}
                    className={`w-full border p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg sm:rounded-xl outline-none transition text-sm sm:text-base ${
                      bpHigh && vitals.bloodPressure
                        ? "border-red-300 bg-red-50 focus:ring-red-300"
                        : "border-blue-200 focus:ring-blue-300"
                    }`}
                    placeholder="BP (systolic)"
                  />
                  {bpHigh && vitals.bloodPressure && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1"
                    >
                      <FaExclamationTriangle size={isMobile ? 8 : 10} />
                      High
                    </motion.span>
                  )}
                  {vitals.bloodPressure && !bpHigh && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      Normal
                    </span>
                  )}
                </motion.div>

                {/* Glucose Level with Warning */}
                <motion.div
                  animate={glucoseHigh ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ repeat: glucoseHigh ? Infinity : 0, duration: 1 }}
                  className="relative"
                >
                  <FaTint
                    className={`absolute left-3 top-3 text-sm sm:text-base ${
                      glucoseHigh ? "text-red-500" : "text-blue-400"
                    }`}
                  />
                  <input
                    type="number"
                    name="glucoseLevel"
                    value={vitals.glucoseLevel || ""}
                    onChange={handleVitalsChange}
                    className={`w-full border p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg sm:rounded-xl outline-none transition text-sm sm:text-base ${
                      glucoseHigh && vitals.glucoseLevel
                        ? "border-red-300 bg-red-50 focus:ring-red-300"
                        : "border-blue-200 focus:ring-blue-300"
                    }`}
                    placeholder="Glucose (mg/dL)"
                  />
                  {glucoseHigh && vitals.glucoseLevel && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1"
                    >
                      <FaExclamationTriangle size={isMobile ? 8 : 10} />
                      High
                    </motion.span>
                  )}
                  {vitals.glucoseLevel && !glucoseHigh && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      Normal
                    </span>
                  )}
                </motion.div>

                {/* Heart Rate with Warning */}
                <motion.div
                  animate={hrHigh ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ repeat: hrHigh ? Infinity : 0, duration: 1 }}
                  className="relative"
                >
                  <FaHeartbeat
                    className={`absolute left-3 top-3 text-sm sm:text-base ${
                      hrHigh ? "text-red-500" : "text-blue-400"
                    }`}
                  />
                  <input
                    type="number"
                    name="heartRate"
                    value={vitals.heartRate || ""}
                    onChange={handleVitalsChange}
                    className={`w-full border p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg sm:rounded-xl outline-none transition text-sm sm:text-base ${
                      hrHigh && vitals.heartRate
                        ? "border-red-300 bg-red-50 focus:ring-red-300"
                        : "border-blue-200 focus:ring-blue-300"
                    }`}
                    placeholder="Heart Rate (bpm)"
                  />
                  {hrHigh && vitals.heartRate && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1"
                    >
                      <FaExclamationTriangle size={isMobile ? 8 : 10} />
                      High
                    </motion.span>
                  )}
                  {vitals.heartRate && !hrHigh && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      Normal
                    </span>
                  )}
                </motion.div>
              </div>

              {/* Health Info Note */}
              <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
                * Normal ranges: Glucose (70-140 mg/dL), BP ({"<"}120 mmHg), Heart Rate (60-100 BPM)
              </p>
            </motion.div>
          )}

          {/* Change Password Toggle */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 sm:mt-6"
          >
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition text-sm sm:text-base"
            >
              <FaKey /> {showPasswordSection ? "Cancel" : "Change Password"}
            </button>
          </motion.div>

          {/* Password Change Section */}
          {showPasswordSection && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 overflow-hidden"
            >
              {/* Current Password */}
              <div className="relative">
                <FaKey className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
                <input
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 pr-8 sm:pr-10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-300 outline-none text-sm sm:text-base"
                  placeholder="Current Password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2 sm:right-3 top-2.5 sm:top-3 text-gray-500"
                >
                  {showCurrent ? <FaEyeSlash size={isMobile ? 16 : 18} /> : <FaEye size={isMobile ? 16 : 18} />}
                </button>
              </div>

              {/* New Password */}
              <div className="relative">
                <FaKey className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 pr-8 sm:pr-10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-300 outline-none text-sm sm:text-base"
                  placeholder="New Password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2 sm:right-3 top-2.5 sm:top-3 text-gray-500"
                >
                  {showNew ? <FaEyeSlash size={isMobile ? 16 : 18} /> : <FaEye size={isMobile ? 16 : 18} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <FaKey className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 pr-8 sm:pr-10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-300 outline-none text-sm sm:text-base"
                  placeholder="Confirm New Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 sm:right-3 top-2.5 sm:top-3 text-gray-500"
                >
                  {showConfirm ? <FaEyeSlash size={isMobile ? 16 : 18} /> : <FaEye size={isMobile ? 16 : 18} />}
                </button>
              </div>

              <motion.button
                whileTap={!isMobile ? { scale: 0.95 } : {}}
                whileHover={!isMobile ? { scale: 1.02 } : {}}
                type="button"
                onClick={handlePasswordSubmit}
                disabled={changingPassword}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition font-semibold text-sm sm:text-base shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {changingPassword ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </motion.button>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 sm:mt-6 md:mt-8"
          >
            <motion.button
              whileTap={!isMobile ? { scale: 0.95 } : {}}
              whileHover={!isMobile ? { scale: 1.02, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)" } : {}}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:from-blue-500 hover:to-blue-700 transition font-semibold text-sm sm:text-base shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;