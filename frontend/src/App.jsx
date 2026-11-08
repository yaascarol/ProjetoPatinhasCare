import { Link, Route, Routes } from "react-router";

import RequireAuth from "./components/RequireAuth";
import CatsProvider from "./contexts/CatsContext";
import HealthProvider from "./contexts/HealthProvider";
import AppLayout from "./layouts/AppLayout";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import CatsPage from "./pages/CatsPage";
import CreateCatPage from "./pages/CreateCatPage";
import EditCatPage from "./pages/EditCatPage";
import HealthPage from "./pages/HealthPage";
import HealthDetailPage from "./pages/HealthDetailPage";
import AlertsPage from "./pages/AlertsPage";
import StoriesPage from "./pages/StoriesPage";
import TeamPage from "./pages/TeamPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route
          element={
            <CatsProvider>
              <HealthProvider>
                <AppLayout />
              </HealthProvider>
            </CatsProvider>
          }
        >
          <Route index element={<HomePage />} />

          <Route path="gatinhos" element={<CatsPage />} />
          <Route path="gatinhos/novo" element={<CreateCatPage />} />
          <Route path="gatinhos/:id/editar" element={<EditCatPage />} />

          <Route path="saude" element={<HealthPage />} />
          <Route
            path="saude/:id/:aba/:tipo?"
            element={<HealthDetailPage />}
          />

          <Route path="alertas" element={<AlertsPage />} />
          <Route path="historias" element={<StoriesPage />} />
          <Route path="equipe" element={<TeamPage />} />

          <Route
            path="*"
            element={
              <section>
                <h1 className="text-2xl font-semibold">
                  Página não encontrada
                </h1>

                <Link to="/" className="mt-4 inline-block underline">
                  Voltar para a página inicial
                </Link>
              </section>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}