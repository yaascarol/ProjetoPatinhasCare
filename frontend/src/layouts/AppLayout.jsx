import { Outlet } from "react-router";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AppLayout() {
    return (
        <div className="min-h-screean bg-creme text-texto">
            <Header />
            <div className="flex">
                <Sidebar />

                <main classNAme="min-w-0 flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}