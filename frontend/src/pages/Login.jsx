import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Wrench,
  Shield,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const roles = [
  {
    id: "user",
    name: "User",
    icon: User,
    gradient: "from-blue-500 to-blue-600",
    description: "Citizen Dashboard",
  },
  {
    id: "technician",
    name: "Technician",
    icon: Wrench,
    gradient: "from-emerald-500 to-emerald-600",
    description: "Maintenance Dashboard",
  },
  {
    id: "admin",
    name: "Admin",
    icon: Shield,
    gradient: "from-purple-500 to-purple-600",
    description: "System Administrator",
  },
];

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [selectedRole, setSelectedRole] = useState(
    searchParams.get("role") || "user"
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const role = searchParams.get("role");

    if (role === "user" || role === "technician" || role === "admin") {
      setSelectedRole(role);
    } else {
      setSelectedRole("user");
    }
  }, [searchParams]);

  const currentRole =
    roles.find((role) => role.id === selectedRole) || roles[0];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const changeRole = (role) => {
    setSelectedRole(role);
    setFormData({
      email: "",
      password: "",
    });

    navigate(`/login?role=${role}`, {
      replace: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      return toast.error("Email is required");
    }

    if (!formData.password.trim()) {
      return toast.error("Password is required");
    }

    setLoading(true);

    try {
      await login(
        formData.email,
        formData.password,
        selectedRole
      );
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

    <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>

    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
  </div>

  <div className="relative z-10 flex items-center justify-center min-h-screen px-5 py-10">

    <div className="w-full max-w-md">

      <Link
        to="/"
        className="inline-flex items-center gap-2 text-white mb-6 hover:text-blue-300 transition"
      >
        <ArrowLeft size={18} />
        Back to Home
      </Link>

      <div className="rounded-3xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">

        {/* Header */}

        <div
          className={`bg-gradient-to-r ${currentRole.gradient} px-8 py-7`}
        >
          <div className="flex items-center gap-4">

            <div className="bg-white/20 p-3 rounded-2xl">

              <currentRole.icon className="text-white w-7 h-7" />

            </div>

            <div>

              <h1 className="text-2xl font-bold text-white">
                {currentRole.name} Login
              </h1>

              <p className="text-white/80 text-sm">
                {currentRole.description}
              </p>

            </div>

          </div>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="p-8"
        >

          {/* Role Tabs */}

          <div className="grid grid-cols-3 gap-2 mb-8">

            {roles.map((role) => (

              <button
                key={role.id}
                type="button"
                onClick={() => changeRole(role.id)}
                className={`rounded-xl py-3 transition font-semibold flex items-center justify-center gap-2 ${
                  selectedRole === role.id
                    ? `bg-gradient-to-r ${role.gradient} text-white`
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >

                <role.icon size={18} />

                <span>{role.name}</span>

              </button>

            ))}

          </div>

          {/* Email */}

          <div className="mb-5">

            <label className="text-white block mb-2">
              Email
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
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 outline-none focus:border-blue-400"
              />

            </div>

          </div>

          {/* Password */}

          <div className="mb-7">

            <label className="text-white block mb-2">
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
                placeholder="Enter password"
                className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 outline-none focus:border-blue-400"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>

          </div>

          {/* Login */}

          <button
            disabled={loading}
            className={`w-full py-3 rounded-xl bg-gradient-to-r ${currentRole.gradient} text-white font-semibold transition hover:scale-[1.02] disabled:opacity-60`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {selectedRole === "user" && (

            <p className="text-center text-gray-300 mt-7">

              Don't have an account?

              <Link
                to="/register"
                className="text-blue-400 ml-2 hover:underline"
              >
                Register
              </Link>

            </p>

          )}

        </form>

      </div>

    </div>

  </div>

</div>
  );
}

export default Login;