import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Phone,
  MapPin,
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    meterNumber: "",
    area: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const areas = [
    "Nashik Road",
    "College Road",
    "Gangapur Road",
    "Panchavati",
    "Satpur",
    "Ambad",
    "Cidco",
    "Indira Nagar",
    "Mhasrul",
    "Pathardi",
    "Untwadi",
    "Mahatma Nagar",
    "Gandhi Nagar",
    "Sharanpur Road",
    "Canada Corner",
    "Mumbai Naka",
    "Deolali Camp",
    "Ozar",
    "Vilholi",
    "Adgaon",
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Full name is required");
      return false;
    }

    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return false;
    }

    if (!formData.address.trim()) {
      toast.error("Address is required");
      return false;
    }

    if (!formData.meterNumber.trim()) {
      toast.error("Meter number is required");
      return false;
    }

    if (!formData.area) {
      toast.error("Please select your area");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Enter a valid email");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await register({
        name: formData.name,
        mobile: formData.mobile,
        address: formData.address,
        meterNumber: formData.meterNumber,
        area: formData.area,
        email: formData.email,
        password: formData.password,
        role: "user",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">

  {/* Background */}

  <div className="absolute inset-0">

    <img
      src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1920&q=80"
      alt="Background"
      className="w-full h-full object-cover"
    />

    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-indigo-900/80 to-black/90"></div>

    <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>

    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>

  </div>

  <div className="relative z-10 py-20">

    <div className="container mx-auto px-4">

      <div className="max-w-5xl mx-auto">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white hover:text-blue-300 transition mb-6"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="rounded-3xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">

          {/* Header */}

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-7">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">

                <User className="text-white w-7 h-7" />

              </div>

              <div>

                <h1 className="text-3xl font-bold text-white">
                  Create Account
                </h1>

                <p className="text-white/80">
                  Register as a SmartGrid User
                </p>

              </div>

            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="p-8"
          >

            <div className="grid md:grid-cols-2 gap-5">

              {/* Name */}

              <div>

                <label className="block text-white mb-2">
                  Full Name
                </label>

                <div className="relative">

                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                    size={18}
                  />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 outline-none focus:border-indigo-400"
                  />

                </div>

              </div>

              {/* Mobile */}

              <div>

                <label className="block text-white mb-2">
                  Mobile Number
                </label>

                <div className="relative">

                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                    size={18}
                  />

                  <input
                    type="text"
                    name="mobile"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 outline-none focus:border-indigo-400"
                  />

                </div>

              </div>

              {/* Address */}

              <div className="md:col-span-2">

                <label className="block text-white mb-2">
                  Address
                </label>

                <div className="relative">

                  <MapPin
                    className="absolute left-4 top-4 text-gray-300"
                    size={18}
                  />

                  <textarea
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete address"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 outline-none resize-none focus:border-indigo-400"
                  />

                </div>

              </div>

              {/* Meter */}

              <div>

                <label className="block text-white mb-2">
                  Meter Number
                </label>

                <div className="relative">

                  <Zap
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                    size={18}
                  />

                  <input
                    type="text"
                    name="meterNumber"
                    value={formData.meterNumber}
                    onChange={handleChange}
                    placeholder="Enter meter number"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 outline-none focus:border-indigo-400"
                  />

                </div>

              </div>

              {/* Area */}

              <div>

                <label className="block text-white mb-2">
                  Area
                </label>

                <div className="relative">

                  <MapPin
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                    size={18}
                  />

                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white outline-none appearance-none"
                  >

                    <option value="" className="bg-slate-900">
                      Select Area
                    </option>

                    {areas.map((area) => (

                      <option
                        key={area}
                        value={area}
                        className="bg-slate-900"
                      >
                        {area}
                      </option>

                    ))}

                  </select>

                </div>

              </div>

                            {/* Email */}

              <div className="md:col-span-2">

                <label className="block text-white mb-2">
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                    size={18}
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 outline-none focus:border-indigo-400"
                  />

                </div>

              </div>

              {/* Password */}

              <div>

                <label className="block text-white mb-2">
                  Password
                </label>

                <div className="relative">

                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                    size={18}
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 outline-none focus:border-indigo-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* Confirm Password */}

              <div>

                <label className="block text-white mb-2">
                  Confirm Password
                </label>

                <div className="relative">

                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                    size={18}
                  />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 outline-none focus:border-indigo-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

            </div>

            {/* Terms */}

            <div className="mt-7 bg-white/5 border border-white/10 rounded-xl p-4">

              <label className="flex items-start gap-3 cursor-pointer">

                <input
                  type="checkbox"
                  required
                  className="mt-1"
                />

                <span className="text-sm text-gray-300">

                  I agree to the

                  <span className="text-indigo-400">
                    {" "}
                    Terms of Service
                  </span>

                  {" "}and{" "}

                  <span className="text-indigo-400">
                    Privacy Policy
                  </span>

                </span>

              </label>

            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:scale-[1.02] transition disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">

                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>

                  Creating Account...

                </span>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Login */}

            <p className="text-center text-gray-300 mt-7">

              Already have an account?

              <Link
                to="/login"
                className="ml-2 text-indigo-400 hover:underline"
              >
                Login
              </Link>

            </p>

          </form>

        </div>

      </div>

    </div>

  </div>

</div>
  );
}

export default Register;