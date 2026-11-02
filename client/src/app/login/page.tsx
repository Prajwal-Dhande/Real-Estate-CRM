"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Layers
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, register, switchDemo, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  
  // Sign In state
  const [loginEmail, setLoginEmail] = useState("rahul.sharma@estateiq.com");
  const [loginPassword, setLoginPassword] = useState("Password123!");
  
  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"admin" | "agent">("agent");
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>(["Vasudev Nagar", "Dharampeth"]);
  
  // Feedback state
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const NAGPUR_LOCALITIES = [
    "Vasudev Nagar",
    "Dharampeth",
    "MIHAN",
    "Manish Nagar",
    "Trimurti Nagar",
    "Civil Lines",
    "Sadar",
    "Wardha Road"
  ];

  const handleQuickSwitch = async (email: string) => {
    setActionLoading(true);
    setStatusMsg(null);
    try {
      await switchDemo(email);
      setStatusMsg({ type: "success", text: `Authenticated successfully as ${email}` });
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch {
      setStatusMsg({ type: "error", text: "Quick switch failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setStatusMsg(null);
    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        setStatusMsg({ type: "success", text: "Login successful! Redirecting..." });
        setTimeout(() => {
          router.push("/");
        }, 600);
      } else {
        setStatusMsg({ type: "error", text: res.message || "Invalid credentials" });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Login failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setStatusMsg({ type: "error", text: "Please fill in all required fields" });
      return;
    }
    setActionLoading(true);
    setStatusMsg(null);
    try {
      const res = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        assignedLocalities: selectedLocalities
      });
      if (res.success) {
        setStatusMsg({ type: "success", text: "Registration successful! Redirecting to workspace..." });
        setTimeout(() => {
          router.push("/");
        }, 600);
      } else {
        setStatusMsg({ type: "error", text: res.message || "Registration failed" });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Registration failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const toggleLocality = (loc: string) => {
    setSelectedLocalities(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  return (
    <div className="flex-1 min-h-screen bg-[#0F172A] flex items-center justify-center p-6 text-slate-100 overflow-y-auto">
      <div className="w-full max-w-xl space-y-6 my-auto">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            EstateIQ RBAC • Multi-Agent Brokerage
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Brokerage Authentication Portal
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Switch between Admin Brokerage view and Territory Agent contexts to test locality-based CRM filtering.
          </p>
        </div>

        {/* 1-Click Multi-Agent Role Switcher Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 uppercase tracking-wider text-[11px] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              1-Click Multi-Agent Session Switcher
            </span>
            <span className="text-[10px] text-slate-500">Auto-Generates JWT</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Quick Button 1: Admin */}
            <button
              type="button"
              onClick={() => handleQuickSwitch("admin@estateiq.com")}
              disabled={actionLoading}
              className={`p-3 rounded-lg border text-left transition-all ${
                user?.email === "admin@estateiq.com"
                  ? "bg-emerald-500/10 border-emerald-500/50 text-white ring-1 ring-emerald-500/50"
                  : "bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600 text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </span>
                {user?.email === "admin@estateiq.com" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </div>
              <p className="font-mono text-[11px] text-white mt-1 truncate">Prajwal Dhande</p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">All Brokerage Localities</p>
            </button>

            {/* Quick Button 2: Agent Rahul Sharma (Vasudev Nagar, Dharampeth) */}
            <button
              type="button"
              onClick={() => handleQuickSwitch("rahul.sharma@estateiq.com")}
              disabled={actionLoading}
              className={`p-3 rounded-lg border text-left transition-all ${
                user?.email === "rahul.sharma@estateiq.com"
                  ? "bg-blue-500/10 border-blue-500/50 text-white ring-1 ring-blue-500/50"
                  : "bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600 text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs flex items-center gap-1 text-blue-400">
                  <UserCheck className="w-3.5 h-3.5" /> Agent 1
                </span>
                {user?.email === "rahul.sharma@estateiq.com" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </div>
              <p className="font-mono text-[11px] text-white mt-1 truncate">Rahul Sharma</p>
              <p className="text-[10px] text-blue-300/80 mt-0.5 truncate font-medium">📍 Vasudev Nagar, Dharampeth</p>
            </button>

            {/* Quick Button 3: Agent Sneha Deshmukh (MIHAN, Manish Nagar) */}
            <button
              type="button"
              onClick={() => handleQuickSwitch("sneha@estateiq.com")}
              disabled={actionLoading}
              className={`p-3 rounded-lg border text-left transition-all ${
                user?.email === "sneha@estateiq.com"
                  ? "bg-purple-500/10 border-purple-500/50 text-white ring-1 ring-purple-500/50"
                  : "bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600 text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs flex items-center gap-1 text-purple-400">
                  <UserCheck className="w-3.5 h-3.5" /> Agent 2
                </span>
                {user?.email === "sneha@estateiq.com" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                )}
              </div>
              <p className="font-mono text-[11px] text-white mt-1 truncate">Sneha Deshmukh</p>
              <p className="text-[10px] text-purple-300/80 mt-0.5 truncate font-medium">📍 MIHAN, Manish Nagar</p>
            </button>
          </div>
        </div>

        {/* Credentials Form Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-5">
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              type="button"
              onClick={() => { setActiveTab("signin"); setStatusMsg(null); }}
              className={`pb-3 text-xs font-semibold tracking-wider uppercase transition-colors relative flex-1 text-center ${
                activeTab === "signin"
                  ? "text-emerald-400 border-b-2 border-emerald-500 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In with Credentials
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("register"); setStatusMsg(null); }}
              className={`pb-3 text-xs font-semibold tracking-wider uppercase transition-colors relative flex-1 text-center ${
                activeTab === "register"
                  ? "text-emerald-400 border-b-2 border-emerald-500 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Register New Agent
            </button>
          </div>

          {/* Feedback message */}
          {statusMsg && (
            <div className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
              statusMsg.type === "success" 
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
            }`}>
              {statusMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {activeTab === "signin" ? (
            /* Sign In Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="agent@estateiq.com"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950"
              >
                {actionLoading ? "Authenticating..." : "Sign In to Workspace"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Agent Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="rahul@estateiq.com"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="Password123!"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole("agent")}
                    className={`py-2 px-3 rounded-lg border text-xs font-mono text-center transition-colors ${
                      regRole === "agent"
                        ? "bg-blue-500/20 border-blue-500 text-blue-300 font-semibold"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    Territory Agent
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole("admin")}
                    className={`py-2 px-3 rounded-lg border text-xs font-mono text-center transition-colors ${
                      regRole === "admin"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    Managing Admin
                  </button>
                </div>
              </div>

              {/* Territory Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" /> Assigned Localities (Territory)
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Select 1 or more</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {NAGPUR_LOCALITIES.map((loc) => {
                    const isSelected = selectedLocalities.includes(loc);
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => toggleLocality(loc)}
                        className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                          isSelected
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold"
                            : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}{loc}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950"
              >
                {actionLoading ? "Registering..." : "Create Account & Enter CRM"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Quick return to dashboard */}
          <div className="text-center pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-[11px] font-mono text-slate-400 hover:text-emerald-400 transition-colors"
            >
              ← Back to CRM Dashboard
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

