/**
 * TypeScript port of Common2dCanvasInterface.h from Bullet3
 *
 * Interface for 2D canvas operations including canvas management
 * and pixel manipulation.
 */

/**
 * Represents pixel color data with RGBA components
 */
export interface PixelData {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

/**
 * Interface for 2D canvas operations.
 *
 * This interface provides methods for creating and managing 2D canvases,
 * setting and getting pixel data, and refreshing the canvas display.
 */
export interface Common2dCanvasInterface {
  /**
   * Creates a new canvas with the specified parameters.
   *
   * @param canvasName - Name identifier for the canvas
   * @param width - Width of the canvas in pixels
   * @param height - Height of the canvas in pixels
   * @param xPos - X position for canvas placement
   * @param yPos - Y position for canvas placement
   * @returns Canvas ID for referencing this canvas in other operations
   */
  createCanvas(canvasName: string, width: number, height: number, xPos: number, yPos: number): number;

  /**
   * Destroys a canvas and frees its resources.
   *
   * @param canvasId - ID of the canvas to destroy
   */
  destroyCanvas(canvasId: number): void;

  /**
   * Sets a pixel at the specified coordinates to the given color.
   *
   * @param canvasId - ID of the target canvas
   * @param x - X coordinate of the pixel
   * @param y - Y coordinate of the pixel
   * @param red - Red component (0-255)
   * @param green - Green component (0-255)
   * @param blue - Blue component (0-255)
   * @param alpha - Alpha component (0-255)
   */
  setPixel(canvasId: number, x: number, y: number, red: number, green: number, blue: number, alpha: number): void;

  /**
   * Gets the color data of a pixel at the specified coordinates.
   *
   * @param canvasId - ID of the target canvas
   * @param x - X coordinate of the pixel
   * @param y - Y coordinate of the pixel
   * @returns PixelData object containing RGBA values
   */
  getPixel(canvasId: number, x: number, y: number): PixelData;

  /**
   * Refreshes the image data for the specified canvas.
   * This method should be called after making pixel changes to update the display.
   *
   * @param canvasId - ID of the canvas to refresh
   */
  refreshImageData(canvasId: number): void;
}