import { Outlet } from "react-router";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Breadcrumbs from "../components/layout/Breadcrumbs";

export default function AppLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-creme text-texto">
            <Header />

            <div className="flex flex-1 flex-col md:flex-row">
                <Sidebar />

                <main className="min-w-0 flex-1 p-4 sm:p-6">
                    <div className="mx-auto max-w-6xl">
                        <Breadcrumbs />
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}