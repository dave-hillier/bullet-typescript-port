/**
 * Common callback type definitions and keyboard constants
 * Ported from Bullet3 CommonCallbacks.h
 */

// Callback type definitions
export type b3WheelCallback = (deltax: number, deltay: number) => void;
export type b3ResizeCallback = (width: number, height: number) => void;
export type b3MouseMoveCallback = (x: number, y: number) => void;
export type b3MouseButtonCallback = (button: number, state: number, x: number, y: number) => void;
export type b3KeyboardCallback = (keycode: number, state: number) => void;
export type b3RenderCallback = () => void;

// Keyboard and special key constants
export enum B3G_KEYS {
  ESCAPE = 27,
  SPACE = 32,
  F1 = 0xff00,
  F2 = 0xff01,
  F3 = 0xff02,
  F4 = 0xff03,
  F5 = 0xff04,
  F6 = 0xff05,
  F7 = 0xff06,
  F8 = 0xff07,
  F9 = 0xff08,
  F10 = 0xff09,
  F11 = 0xff0a,
  F12 = 0xff0b,
  F13 = 0xff0c,
  F14 = 0xff0d,
  F15 = 0xff0e,
  LEFT_ARROW = 0xff0f,
  RIGHT_ARROW = 0xff10,
  UP_ARROW = 0xff11,
  DOWN_ARROW = 0xff12,
  PAGE_UP = 0xff13,
  PAGE_DOWN = 0xff14,
  END = 0xff15,
  HOME = 0xff16,
  INSERT = 0xff17,
  DELETE = 0xff18,
  BACKSPACE = 0xff19,
  SHIFT = 0xff1a,
  CONTROL = 0xff1b,
  ALT = 0xff1c,
  RETURN = 0xff1d,
}

// Export individual constants for compatibility (matching original C++ macro names)
export const B3G_ESCAPE = B3G_KEYS.ESCAPE;
export const B3G_SPACE = B3G_KEYS.SPACE;
export const B3G_F1 = B3G_KEYS.F1;
export const B3G_F2 = B3G_KEYS.F2;
export const B3G_F3 = B3G_KEYS.F3;
export const B3G_F4 = B3G_KEYS.F4;
export const B3G_F5 = B3G_KEYS.F5;
export const B3G_F6 = B3G_KEYS.F6;
export const B3G_F7 = B3G_KEYS.F7;
export const B3G_F8 = B3G_KEYS.F8;
export const B3G_F9 = B3G_KEYS.F9;
export const B3G_F10 = B3G_KEYS.F10;
export const B3G_F11 = B3G_KEYS.F11;
export const B3G_F12 = B3G_KEYS.F12;
export const B3G_F13 = B3G_KEYS.F13;
export const B3G_F14 = B3G_KEYS.F14;
export const B3G_F15 = B3G_KEYS.F15;
export const B3G_LEFT_ARROW = B3G_KEYS.LEFT_ARROW;
export const B3G_RIGHT_ARROW = B3G_KEYS.RIGHT_ARROW;
export const B3G_UP_ARROW = B3G_KEYS.UP_ARROW;
export const B3G_DOWN_ARROW = B3G_KEYS.DOWN_ARROW;
export const B3G_PAGE_UP = B3G_KEYS.PAGE_UP;
export const B3G_PAGE_DOWN = B3G_KEYS.PAGE_DOWN;
export const B3G_END = B3G_KEYS.END;
export const B3G_HOME = B3G_KEYS.HOME;
export const B3G_INSERT = B3G_KEYS.INSERT;
export const B3G_DELETE = B3G_KEYS.DELETE;
export const B3G_BACKSPACE = B3G_KEYS.BACKSPACE;
export const B3G_SHIFT = B3G_KEYS.SHIFT;
export const B3G_CONTROL = B3G_KEYS.CONTROL;
export const B3G_ALT = B3G_KEYS.ALT;
export const B3G_RETURN = B3G_KEYS.RETURN;