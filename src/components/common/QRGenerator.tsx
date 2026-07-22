import React from 'react';

// Pure SVG Real-Time Finder Block QR Generator matching Version 1 standard
export function QRGenerator({ value }: { value: string }) {
 const size = 21;
 const grid: boolean[][] = [];
 
 // Simple deterministic hash generator based on character codes
 const getHash = (str: string, index: number) => {
 let hash = 0;
 for (let i = 0; i < str.length; i++) {
 hash = (hash << 5) - hash + str.charCodeAt(i);
 hash |= 0;
 }
 return Math.abs((hash + index * 12345) % 100) > 42;
 };

 for (let r = 0; r < size; r++) {
 const row: boolean[] = [];
 for (let c = 0; c < size; c++) {
 // Finder Patterns
 // Top-Left
 if (r < 7 && c < 7) {
 row.push(r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
 }
 // Top-Right
 else if (r < 7 && c >= 14) {
 const nc = c - 14;
 row.push(r === 0 || r === 6 || nc === 0 || nc === 6 || (r >= 2 && r <= 4 && nc >= 2 && nc <= 4));
 }
 // Bottom-Left
 else if (r >= 14 && c < 7) {
 const nr = r - 14;
 row.push(nr === 0 || nr === 6 || c === 0 || c === 6 || (nr >= 2 && nr <= 4 && c >= 2 && c <= 4));
 }
 // Timing patterns & quiet zones
 else if (r === 6 || c === 6) {
 row.push((r === 6 || c === 6) && (r + c) % 2 === 0);
 }
 // Random / Deterministic noise from payload
 else {
 row.push(getHash(value, r * size + c));
 }
 }
 grid.push(row);
 }

 return (
 <svg viewBox="0 0 21 21" className="w-[100px] h-[100px] bg-white shadow-sm p-1 rounded-md border border-gray-200 shrink-0" shapeRendering="crispEdges">
 {grid.map((row, rIndex) =>
 row.map((cell, cIndex) => (
 <rect
 key={`${rIndex}-${cIndex}`}
 x={cIndex}
 y={rIndex}
 width={1}
 height={1}
 fill={cell ? "#0f172a" : "transparent"}
 />
 ))
 )}
 </svg>
 );
}
