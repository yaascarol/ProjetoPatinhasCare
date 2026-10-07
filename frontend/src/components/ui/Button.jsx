export default function Button ({
    children,
    type = "button",
    ...props
}) {
    return (
        <button
        type={type}
        className="
        inline-flex min-h-11 items-center justify-center
        rounded-xl bg-roxo px-6 py-3
        font-semibold text-white
        transition hover:brightness-90
        focus-visible:outline-2
        focus-visible:outline-offset-4
        focus-visible:outline-roxo
        disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
        >
            {children}
        </button>
    );
}