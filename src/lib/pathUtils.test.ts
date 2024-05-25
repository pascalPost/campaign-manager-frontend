import { getContainingFolder } from "./pathUtils";
import { describe, expect, test } from "vitest";

describe("getContainingFolder", () => {
  test("should return the containing folder for a Unix-like path", () => {
    expect(getContainingFolder("/Users/username/project/file.txt")).toBe(
      "/Users/username/project",
    );
  });

  test("should return the containing folder for a Windows path", () => {
    expect(getContainingFolder("C:\\Users\\username\\project\\file.txt")).toBe(
      "C:/Users/username/project",
    );
  });

  test("should return the containing folder for a Windows path with a different drive", () => {
    expect(getContainingFolder("D:\\Data\\projects\\file.txt")).toBe(
      "D:/Data/projects",
    );
  });

  test('should return "/" for a Unix-like path with a file in the root directory', () => {
    expect(getContainingFolder("/file")).toBe("/");
  });

  test("should return the containing folder for a path with a trailing slash", () => {
    expect(getContainingFolder("/folder/subfolder/")).toBe("/folder");
    expect(getContainingFolder("C:\\folder\\subfolder\\")).toBe("C:/folder");
  });

  test("should throw an error for an empty path", () => {
    expect(() => getContainingFolder("")).toThrow(
      "The provided path is empty.",
    );
  });

  test("should throw an error for a path without any folder separators", () => {
    expect(() => getContainingFolder("file")).toThrow(
      "The provided path does not contain any folder separators.",
    );
  });
});
