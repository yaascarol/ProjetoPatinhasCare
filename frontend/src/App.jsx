import { Link, Route, Routes } from "react-router";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomePage />} />

      <Route path="*" element={
        <main classNAme="min-h-screen bg-creme p-8">
          <h1 className="text-2xl font-semibold">
            Página não encontrada
          </h1>

          <Link to="/" className="mt4 inline-block underline">
            Voltar para a página inicial
          </Link>
        </main>
      }
      />
    </Routes>
  );
}