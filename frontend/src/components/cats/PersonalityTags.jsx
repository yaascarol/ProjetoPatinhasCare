export default function PersonalityTags({ tags = [] }) {
  if (tags.length === 0) {
    return (
      <p className="text-sm text-stone-600">
        Personalidade não informada.
      </p>
    );
  }

  return (
    <ul
      aria-label="Características de personalidade"
      className="flex flex-wrap gap-2"
    >
      {tags.map((tag) => (
        <li
          key={tag}
          className="
            rounded-md bg-lilas/35
            px-2 py-1 text-xs font-medium text-texto
          "
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}