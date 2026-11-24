export default function LoadingScreen({ message = "Carregando informações do Entre Lares", fullScreen = true }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`flex flex-col items-center justify-center bg-creme px-6 py-10 text-center ${fullScreen ? "min-h-dvh" : "min-h-56"}`}
    >
      <img
        src="/imagens/patinhas-carregando.gif"
        alt=""
        width="160"
        height="160"
        className="size-40 object-contain mix-blend-multiply motion-reduce:hidden"
      />
      <span aria-hidden="true" className="hidden py-8 text-5xl motion-reduce:block">🐾</span>
      <p className="mt-3 text-lg font-medium text-texto">{message}</p>
    </div>
  );
}
