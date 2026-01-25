"use client";

import { useState } from "react";

interface CompassSelectorProps {
  value: string;
  onChange: (value: string) => void;
  showUnknownOption?: boolean;
}

const DIRECTIONS = [
  { value: "norden", label: "N", fullLabel: "Norden", angle: 0 },
  { value: "nordost", label: "NO", fullLabel: "Nordost", angle: 45 },
  { value: "osten", label: "O", fullLabel: "Osten", angle: 90 },
  { value: "suedost", label: "SO", fullLabel: "Südost", angle: 135 },
  { value: "sueden", label: "S", fullLabel: "Süden", angle: 180 },
  { value: "suedwest", label: "SW", fullLabel: "Südwest", angle: 225 },
  { value: "westen", label: "W", fullLabel: "Westen", angle: 270 },
  { value: "nordwest", label: "NW", fullLabel: "Nordwest", angle: 315 },
];

function getSegmentFill(value: string, isSelected: boolean, isHovered: boolean): string {
  if (isSelected) {
    return "#facc15";
  }
  if (isHovered) {
    return "#fef3c7";
  }
  
  switch (value) {
    case "sueden":
      return "#dcfce7";
    case "suedost":
    case "suedwest":
      return "#d1fae5";
    case "osten":
    case "westen":
      return "#fef3c7";
    case "nordost":
    case "nordwest":
      return "#ffedd5";
    case "norden":
      return "#fee2e2";
    default:
      return "#f3f4f6";
  }
}

function getSegmentStroke(value: string, isSelected: boolean): string {
  if (isSelected) {
    return "#eab308";
  }
  
  switch (value) {
    case "sueden":
      return "#86efac";
    case "suedost":
    case "suedwest":
      return "#6ee7b7";
    case "osten":
    case "westen":
      return "#fcd34d";
    case "nordost":
    case "nordwest":
      return "#fdba74";
    case "norden":
      return "#fca5a5";
    default:
      return "#d1d5db";
  }
}

function createSegmentPath(startAngle: number, endAngle: number, innerRadius: number, outerRadius: number): string {
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);
  
  const x1Outer = 50 + outerRadius * Math.cos(startRad);
  const y1Outer = 50 + outerRadius * Math.sin(startRad);
  const x2Outer = 50 + outerRadius * Math.cos(endRad);
  const y2Outer = 50 + outerRadius * Math.sin(endRad);
  
  const x1Inner = 50 + innerRadius * Math.cos(endRad);
  const y1Inner = 50 + innerRadius * Math.sin(endRad);
  const x2Inner = 50 + innerRadius * Math.cos(startRad);
  const y2Inner = 50 + innerRadius * Math.sin(startRad);
  
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  
  return `
    M ${String(x1Outer)} ${String(y1Outer)}
    A ${String(outerRadius)} ${String(outerRadius)} 0 ${String(largeArc)} 1 ${String(x2Outer)} ${String(y2Outer)}
    L ${String(x1Inner)} ${String(y1Inner)}
    A ${String(innerRadius)} ${String(innerRadius)} 0 ${String(largeArc)} 0 ${String(x2Inner)} ${String(y2Inner)}
    Z
  `;
}

export function CompassSelector({
  value,
  onChange,
  showUnknownOption = true,
}: CompassSelectorProps) {
  const [hoveredDirection, setHoveredDirection] = useState<string | null>(null);

  const selectedDirection = DIRECTIONS.find((d) => d.value === value);
  const displayLabel = selectedDirection?.fullLabel ?? (value === "weiss-nicht" ? "Weiß ich nicht" : null);

  const innerRadius = 18;
  const outerRadius = 46;
  const labelRadius = 32;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80">
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full drop-shadow-lg"
        >
          <circle 
            cx="50" 
            cy="50" 
            r="48" 
            fill="white" 
            stroke="#e5e7eb" 
            strokeWidth="0.5"
          />
          
          {DIRECTIONS.map((direction) => {
            const isSelected = value === direction.value;
            const isHovered = hoveredDirection === direction.value;
            const startAngle = direction.angle - 22.5;
            const endAngle = direction.angle + 22.5;
            
            const labelAngleRad = (direction.angle - 90) * (Math.PI / 180);
            const labelX = 50 + labelRadius * Math.cos(labelAngleRad);
            const labelY = 50 + labelRadius * Math.sin(labelAngleRad);

            return (
              <g key={direction.value}>
                <path
                  d={createSegmentPath(startAngle, endAngle, innerRadius, outerRadius)}
                  fill={getSegmentFill(direction.value, isSelected, isHovered)}
                  stroke={getSegmentStroke(direction.value, isSelected)}
                  strokeWidth={isSelected ? "0.8" : "0.4"}
                  className="cursor-pointer transition-all duration-150"
                  onClick={() => onChange(direction.value)}
                  onMouseEnter={() => setHoveredDirection(direction.value)}
                  onMouseLeave={() => setHoveredDirection(null)}
                  role="button"
                  aria-label={direction.fullLabel}
                />
                
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`
                    text-[6px] sm:text-[5px] font-bold pointer-events-none select-none
                    ${isSelected ? "fill-gray-900" : "fill-gray-600"}
                  `}
                  style={{ fontSize: direction.label.length > 1 ? "5px" : "6px" }}
                >
                  {direction.label}
                </text>
              </g>
            );
          })}
          
          <circle 
            cx="50" 
            cy="50" 
            r={innerRadius - 1} 
            fill="white" 
            stroke="#d1d5db" 
            strokeWidth="0.5"
          />
          
          <circle 
            cx="50" 
            cy="50" 
            r="2" 
            fill="#9ca3af"
          />
          
          {[0, 90, 180, 270].map((angle) => {
            const rad = (angle - 90) * (Math.PI / 180);
            const x1 = 50 + 47 * Math.cos(rad);
            const y1 = 50 + 47 * Math.sin(rad);
            const x2 = 50 + 49 * Math.cos(rad);
            const y2 = 50 + 49 * Math.sin(rad);
            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#9ca3af"
                strokeWidth="0.8"
              />
            );
          })}
        </svg>
      </div>

      <div className="text-center min-h-[60px]">
        {displayLabel ? (
          <>
            <p className="text-lg font-semibold text-gray-800">
              {displayLabel}
            </p>
            {selectedDirection && (
              <p className="text-sm text-gray-500 mt-1">
                {getEfficiencyHint(selectedDirection.value)}
              </p>
            )}
          </>
        ) : (
          <p className="text-gray-400">
            Wähle eine Richtung im Kompass
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 text-xs">
        <span className="px-2 py-1 rounded bg-green-100 text-green-700 border border-green-200">Optimal</span>
        <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-600 border border-emerald-200">Sehr gut</span>
        <span className="px-2 py-1 rounded bg-amber-100 text-amber-600 border border-amber-200">Gut</span>
        <span className="px-2 py-1 rounded bg-orange-100 text-orange-600 border border-orange-200">Mäßig</span>
        <span className="px-2 py-1 rounded bg-red-100 text-red-600 border border-red-200">Ungünstig</span>
      </div>

      {showUnknownOption && (
        <button
          onClick={() => onChange("weiss-nicht")}
          className={`
            mt-2 px-6 py-3 rounded-lg border-2 transition-all duration-200
            font-medium text-sm
            ${value === "weiss-nicht"
              ? "border-yellow-400 bg-yellow-50 text-gray-800"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }
          `}
          type="button"
        >
          Weiß ich nicht
        </button>
      )}
    </div>
  );
}

function getEfficiencyHint(direction: string): string {
  switch (direction) {
    case "sueden":
      return "Optimale Ausrichtung – maximaler Ertrag";
    case "suedost":
    case "suedwest":
      return "Sehr gute Ausrichtung – ca. 95% Ertrag";
    case "osten":
      return "Gute Ausrichtung – Morgensonne, ca. 80% Ertrag";
    case "westen":
      return "Gute Ausrichtung – Abendsonne, ca. 80% Ertrag";
    case "nordost":
    case "nordwest":
      return "Mäßige Ausrichtung – ca. 65% Ertrag";
    case "norden":
      return "Ungünstige Ausrichtung – nur ca. 55% Ertrag";
    default:
      return "";
  }
}
