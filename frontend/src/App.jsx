import { Link, Route, Routes } from "react-router";

import CatsProvider from "./contexts/CatsContext";
import AppLayout from "./layouts/AppLayout";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import CatsPage from "./pages/CatsPage";
import CreateCatPage from "./pages/CreateCatPage"
import EditCatPage from "./pages/EditCatPage"
//import NotFoundPage from "./pages/NotFoundPage"

export default function App() {
  return (
    <CatsProvider>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
      <Route index element={<HomePage />}/>
      <Route path="gatinhos" element={<CatsPage />} />
      <Route path="gatinhos/novo" element={<CreateCatPage />}/>
      <Route path="gatinhos/:id/editar" element={<EditCatPage/>}/>


      <Route path="*" element={
        <section>
          <h1 className="text-2xl font-semibold">
            Página não encontrada
          </h1>

          <Link to="/" className="mt4 inline-block underline">
            Voltar para a página inicial
          </Link>
        </section>
      }
      />
      </Route>
    </Routes>
  </CatsProvider>
  );
}