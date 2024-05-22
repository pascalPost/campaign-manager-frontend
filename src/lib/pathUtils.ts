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

  // Handle the case where the last slash is at the beginning
  if (lastSlashIndex === 0) {
    return "/";
  }

  // Extract the containing folder
  const containingFolder = trimmedPath.substring(0, lastSlashIndex);

  return containingFolder;
}

export { getContainingFolder };
