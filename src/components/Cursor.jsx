// Cursor de selección con forma de espada/puntero que parpadea suavemente.
// Es el indicador "muy claro" de foco que pide la especificación.
export default function Cursor({ className = '', visible = true }) {
  if (!visible) return <span className={`inline-block w-[1.1em] ${className}`} />;
  return (
    <span
      aria-hidden
      className={`inline-block w-[1.1em] animate-softpulse text-gold text-pixel-shadow ${className}`}
    >
      ▶
    </span>
  );
}
