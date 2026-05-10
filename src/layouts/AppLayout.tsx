import { Outlet } from "react-router-dom"
import { LayoutDashboard, Database, ClipboardList } from "lucide-react"
import { NavLink } from "react-router-dom"

export default function AppLayout() {
    return (
        <div className="flex min-h-screen bg-orange-300">
            <div className="w-64 bg-white/90 backdrop-blur-sm p-4 pr-0">
                <h2 className="text-xl font-bold text-orange-700 tracking-wide mb-6">
                    DAMAGE Retraining Dashboard
                </h2>

                <nav className="space-y-2">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `flex items-center gap-2 w-full px-3 py-3 transition ${
                            isActive
                                ? "bg-orange-300 text-white rounded-l-xl"
                                : "text-slate-700 hover:bg-blue-100"
                        }`}
                    >
                        <LayoutDashboard size={18} />
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/training"
                        className={({ isActive }) =>
                            `flex items-center gap-2 w-full px-3 py-3 transition ${
                            isActive
                                ? "bg-orange-300 text-white rounded-l-xl"
                                : "text-slate-700 hover:bg-blue-100"
                        }`}
                    >
                        <Database size={18} />
                        Training Center
                    </NavLink>

                    <NavLink
                        to="/jobs"
                        className={({ isActive }) =>
                            `flex items-center gap-2 w-full px-3 py-3 transition ${
                            isActive
                                ? "bg-orange-300 text-white rounded-l-xl"
                                : "text-slate-700 hover:bg-blue-100"
                        }`}
                    >
                        <ClipboardList size={18} />
                        Training Jobs
                    </NavLink>

                    <NavLink
                        to="/model-version"
                        className={({ isActive }) =>
                            `flex items-center gap-2 w-full px-3 py-3 transition ${
                            isActive
                                ? "bg-orange-300 text-white rounded-l-xl"
                                : "text-slate-700 hover:bg-blue-100"
                        }`}
                    >
                        <ClipboardList size={18} />
                        Model Version
                    </NavLink>
                </nav>
            </div>

            <div className="flex-1 p-6">
                <Outlet />
            </div>
        </div>
    )
}