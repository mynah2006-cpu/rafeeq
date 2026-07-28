// ============================================================
// RAFEEQ — Expression Definitions (Neon Minimal Design)
//
// Every face state is expressed through:
//   Eyes: circles that change size, fill vs. ring, or flatten
//   Mouth: a bezier curve that changes curvature
//
// No skin. No iris. No eyebrows. Pure geometric form.
//
// SVG viewBox: "0 0 240 200"
// Left eye center:  (75, 82)
// Right eye center: (165, 82)
// Mouth center:     ~(120, 150)
// ============================================================

import type { FaceState } from '../../../types';

/** Controls a single eye shape */
export interface EyeShapeData {
  r: number;
  fillOpacity: number;
  strokeWidth: number;
  scaleX: number;
  scaleY: number;
  offsetY: number;
}

/** Controls eyelids */
export interface EyelidShapeData {
  closeAmount: number;
  opacity: number;
}

/** Controls a single eyebrow */
export interface EyebrowShapeData {
  path: string;
  rotate: number;
  offsetY: number;
  opacity: number;
}

/** Controls the mouth shape */
export interface MouthShapeData {
  path: string;
  type: 'curve' | 'oval';
}

export interface ExpressionTarget {
  eye: EyeShapeData;
  eyebrow: EyebrowShapeData;
  eyelid: EyelidShapeData;
  mouth: MouthShapeData;
}

// ---- Expression Library ----------------------------------------
//
// Mouth paths use this consistent command structure for smooth morphing:
//   M startX startY Q controlX controlY endX endY
//
// Left anchor:   x = 85,  y = 150
// Right anchor:  x = 155, y = 150
// Control point: x = 120, y varies per expression
//   > 150 = smile   (control BELOW anchor line)
//   = 150 = flat
//   < 150 = frown   (control ABOVE anchor line)
//
// ------------------------------------------------------------------

const EXPRESSIONS: Record<FaceState, ExpressionTarget> = {

  idle: {
    eye:     { r: 26, fillOpacity: 1, strokeWidth: 0, scaleX: 1, scaleY: 1, offsetY: 0 },
    eyebrow: { path: 'M 60 40 Q 75 30 90 40', rotate: 0, offsetY: 0, opacity: 1 },
    eyelid:  { closeAmount: 0, opacity: 0 },
    mouth:   { path: 'M 85 150 Q 120 168 155 150', type: 'curve' },
  },

  listening: {
    eye:     { r: 31, fillOpacity: 1, strokeWidth: 0, scaleX: 1, scaleY: 1, offsetY: 0 },
    eyebrow: { path: 'M 60 38 Q 75 28 90 38', rotate: 2, offsetY: -2, opacity: 1 },
    eyelid:  { closeAmount: 0, opacity: 0 },
    mouth:   { path: 'M 88 150 Q 120 162 152 150', type: 'curve' },
  },

  thinking: {
    eye:     { r: 26, fillOpacity: 1, strokeWidth: 0, scaleX: 1.25, scaleY: 0.42, offsetY: 4 },
    eyebrow: { path: 'M 58 44 Q 75 34 92 44', rotate: -3, offsetY: 4, opacity: 1 },
    eyelid:  { closeAmount: 0.3, opacity: 1 },
    mouth:   { path: 'M 96 150 Q 120 150 144 150', type: 'curve' },
  },

  speaking: {
    eye:     { r: 26, fillOpacity: 1, strokeWidth: 0, scaleX: 1, scaleY: 1, offsetY: 0 },
    eyebrow: { path: 'M 60 40 Q 75 30 90 40', rotate: 0, offsetY: 0, opacity: 1 },
    eyelid:  { closeAmount: 0, opacity: 0 },
    mouth:   { path: 'M 85 150 Q 120 162 155 150', type: 'curve' },
  },

  happy: {
    eye:     { r: 33, fillOpacity: 1, strokeWidth: 0, scaleX: 1, scaleY: 1, offsetY: 0 },
    eyebrow: { path: 'M 62 34 Q 75 22 88 34', rotate: 8, offsetY: -6, opacity: 1 },
    eyelid:  { closeAmount: 0, opacity: 0 },
    mouth:   { path: 'M 78 148 Q 120 180 162 148', type: 'curve' },
  },

  concerned: {
    eye:     { r: 25, fillOpacity: 0, strokeWidth: 5.5, scaleX: 1, scaleY: 1, offsetY: 0 },
    eyebrow: { path: 'M 58 42 Q 75 34 92 42', rotate: -6, offsetY: 4, opacity: 1 },
    eyelid:  { closeAmount: 0.05, opacity: 1 },
    mouth:   { path: 'M 88 158 Q 120 142 152 158', type: 'curve' },
  },

  surprised: {
    eye:     { r: 30, fillOpacity: 0, strokeWidth: 5.5, scaleX: 1, scaleY: 1, offsetY: 0 },
    eyebrow: { path: 'M 58 32 Q 75 20 92 32', rotate: 12, offsetY: -10, opacity: 1 },
    eyelid:  { closeAmount: 0, opacity: 0 },
    mouth:   { path: 'M 108 148 Q 120 148 132 148', type: 'oval' },
  },

  sleeping: {
    eye:     { r: 26, fillOpacity: 1, strokeWidth: 0, scaleX: 1.55, scaleY: 0.07, offsetY: 0 },
    eyebrow: { path: 'M 60 40 Q 75 30 90 40', rotate: 0, offsetY: 0, opacity: 0 },
    eyelid:  { closeAmount: 1, opacity: 1 },
    mouth:   { path: 'M 100 150 Q 120 158 140 150', type: 'curve' },
  },
};

export const getExpression = (state: FaceState): ExpressionTarget =>
  EXPRESSIONS[state] ?? EXPRESSIONS.idle;
