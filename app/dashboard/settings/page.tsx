import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Bell, Lock } from "@phosphor-icons/react/dist/ssr";

export default function SettingsPage() {
  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
        <p className="text-zinc-500">Manage your account and preferences.</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Section */}
        <section className="bg-white border border-zinc-200 rounded-xl p-8 space-y-6">
          <div className="flex items-center gap-4 border-b border-zinc-100 pb-6">
             <div className="p-2 bg-zinc-100 rounded-lg">
               <User className="w-6 h-6 text-zinc-900" />
             </div>
             <div>
               <h2 className="text-lg font-bold text-zinc-900">Profile Information</h2>
               <p className="text-sm text-zinc-500">Update your personal details.</p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-sm font-medium text-zinc-700">Full Name</label>
               <Input defaultValue="William Blair" />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-zinc-700">Email Address</label>
               <Input defaultValue="william@example.com" disabled className="bg-zinc-50 text-zinc-500" />
             </div>
          </div>
          <div className="pt-2">
            <Button className="bg-brand-orange text-white hover:bg-orange-600">Save Changes</Button>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white border border-zinc-200 rounded-xl p-8 space-y-6">
          <div className="flex items-center gap-4 border-b border-zinc-100 pb-6">
             <div className="p-2 bg-zinc-100 rounded-lg">
               <Bell className="w-6 h-6 text-zinc-900" />
             </div>
             <div>
               <h2 className="text-lg font-bold text-zinc-900">Notifications</h2>
               <p className="text-sm text-zinc-500">Configure how you receive alerts.</p>
             </div>
          </div>
          
          <div className="space-y-4">
             {["Exam reminders", "Grading complete", "Weekly progress report"].map((item) => (
               <div key={item} className="flex items-center justify-between py-2">
                 <span className="text-zinc-700 font-medium">{item}</span>
                 <div className="h-6 w-11 bg-brand-orange rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm" />
                 </div>
               </div>
             ))}
          </div>
        </section>
        
        {/* Security */}
        <section className="bg-white border border-zinc-200 rounded-xl p-8 space-y-6 opacity-60 cursor-not-allowed relative overflow-hidden">
           <div className="absolute inset-0 bg-white/50 z-10" /> {/* Disabled Overlay */}
          <div className="flex items-center gap-4 border-b border-zinc-100 pb-6">
             <div className="p-2 bg-zinc-100 rounded-lg">
               <Lock className="w-6 h-6 text-zinc-900" />
             </div>
             <div>
               <h2 className="text-lg font-bold text-zinc-900">Security</h2>
               <p className="text-sm text-zinc-500">Manage your password and sessions.</p>
             </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
             Managed by Authentication Provider
          </div>
        </section>

      </div>
    </div>
  );
}

