/**
 * Parse a path name into its consituents.
 *
 * @param path a forward slash '/' delimited string.
 * @returns an object containing the full path, the directory,
 * the file name (wihout directory), the name of the file
 * without extension and the file extension.
 */
export function parse(path: string) {
  let lastIndex = path.lastIndexOf('/')
  const dir = path.slice(0, lastIndex)
  const file = path.slice(lastIndex + 1)
  lastIndex = file.lastIndexOf('.')
  const name = file.slice(0, lastIndex)
  const ext = file.slice(lastIndex + 1)
  return { path, dir, file, name, ext }
}

export function friendlyFilename(str: string): string {
  // Replace spaces with underscores or dashes (whichever you prefer)
  let friendlyStr = str.replace(/\s+/g, '_')

  // Remove any characters that are not allowed in filenames
  friendlyStr = friendlyStr.replace(/[\/:*?"<>|\\]/g, '')

  // Optionally convert to lowercase (if desired)
  friendlyStr = friendlyStr.toLowerCase()

  // Optionally trim leading/trailing whitespace
  friendlyStr = friendlyStr.trim()

  return friendlyStr
}

/**
 * Replace the file extension in a path with another. If no extension is
 * present, the extension will be added.
 *
 * @param filePath
 * @param newExt
 * @returns
 */
export function replaceFileExt(filePath: string, newExt: string) {
  // Ensure the new extension starts with a dot
  if (!newExt.startsWith('.')) {
    newExt = '.' + newExt
  }

  // Find the last dot in the file name (this indicates the start of the extension)
  const lastDotIndex = filePath.lastIndexOf('.')

  // If a dot is found and it's not at the beginning of the string, replace the extension
  if (lastDotIndex !== -1 && lastDotIndex !== 0) {
    return filePath.slice(0, lastDotIndex) + newExt
  }

  // If there's no dot, just return the file path with the new extension appended
  return filePath + newExt
}
