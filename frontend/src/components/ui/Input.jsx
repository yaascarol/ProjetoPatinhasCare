export default function Input({
    label,
    id,
    type = "text",
    ...props
}) {
    return (
        <div className="flex flex-col gap2">
        <label
        htmlFor={id}
        className="text-sm font-medium text-texto"
        >
            {label}
        </label>

        <input 
        id={id}
        type={type}
        className="
        min-h-11 w-full rounded-xl
        border border-lima bg-transparent
        px-3 py-2 text-texto
        outline-nome
        focus:border-roxo focus:ring-2
        focus:ring-roxo/20"
        {...props}
        />
        </div>
    );
}