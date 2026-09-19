import { cn } from "@/lib/utils";

type LandscapeProps = {
  className?: string;
  scene?: "port" | "oasis" | "desert" | "mine";
};

export function Landscape({ className, scene = "desert" }: LandscapeProps) {
  return (
    <svg
      viewBox="0 0 1440 220"
      preserveAspectRatio="xMidYMax slice"
      className={cn("pointer-events-none w-full", className)}
      aria-hidden="true"
    >
      <circle cx="1180" cy="58" r="36" fill="var(--color-sun)" />
      <path d="M0 150 L220 78 L360 128 L520 40 L720 118 L900 52 L1120 110 L1440 36 L1440 220 L0 220 Z" fill="var(--color-mountain)" />
      <path d="M0 160 L180 96 L300 140 L0 170 Z" fill="var(--color-clay)" />
      <path d="M640 130 L900 56 L1080 124 L640 150 Z" fill="var(--color-mountain-deep)" />
      <path d="M1040 120 L1220 64 L1440 108 L1440 160 Z" fill="var(--color-clay)" opacity="0.85" />
      <path d="M0 168 C180 156 280 184 480 166 C700 146 880 178 1100 160 C1260 148 1360 168 1440 158 L1440 220 L0 220 Z" fill="var(--color-water)" />
      <path
        d="M40 176 C200 166 320 186 500 174 C700 160 860 186 1060 172 C1220 162 1340 180 1410 174"
        fill="none"
        stroke="var(--color-paper)"
        strokeWidth="2.4"
        strokeDasharray="2.2 5"
        strokeLinecap="round"
        opacity="0.85"
      />
      {scene === "port" ? <PortSilhouette /> : null}
      {scene === "oasis" ? <OasisSilhouette /> : null}
      {scene === "desert" ? <DesertSilhouette /> : null}
      {scene === "mine" ? <MineSilhouette /> : null}
    </svg>
  );
}

function PortSilhouette() {
  return (
    <g fill="var(--color-navy-deep)" opacity="0.92">
      <rect x="86" y="132" width="54" height="38" />
      <rect x="98" y="118" width="10" height="14" />
      <rect x="160" y="148" width="90" height="8" />
      <rect x="168" y="138" width="8" height="10" />
      <rect x="196" y="132" width="8" height="16" />
      <rect x="224" y="136" width="8" height="12" />
    </g>
  );
}

function OasisSilhouette() {
  return (
    <g fill="var(--color-navy-deep)" opacity="0.9">
      <rect x="210" y="138" width="42" height="28" />
      <polygon points="210,138 231,118 252,138" />
      <rect x="268" y="146" width="28" height="20" />
      <polygon points="268,146 282,132 296,146" />
      <rect x="188" y="158" width="8" height="18" />
      <ellipse cx="192" cy="156" rx="10" ry="6" />
    </g>
  );
}

function DesertSilhouette() {
  return (
    <g fill="var(--color-navy-deep)" opacity="0.9">
      <rect x="160" y="142" width="48" height="26" />
      <polygon points="160,142 184,122 208,142" />
      <rect x="120" y="156" width="22" height="16" />
      <rect x="112" y="164" width="6" height="14" />
      <ellipse cx="115" cy="162" rx="8" ry="5" />
    </g>
  );
}

function MineSilhouette() {
  return (
    <g fill="var(--color-navy-deep)" opacity="0.92">
      <rect x="1080" y="148" width="70" height="10" />
      <rect x="1092" y="128" width="6" height="20" />
      <rect x="1122" y="118" width="6" height="30" />
      <rect x="1220" y="150" width="46" height="18" />
      <polygon points="1243,150 1266,132 1266,150" />
    </g>
  );
}
