import { Link } from "react-router";

const variantes = {
  primary: "bg-roxo text-white hover:brightness-90",
  secondary: "border border-lima text-texto hover:bg-lilas/20",
};

export default function Button({
  children,
  type = "button",
  to,
  variant = "primary",
  className = "",
  ...props
}) {
  const estilos = `
    inline-flex min-h-11 items-center justify-center gap-2
    rounded-xl px-5 py-2.5 text-sm font-semibold
    transition-colors
    focus-visible:outline-2
    focus-visible:outline-offset-4
    focus-visible:outline-roxo
    disabled:cursor-not-allowed disabled:opacity-50
    ${variantes[variant] ?? variantes.primary}
    ${className}
  `;

  if (to) {
    return (
      <Link to={to} className={estilos} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={estilos} {...props}>
      {children}
    </button>
  );
}