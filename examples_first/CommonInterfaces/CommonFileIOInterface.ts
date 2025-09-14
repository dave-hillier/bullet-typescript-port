/**
 * Common File I/O Interface
 * TypeScript port of Bullet3's CommonFileIOInterface.h
 *
 * Provides an abstraction layer for file operations, allowing different
 * implementations for various file systems and platforms.
 */

/**
 * Interface defining file I/O operations.
 * Pure virtual methods from the C++ version are converted to interface methods.
 */
export interface CommonFileIOInterface {
  /** File I/O type identifier */
  readonly fileIOType: number;

  /** Path prefix for file operations */
  readonly pathPrefix: string;

  /**
   * Opens a file with the specified mode.
   * @param fileName - Name/path of the file to open
   * @param mode - File access mode (e.g., "r", "w", "rb", "wb")
   * @returns File handle as integer, or negative value on error
   */
  fileOpen(fileName: string, mode: string): number;

  /**
   * Reads data from an open file.
   * @param fileHandle - File handle returned by fileOpen
   * @param destBuffer - Buffer to store read data
   * @param numBytes - Number of bytes to read
   * @returns Number of bytes actually read, or negative value on error
   */
  fileRead(fileHandle: number, destBuffer: Uint8Array, numBytes: number): number;

  /**
   * Writes data to an open file.
   * @param fileHandle - File handle returned by fileOpen
   * @param sourceBuffer - Buffer containing data to write
   * @param numBytes - Number of bytes to write
   * @returns Number of bytes actually written, or negative value on error
   */
  fileWrite(fileHandle: number, sourceBuffer: Uint8Array, numBytes: number): number;

  /**
   * Closes an open file.
   * @param fileHandle - File handle to close
   */
  fileClose(fileHandle: number): void;

  /**
   * Finds the full path to a resource file.
   * @param fileName - Name of the file to locate
   * @returns Full path to the resource, or null if not found
   */
  findResourcePath(fileName: string): string | null;

  /**
   * Reads a line of text from an open file.
   * @param fileHandle - File handle returned by fileOpen
   * @param maxBytes - Maximum number of bytes to read
   * @returns Line of text, or null on EOF or error
   */
  readLine(fileHandle: number, maxBytes: number): string | null;

  /**
   * Gets the size of an open file.
   * @param fileHandle - File handle returned by fileOpen
   * @returns File size in bytes, or negative value on error
   */
  getFileSize(fileHandle: number): number;

  /**
   * Enables or disables file caching.
   * @param enable - True to enable caching, false to disable
   */
  enableFileCaching(enable: boolean): void;
}

/**
 * Base class implementation providing common functionality.
 * Concrete implementations should extend this class.
 */
export abstract class BaseFileIOInterface implements CommonFileIOInterface {
  public readonly fileIOType: number;
  public readonly pathPrefix: string;

  constructor(fileIOType: number, pathPrefix: string) {
    this.fileIOType = fileIOType;
    this.pathPrefix = pathPrefix;
  }

  // Abstract methods that must be implemented by subclasses
  abstract fileOpen(fileName: string, mode: string): number;
  abstract fileRead(fileHandle: number, destBuffer: Uint8Array, numBytes: number): number;
  abstract fileWrite(fileHandle: number, sourceBuffer: Uint8Array, numBytes: number): number;
  abstract fileClose(fileHandle: number): void;
  abstract findResourcePath(fileName: string): string | null;
  abstract readLine(fileHandle: number, maxBytes: number): string | null;
  abstract getFileSize(fileHandle: number): number;
  abstract enableFileCaching(enable: boolean): void;
}

/**
 * File I/O type constants
 */
export const FileIOType = {
  /** Standard file system I/O */
  STANDARD: 0,
  /** Memory-based I/O */
  MEMORY: 1,
  /** Network-based I/O */
  NETWORK: 2,
  /** Archive-based I/O */
  ARCHIVE: 3,
} as const;

export type FileIOTypeValue = typeof FileIOType[keyof typeof FileIOType];

/**
 * File mode constants for common file access patterns
 */
export const FileMode = {
  /** Read text */
  READ_TEXT: "r",
  /** Write text */
  WRITE_TEXT: "w",
  /** Append text */
  APPEND_TEXT: "a",
  /** Read binary */
  READ_BINARY: "rb",
  /** Write binary */
  WRITE_BINARY: "wb",
  /** Append binary */
  APPEND_BINARY: "ab",
  /** Read/write text */
  READ_WRITE_TEXT: "r+",
  /** Read/write binary */
  READ_WRITE_BINARY: "rb+",
} as const;

export type FileModeValue = typeof FileMode[keyof typeof FileMode];