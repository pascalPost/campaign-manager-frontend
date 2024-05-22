function getContainingFolder(filePath: string): string {
  if (!filePath) {
    throw new Error("The provided path is empty.");
  }

  // Normalize path separators for Windows and Unix-like systems
  const normalizedPath = filePath.replace(/\\/g, "/");

  // Remove the trailing slash if there is one
  const trimmedPath = normalizedPath.endsWith("/")
    ? normalizedPath.slice(0, -1)
    : normalizedPath;

  // Find the last occurrence of the slash
  const lastSlashIndex = trimmedPath.lastIndexOf("/");

  if (lastSlashIndex === -1) {
    throw new Error(
      "The provided path does not contain any folder separators.",
    );
  }

  // Extract the containing folder
  const containingFolder = trimmedPath.substring(0, lastSlashIndex);

  // Return the containing folder, or root if empty
  return containingFolder || "/";
}

export { getContainingFolder };
