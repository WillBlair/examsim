import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Bell, Shield, Palette, CreditCard, Trash, Warning } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Settings</h1>
        <p className="text-zinc-500">Manage your account preferences and configurations.</p>
      </div>

      {/* Profile Section */}
      <section className="bg-white rounded-xl border border-zinc-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 p-6 border-b border-zinc-100">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <User weight="duotone" className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Profile Information</h2>
              <p className="text-xs text-zinc-500">Update your personal details</p>
            </div>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-accent-purple/30">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">{user.name || 'User'}</p>
                <p className="text-xs text-zinc-500">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Display Name</label>
                <Input defaultValue={user.name || ''} className="bg-zinc-50/50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Email Address</label>
                <Input defaultValue={user.email || ''} disabled className="bg-zinc-100 text-zinc-500" />
              </div>
            </div>
            
            <div className="pt-2">
              <Button className="bg-zinc-900 text-white hover:bg-zinc-800">Save Changes</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-xl border border-zinc-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 p-6 border-b border-zinc-100">
            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
              <Bell weight="duotone" className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Notifications</h2>
              <p className="text-xs text-zinc-500">Configure how you receive alerts</p>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {[
              { label: "Exam reminders", desc: "Get notified about scheduled exams", enabled: true },
              { label: "Weekly progress report", desc: "Summary of your weekly performance", enabled: true },
              { label: "Achievement unlocked", desc: "Notifications when you earn badges", enabled: false },
              { label: "Study streak alerts", desc: "Reminders to maintain your streak", enabled: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{item.label}</p>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
                <button 
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    item.enabled ? "bg-brand-orange" : "bg-zinc-200"
                  )}
                >
                  <span className={cn(
                    "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                    item.enabled ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="bg-white rounded-xl border border-zinc-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 p-6 border-b border-zinc-100">
            <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
              <Palette weight="duotone" className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Appearance</h2>
              <p className="text-xs text-zinc-500">Customize the look and feel</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "Light", active: true },
                  { name: "Dark", active: false },
                  { name: "System", active: false },
                ].map((theme) => (
                  <button
                    key={theme.name}
                    className={cn(
                      "px-4 py-3 rounded-lg border text-sm font-medium transition-all",
                      theme.active 
                        ? "bg-zinc-900 text-white border-zinc-900" 
                        : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-400">Dark mode coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription */}
      <section className="bg-white rounded-xl border border-zinc-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 p-6 border-b border-zinc-100">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CreditCard weight="duotone" className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Subscription</h2>
              <p className="text-xs text-zinc-500">Manage your plan and billing</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl text-white">
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Current Plan</p>
                <p className="text-lg font-bold">Free Tier</p>
              </div>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Upgrade
              </Button>
            </div>
            <p className="text-xs text-zinc-500 mt-3">Pro features include unlimited exams, advanced analytics, and priority support.</p>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-white rounded-xl border border-red-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 p-6 border-b border-red-100">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <Warning weight="duotone" className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-red-600">Danger Zone</h2>
              <p className="text-xs text-zinc-500">Irreversible actions</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900">Delete Account</p>
                <p className="text-xs text-zinc-500">Permanently delete your account and all data</p>
              </div>
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
