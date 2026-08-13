import type { ReactNode } from "react";

export interface CentralParams {
  posX: number;
  posY: number;
  posZ: number;
  autoPosition: boolean;
  sphereScale: number;
  haloRadius: number;
  autoScale: boolean;
  spinSpeed: number;
  autoRotation: boolean;
  glowOpacity: number;
  hue: number;
  autoColor: boolean;
}

export const defaultCentralParams: CentralParams = {
  posX: 0,
  posY: 0,
  posZ: 0,
  autoPosition: true,
  sphereScale: 1,
  haloRadius: 1.15,
  autoScale: true,
  spinSpeed: 0.3,
  autoRotation: true,
  glowOpacity: 0.18,
  hue: 0.5,
  autoColor: true,
};

const Svg = ({ d, viewBox = "0 0 16 16" }: { d: string; viewBox?: string }) => (
  <svg
    width="14"
    height="14"
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

export const MODE_INFO: Record<number, { label: string; icon: ReactNode }> = {
  0: { label: "Auto", icon: <Svg d="M4 2l10 6-10 6V2z" /> },
  1: {
    label: "Move",
    icon: <Svg d="M8 2v12M2 8h12M5 5l3-3 3 3M5 11l3 3 3-3" />,
  },
  2: { label: "Scale", icon: <Svg d="M2 14L14 2M6 14h8V6" /> },
  3: {
    label: "Color",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="7" fill="currentColor" />
      </svg>
    ),
  },
  4: {
    label: "Rotate",
    icon: <Svg d="M14 8A6 6 0 1 1 8 2c1.9 0 3.6.9 4.7 2.3M14 2v4h-4" />,
  },
};
