import { PiSignOutDuotone, PiUserDuotone } from "react-icons/pi";

export const DropdownModal = ({ setIsDropdownOpen, handleLogout, user }) => {
  return (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-[999] animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-900">
          {user?.full_name}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
      </div>

      <button
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
        onClick={() => {
          setIsDropdownOpen(false);
        }}
      >
        <PiUserDuotone size={18} className="text-slate-400" />
        <span>Profile</span>
      </button>

      <div className="border-t border-slate-100 my-1"></div>

      <button
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
        onClick={handleLogout}
      >
        <PiSignOutDuotone size={18} className="text-rose-500" />
        <span>Logout</span>
      </button>
    </div>
  );
};
