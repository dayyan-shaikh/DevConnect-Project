import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Mail, Lock, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRegister } from "../api/auth"; // your react-query API hook
import { toast } from "sonner"; 
import { UnauthenticatedRoute } from "../components/ProtectedRoute";

export function meta() {
  return [
    { title: "Register - DevConnect" },
    { name: "description", content: "Create your DevConnect account" },
  ];
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useRegister(
    (data) => {
      // Save JWT token after successful registration
      localStorage.setItem("access_token", data.access_token);
      
      // Extract and store user ID from token
      try {
        const payload = JSON.parse(atob(data.access_token.split('.')[1]));
        const userId = payload.sub || payload.userId || payload.id;
        if (userId) {
          localStorage.setItem("user_id", userId);
          console.log('Register - stored user_id:', userId);
        }
      } catch (error) {
        console.error('Register - failed to extract user ID:', error);
      }
      
      toast.success("Account created successfully");
      navigate("/home");
    },
    (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong during registration";
      toast.error(msg);
    }
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mutation.isPending) return;
    mutation.mutate(form);
  }

  return (
    <UnauthenticatedRoute>
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl animate-fade-in">
          <div className="border border-gray-700 bg-black/30 backdrop-blur rounded-2xl p-8 shadow-xl">
            <header className="text-center space-y-2 mb-6">
              <h1 className="text-2xl font-semibold">Create your account</h1>
              <p className="text-sm text-gray-400">Get started with DevConnect</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label htmlFor="name" className="block text-sm font-medium">
                  Full name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className={cn(
                      "w-full rounded-xl border-2 px-10 py-3",
                      "bg-white/5 text-white placeholder-gray-400",
                      "border-gray-700 focus:border-indigo-500 focus:outline-none"
                    )}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className={cn(
                      "w-full rounded-xl border-2 px-10 py-3",
                      "bg-white/5 text-white placeholder-gray-400",
                      "border-gray-700 focus:border-indigo-500 focus:outline-none"
                    )}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    required
                    className={cn(
                      "w-full rounded-xl border-2 px-10 py-3",
                      "bg-white/5 text-white placeholder-gray-400",
                      "border-gray-700 focus:border-indigo-500 focus:outline-none"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={mutation.isPending}
                className={cn(
                  "w-full rounded-xl text-white py-3 transition",
                  mutation.isPending
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-500"
                )}
              >
                {mutation.isPending ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-4">
              Already have an account?{" "}
              <Link to="/" className="underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </UnauthenticatedRoute>
  );
}
