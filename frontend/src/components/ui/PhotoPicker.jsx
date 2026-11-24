import { useEffect, useId, useRef, useState } from "react";
import Button from "./Button";

import { cropArea } from "../../utils/photoCrop";

function CropEditor({ source, aspect, onApply, onCancel }) {
  const dialog = useRef(null);
  const canvas = useRef(null);
  const [image, setImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const title = useId();

  useEffect(() => {
    const modal = dialog.current;
    modal.showModal();
    let active = true;
    const picture = new Image();
    picture.crossOrigin = "use-credentials";
    picture.onload = () => {
      if (!active) return;
      if (picture.naturalWidth * picture.naturalHeight > 25_000_000) {
        setError("Escolha uma imagem de até 25 megapixels.");
      } else setImage(picture);
    };
    picture.onerror = () => active && setError("Não foi possível abrir a foto. Tente escolher o arquivo novamente.");
    picture.src = source;
    return () => { active = false; modal.close(); };
  }, [source]);

  useEffect(() => {
    if (!image) return;
    const area = cropArea(image.naturalWidth, image.naturalHeight, aspect, zoom, x, y);
    const output = canvas.current;
    const context = output.getContext("2d");
    context.clearRect(0, 0, output.width, output.height);
    context.drawImage(image, ...area, 0, 0, output.width, output.height);
  }, [image, aspect, zoom, x, y]);

  function apply() {
    setBusy(true);
    try {
      canvas.current.toBlob(blob => {
        if (!blob || blob.size > 5 * 1024 * 1024) {
          setError("Não foi possível preparar a foto. Escolha outra imagem.");
          setBusy(false);
          return;
        }
        onApply(new File([blob], "foto-recortada.webp", { type: "image/webp" }), canvas.current.toDataURL("image/webp", 0.9));
      }, "image/webp", 0.9);
    } catch {
      setError("Não foi possível recortar essa foto. Escolha o arquivo no seu dispositivo.");
      setBusy(false);
    }
  }

  return (
    <dialog ref={dialog} aria-labelledby={title} onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[min(92vw,36rem)] overflow-y-auto rounded-2xl border border-lima bg-creme p-5 text-texto shadow-xl backdrop:bg-black/50">
      <h2 id={title} className="text-xl font-semibold">Ajustar enquadramento</h2>
      <p className="my-3 text-sm">Use os controles para escolher a parte da foto que aparecerá no card.</p>
      <canvas ref={canvas} width={1200} height={Math.round(1200 / aspect)}
        aria-label="Prévia do recorte" className="mx-auto max-h-[40dvh] max-w-full rounded-xl bg-lilas/20" />
      {!image && !error && <p role="status">Carregando foto...</p>}
      <fieldset disabled={!image || busy} className="my-4 space-y-3">
        <label className="block">Zoom
          <input className="block w-full accent-purple-700" type="range" min="1" max="3" step="0.01" value={zoom} onChange={e => setZoom(Number(e.target.value))} />
        </label>
        <label className="block">Posição horizontal
          <input className="block w-full accent-purple-700" type="range" min="0" max="100" value={x} onChange={e => setX(Number(e.target.value))} />
        </label>
        <label className="block">Posição vertical
          <input className="block w-full accent-purple-700" type="range" min="0" max="100" value={y} onChange={e => setY(Number(e.target.value))} />
        </label>
      </fieldset>
      {error && <p role="alert" className="my-3 text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" disabled={busy} onClick={onCancel}>Cancelar</Button>
        <Button disabled={!image || busy} onClick={apply}>{busy ? "Preparando..." : "Aplicar recorte"}</Button>
      </div>
    </dialog>
  );
}

export default function PhotoPicker({ currentUrl = "", aspect = 1, disabled = false, onChange }) {
  const input = useRef(null);
  const [preview, setPreview] = useState(null);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const reader = useRef(null);
  const shown = preview ?? currentUrl;
  useEffect(() => () => reader.current?.abort(), []);

  function choose(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Escolha uma foto JPG, PNG ou WebP de até 5 MB.");
      return;
    }
    setLoading(true);
    const load = new FileReader();
    reader.current = load;
    load.onload = () => { setSource(load.result); setLoading(false); };
    load.onerror = () => { setError("Não foi possível ler o arquivo."); setLoading(false); };
    load.readAsDataURL(file);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Foto</p>
      {shown && <img src={shown} alt="Prévia da foto" style={{ aspectRatio: aspect }} className="w-full max-w-sm rounded-xl bg-lilas/20 object-contain" />}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} hidden />
      <div className="flex flex-wrap gap-3">
        <Button disabled={disabled || loading} onClick={() => input.current.click()}>{loading ? "Abrindo foto..." : shown ? "Trocar foto" : "Adicionar foto"}</Button>
        {shown && <>
          <Button variant="secondary" disabled={disabled || loading} onClick={() => { setError(""); setSource(shown); }}>Ajustar recorte</Button>
          <Button variant="secondary" disabled={disabled || loading} onClick={() => { setPreview(""); setError(""); onChange(null, true); }}>Remover foto</Button>
        </>}
      </div>
      <p className="text-sm text-stone-600">JPG, PNG ou WebP, até 5 MB. A alteração só será enviada ao salvar o cadastro.</p>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {source && <CropEditor source={source} aspect={aspect} onCancel={() => setSource("")}
        onApply={(file, url) => { setPreview(url); setSource(""); onChange(file, false); }} />}
    </div>
  );
}
