import React, { useState, useEffect, useRef } from "react";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  FaCamera,
  FaUser,
  FaEnvelope,
  FaUserTag,
  FaInfoCircle,
  FaHeartbeat,
  FaTint,
  FaNotesMedical,
  FaCloudSun,
  FaLeaf,
  FaKey,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const containerRef = useRef(null);

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

  const handleMouseMove = (e) => {
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
    username: "",
    bio: "",
    profilePicture: ""
  });

  const [vitals, setVitals] = useState({
    bloodPressure: "",
    glucoseLevel: "",
    heartRate: ""
  });

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
        Swal.fire("Error", "Could not load profile", "error");
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [user, isPatient]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
      await API.put("/profile/me", formData);

      if (isPatient) {
        await API.put(`/patients/${user.patientId}`, vitals);
      }

      Swal.fire("Success", "Profile updated successfully", "success");
      if (updateUser) updateUser();
    } catch {
      Swal.fire("Error", "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire("Error", "New passwords do not match", "error");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      Swal.fire("Error", "Password must be at least 6 characters", "error");
      return;
    }

    setChangingPassword(true);
    try {
      await API.post("/profile/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      Swal.fire("Success", "Password changed successfully", "success");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordSection(false);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to change password", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  if (fetching)
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-100 text-blue-800 text-xl">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="mr-3"
        >
          <FaHeartbeat className="text-4xl text-blue-500" />
        </motion.div>
        Loading Profile...
      </div>
    );

  const imageUrl =
    preview ||
    (formData.profilePicture
      ? `https://healthcare-backend-kj7h.onrender.com/${formData.profilePicture}`
      : null);

  const glucoseHigh = vitals.glucoseLevel > 140;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-gradient-to-br from-blue-200 via-blue-100 to-white"
    >
      <motion.div
        style={{
          x: bgX,
          y: bgY,
          backgroundImage:
            "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')"
        }}
        className="absolute inset-0 bg-cover bg-center opacity-20"
      />

      {/* Floating Icons */}
      <motion.div
        style={{ x: icon1X, y: icon1Y }}
        className="absolute top-20 left-10 text-blue-300 text-5xl opacity-30"
      >
        <FaCloudSun />
      </motion.div>
      <motion.div
        style={{ x: icon2X, y: icon2Y }}
        className="absolute bottom-20 right-10 text-blue-300 text-6xl opacity-30"
      >
        <FaLeaf />
      </motion.div>
      <motion.div
        style={{ x: icon3X, y: icon3Y }}
        className="absolute top-1/3 right-20 text-blue-200 text-4xl opacity-20"
      >
        <FaHeartbeat />
      </motion.div>

      {/* Main Card */}
      <motion.div
        style={{
          rotateX: cardRotateX,
          rotateY: cardRotateY,
          transformPerspective: 1000
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="relative bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-3xl border border-blue-200"
      >
        <h2 className="text-4xl font-bold text-center text-blue-600 mb-6 flex items-center justify-center gap-2">
          <FaUser className="text-blue-400" /> My Profile
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Profile Image */}
          <div className="flex justify-center mb-6">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative w-28 h-28"
            >
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-blue-200 to-blue-400 shadow-lg border-4 border-white">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-5xl font-bold text-white bg-blue-400">
                    {formData.name?.charAt(0)}
                  </div>
                )}
              </div>

              <input
                type="file"
                id="profileUpload"
                className="hidden"
                onChange={handleFileChange}
              />

              <motion.label
                whileHover={{ scale: 1.2 }}
                htmlFor="profileUpload"
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-blue-600 transition-colors border-2 border-white"
              >
                <FaCamera />
              </motion.label>
            </motion.div>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <FaUser className="absolute left-3 top-3 text-blue-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-blue-200 p-2 pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition"
                placeholder="Full Name"
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <FaEnvelope className="absolute left-3 top-3 text-blue-400" />
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full border border-blue-200 p-2 pl-10 rounded-xl bg-blue-50 text-gray-600"
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <FaUserTag className="absolute left-3 top-3 text-blue-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-blue-200 p-2 pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition"
                placeholder="Username"
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <FaInfoCircle className="absolute left-3 top-3 text-blue-400" />
              <textarea
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                className="w-full border border-blue-200 p-2 pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition"
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
              className="mt-6"
            >
              <h3 className="text-lg font-semibold mb-3 text-blue-600 flex items-center gap-2">
                <FaNotesMedical className="text-blue-500" /> Health Vitals
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                <motion.div whileHover={{ scale: 1.02 }} className="relative">
                  <FaHeartbeat className="absolute left-3 top-3 text-blue-400" />
                  <input
                    type="number"
                    name="bloodPressure"
                    value={vitals.bloodPressure}
                    onChange={handleVitalsChange}
                    className="w-full border border-blue-200 p-2 pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition"
                    placeholder="BP (systolic)"
                  />
                </motion.div>

                <motion.div
                  animate={glucoseHigh ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: glucoseHigh ? Infinity : 0, duration: 1 }}
                  className="relative"
                >
                  <FaTint
                    className={`absolute left-3 top-3 ${glucoseHigh ? "text-red-500" : "text-blue-400"}`}
                  />
                  <input
                    type="number"
                    name="glucoseLevel"
                    value={vitals.glucoseLevel}
                    onChange={handleVitalsChange}
                    className={`w-full border p-2 pl-10 rounded-xl outline-none transition ${
                      glucoseHigh
                        ? "border-red-300 bg-red-50 focus:ring-red-300"
                        : "border-blue-200 focus:ring-blue-300"
                    }`}
                    placeholder="Glucose (mg/dL)"
                  />
                  {glucoseHigh && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
                    >
                      High
                    </motion.span>
                  )}
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="relative">
                  <FaHeartbeat className="absolute left-3 top-3 text-blue-400" />
                  <input
                    type="number"
                    name="heartRate"
                    value={vitals.heartRate}
                    onChange={handleVitalsChange}
                    className="w-full border border-blue-200 p-2 pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition"
                    placeholder="Heart Rate"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Change Password Toggle */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
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
              className="mt-4 space-y-4 overflow-hidden"
            >
              <div className="relative">
                <FaKey className="absolute left-3 top-3 text-blue-400" />
                <input
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-blue-200 p-2 pl-10 pr-10 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none"
                  placeholder="Current Password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showCurrent ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="relative">
                <FaKey className="absolute left-3 top-3 text-blue-400" />
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-blue-200 p-2 pl-10 pr-10 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none"
                  placeholder="New Password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showNew ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="relative">
                <FaKey className="absolute left-3 top-3 text-blue-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-blue-200 p-2 pl-10 pr-10 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none"
                  placeholder="Confirm New Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                type="button"
                onClick={handlePasswordSubmit}
                disabled={changingPassword}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-xl transition font-semibold shadow-md disabled:opacity-50"
              >
                {changingPassword ? "Updating..." : "Update Password"}
              </motion.button>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)" }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white p-3 rounded-xl hover:from-blue-500 hover:to-blue-700 transition font-semibold text-lg shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="inline-block"
                >
                  <FaHeartbeat />
                </motion.div>
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