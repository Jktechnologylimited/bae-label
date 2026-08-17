export default function WorldDots({ className }: { className?: string }) {
  const cols = 22;
  const rows = 12;
  const dots = [];
  // rough silhouette mask using a simple noise-based pseudo continent pattern
  const seedRow = [3,5,6,7,8,9,10,12,13,14,15,16,17,18,20];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const on = (c + r * 7) % 3 !== 0 && seedRow.includes((c + r) % 22);
      if (on) dots.push({ x: c, y: r });
    }
  }
  return (
    <svg viewBox={`0 0 ${cols * 8} ${rows * 8}`} className={className} aria-hidden>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x * 8} cy={d.y * 8} r="1.1" fill="currentColor" />
      ))}
    </svg>
  );
}
