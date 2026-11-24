// O mesmo retângulo é usado na prévia e no arquivo enviado ao backend.
export function cropArea(width, height, aspect, zoom, x, y) {
  const w = Math.min(width, height * aspect) / zoom;
  const h = w / aspect;
  return [(width - w) * x / 100, (height - h) * y / 100, w, h];
}

