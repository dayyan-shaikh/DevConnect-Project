import { logout } from "../lib/auth";

export function Welcome() {
  const handleLogout = () => {
    logout();
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="w-full h-screen flex items-center justify-center px-6 pb-20 pt-20">
        <div className="w-full max-w-4xl text-center space-y-12 animate-fade-in">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
              Welcome to DevConnect!
            </h1>
            <p className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              You are successfully logged in. Explore your developer profile and connect with others in the community.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
