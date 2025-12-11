import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Bell, Palette, CreditCard, Trash, Warning, Gear, FloppyDisk, Shield } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NotificationSwitch, ThemeSelector } from "@/components/dashboard/settings-components";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="bg-white border-[3px] border-zinc-900 shadow-neo-xl rounded-2xl p-8 relative overflow-hidden group">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#F43F5E_1px,transparent_1px),linear-gradient(to_bottom,#F43F5E_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.12]" />
        
        {/* Animated Glow Effects */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-rose-500/20 rounded-full blur-[120px] pointer-events-none transition-all duration-700 group-hover:bg-rose-500/25" />
        <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none transition-all duration-700 group-hover:bg-indigo-500/25" />
        
        <div className="relative z-10 flex flex-col items-center text-center gap-3">
          <div className="p-4 bg-zinc-900 rounded-2xl shadow-neo-sm transform -rotate-3 mb-2 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110">
              <Gear weight="fill" className="w-8 h-8 text-white animate-spin-slow" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">Account Settings</h1>
          <p className="text-lg text-zinc-600 font-medium max-w-xl leading-relaxed">
            Manage your personal information, preferences, and workspace configurations in one place.
          </p>
        </div>
      </div>

      {/* Profile Section */}
      <section className="bg-white rounded-2xl border-[3px] border-zinc-900 shadow-neo transition-all duration-300 hover:shadow-neo-lg group overflow-hidden">
        <div className="flex items-center gap-5 p-6 border-b-[3px] border-zinc-100 bg-gradient-to-r from-blue-50/80 to-white">
            <div className="w-14 h-14 rounded-2xl bg-blue-500 border-[3px] border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
              <User weight="fill" className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Profile Information</h2>
              <p className="text-base text-zinc-500 font-bold">Update your personal details</p>
            </div>
        </div>
          
        <div className="p-8 md:p-10 space-y-10">
            <div className="flex flex-col lg:flex-row items-center gap-10">
              <div className="relative group/avatar cursor-pointer">
                 <div className="w-32 h-32 rounded-3xl border-[4px] border-zinc-900 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform duration-300 group-hover/avatar:scale-105">
                    {user.name?.charAt(0) || 'U'}
                 </div>
                 <div className="absolute -bottom-3 -right-3 bg-white border-[3px] border-zinc-900 p-2.5 rounded-xl shadow-sm hover:scale-110 transition-transform hover:bg-zinc-50">
                    <User weight="bold" className="w-5 h-5 text-zinc-900" />
                 </div>
              </div>
              
              <div className="flex-1 w-full space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            Display Name
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        </label>
                        <Input defaultValue={user.name || ''} className="bg-zinc-50 border-[3px] border-zinc-200 focus-visible:border-blue-500 focus-visible:ring-0 focus-visible:bg-white font-bold h-14 text-lg text-zinc-900 rounded-xl transition-all" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            Email Address
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                        </label>
                        <Input defaultValue={user.email || ''} disabled className="bg-zinc-100/50 border-[3px] border-zinc-200 text-zinc-500 font-bold h-14 text-lg rounded-xl opacity-100 cursor-not-allowed" />
                    </div>
                 </div>
              </div>
            </div>
            
            <div className="pt-6 flex justify-center md:justify-end border-t-[3px] border-dashed border-zinc-100">
              <Button className="bg-zinc-900 text-white hover:bg-blue-600 border-[3px] border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-black h-14 px-10 text-lg rounded-xl flex items-center gap-3">
                <FloppyDisk weight="fill" className="w-6 h-6" />
                Save Changes
              </Button>
            </div>
        </div>
      </section>

      {/* Grid Layout for Notifications & Appearance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notifications */}
        <section className="bg-white rounded-2xl border-[3px] border-zinc-900 shadow-neo overflow-hidden h-full hover:shadow-neo-lg transition-all duration-300 flex flex-col">
            <div className="flex items-center gap-5 p-6 border-b-[3px] border-zinc-100 bg-gradient-to-r from-violet-50/80 to-white">
                <div className="w-12 h-12 rounded-xl bg-violet-500 border-[3px] border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                    <Bell weight="fill" className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-zinc-900">Notifications</h2>
                    <p className="text-sm text-zinc-500 font-bold">Alert preferences</p>
                </div>
            </div>
            
            <div className="p-6 space-y-4 flex-1">
                {[
                { label: "Exam reminders", desc: "Get notified about scheduled exams", enabled: true, color: "bg-violet-500" },
                { label: "Weekly progress", desc: "Performance summary", enabled: true, color: "bg-violet-500" },
                { label: "Achievements", desc: "Badge notifications", enabled: false, color: "bg-zinc-300" },
                { label: "Study streak", desc: "Daily reminders", enabled: true, color: "bg-violet-500" },
                ].map((item, i) => (
                  <NotificationSwitch 
                    key={i}
                    label={item.label}
                    description={item.desc}
                    defaultEnabled={item.enabled}
                    color={item.color}
                  />
                ))}
            </div>
        </section>

        {/* Appearance */}
        <section className="bg-white rounded-2xl border-[3px] border-zinc-900 shadow-neo overflow-hidden h-full hover:shadow-neo-lg transition-all duration-300 flex flex-col">
            <div className="flex items-center gap-5 p-6 border-b-[3px] border-zinc-100 bg-gradient-to-r from-pink-50/80 to-white">
                <div className="w-12 h-12 rounded-xl bg-pink-500 border-[3px] border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                    <Palette weight="fill" className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-zinc-900">Appearance</h2>
                    <p className="text-sm text-zinc-500 font-bold">Theme settings</p>
                </div>
            </div>
            
            <div className="p-8 flex flex-col justify-between flex-1">
                <ThemeSelector />
            </div>
        </section>
      </div>

      {/* Subscription */}
      <section className="bg-white rounded-2xl border-[3px] border-zinc-900 shadow-neo overflow-hidden hover:shadow-neo-lg transition-all duration-300">
        <div className="flex items-center gap-5 p-6 border-b-[3px] border-zinc-100 bg-gradient-to-r from-emerald-50/80 to-white">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 border-[3px] border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
            <CreditCard weight="fill" className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-900">Subscription Plan</h2>
            <p className="text-sm text-zinc-500 font-bold">Billing & Usage</p>
          </div>
        </div>
        
        <div className="p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 justify-between p-8 bg-zinc-900 rounded-2xl text-white shadow-xl relative overflow-hidden group">
            {/* Dark Card Decorations */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:24px_24px] opacity-20" />
            <div className="absolute -right-32 -top-32 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] group-hover:bg-emerald-500/30 transition-colors duration-500" />
            
            <div className="relative z-10 space-y-3 text-center lg:text-left">
              <p className="text-xs text-emerald-400 uppercase tracking-widest font-black flex items-center justify-center lg:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Current Status
              </p>
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                  <p className="text-5xl font-black tracking-tight">Free Tier</p>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-4 py-1.5 rounded-full border border-emerald-500/30 font-black uppercase tracking-wide">Active</span>
              </div>
              <p className="text-zinc-400 text-sm font-medium max-w-sm leading-relaxed">
                You&apos;re currently on the basic plan. Upgrade to unlock unlimited exams, advanced AI analytics, and priority support.
              </p>
            </div>
            
            <Button className="relative z-10 bg-white text-zinc-900 hover:bg-emerald-400 hover:text-zinc-900 border-0 font-black h-14 px-10 text-lg shadow-lg hover:scale-105 transition-all w-full lg:w-auto rounded-xl">
              Upgrade to Pro
            </Button>
          </div>
          
          <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-500 bg-zinc-50 px-4 py-2.5 rounded-lg border-2 border-zinc-200">
                <Shield weight="fill" className="w-4 h-4 text-emerald-500" /> 
                Secure billing via Stripe
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-500 bg-zinc-50 px-4 py-2.5 rounded-lg border-2 border-zinc-200">
                <CreditCard weight="fill" className="w-4 h-4 text-emerald-500" /> 
                Cancel anytime
              </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-red-50/30 rounded-2xl border-[3px] border-red-200 overflow-hidden hover:border-red-400 transition-colors">
        <div className="flex items-center gap-5 p-6 border-b-[3px] border-red-100/50">
          <div className="w-12 h-12 rounded-xl bg-red-100 border-[3px] border-red-200 flex items-center justify-center">
            <Warning weight="fill" className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-red-900">Danger Zone</h2>
            <p className="text-sm text-red-600 font-bold">Irreversible actions</p>
          </div>
        </div>
        
        <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-base font-bold text-zinc-900">Delete Account</p>
            <p className="text-sm text-zinc-500 font-medium mt-1">Permanently delete your account and all associated data.</p>
          </div>
          <Button variant="outline" className="bg-white border-[3px] border-red-200 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 font-bold h-12 px-8 transition-all shadow-sm hover:shadow-md w-full md:w-auto rounded-xl text-base">
            <Trash weight="bold" className="w-5 h-5 mr-2" />
            Delete Account
          </Button>
        </div>
      </section>
    </div>
  );
}
