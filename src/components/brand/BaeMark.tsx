import clsx from "clsx";

const ARC_ID = "bae-mark-arc";

export default function BaeMark({
  size = 44,
  className,
  animated = false,
}: {
  size?: number;
  className?: string;
  animated?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={clsx(animated && "[&_.bae-spin]:animate-[spin_28s_linear_infinite]", className)}
      role="img"
      aria-label="BAE"
    >
      <defs>
        <path id={ARC_ID} d="M 12,50 A 38,38 0 1 1 88,50" fill="none" />
      </defs>

      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeOpacity="0.9" strokeWidth="1" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.5" />

      <g className="bae-spin" style={{ transformOrigin: "50px 50px" }}>
        <text fontSize="6.4" fontWeight="700" letterSpacing="2.2" fill="currentColor">
          <textPath href={`#${ARC_ID}`} startOffset="50%" textAnchor="middle">
            BIGDRIP UNIVERSE
          </textPath>
        </text>
      </g>

      <text x="50" y="82" fontSize="6" fontWeight="700" letterSpacing="1.6" fill="currentColor" textAnchor="middle" opacity="0.9">
        A·G·20 · EL-MAYANA
      </text>

      {/* center wordmark */}
      <text
        x="50"
        y="49"
        fontSize="19"
        fontWeight="900"
        fill="currentColor"
        textAnchor="middle"
        fontFamily="var(--font-archivo)"
      >
        BAE
      </text>

      {/* signature multicolor arc */}
      <g strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M 30,58 A 22,22 0 0 0 42,66" stroke="#E4342F" />
        <path d="M 42,66 A 22,22 0 0 0 58,66" stroke="#F4B400" />
        <path d="M 58,66 A 22,22 0 0 0 70,58" stroke="#2F6FEF" />
      </g>
      <circle cx="50" cy="68.5" r="1.6" fill="#1FB558" />
    </svg>
  );
}
