import { useId, useRef } from "react";

export default function ActionsDropdown({ nome, disabled, children }) {
  const id = useId();
  const painel = useRef(null);

  function posicionar(event) {
    const botao = event.currentTarget.getBoundingClientRect();
    const elemento = painel.current;
    elemento.style.left = `${Math.max(8, Math.min(botao.right - 240, window.innerWidth - 248))}px`;
    const abaixo = window.innerHeight - botao.bottom;
    elemento.style.top = abaixo >= 280 ? `${botao.bottom + 8}px` : "auto";
    elemento.style.bottom = abaixo >= 280 ? "auto" : `${window.innerHeight - botao.top + 8}px`;
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        popoverTarget={id}
        aria-label={`Ações de ${nome}`}
        onClick={posicionar}
        className="flex size-11 items-center justify-center rounded-xl text-2xl text-stone-700 transition-colors hover:bg-lilas/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 disabled:opacity-50"
      >
        <span aria-hidden="true">⋯</span>
      </button>
      <div
        ref={painel}
        id={id}
        popover="auto"
        aria-label={`Ações de ${nome}`}
        className="fixed m-0 max-h-[calc(100dvh-2rem)] w-60 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-xl border border-lilas bg-creme p-2 text-sm shadow-lg"
        onClick={event => {
          if (event.target.closest("button:not(:disabled)")) painel.current.hidePopover();
        }}
      >
        {children}
      </div>
    </>
  );
}
