import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'

const DIR = 'src/components/pages/apps'

const INC = 2

function shouldIgnore(path: string) {
  return (
    path.includes('node_modules') ||
    path.includes('dist') ||
    path.includes('.git') ||
    path.includes('build') ||
    path.includes('out') ||
    path.includes('public') ||
    path.includes('assets') ||
    path.includes('scripts') ||
    path.includes('manifest.json') // we only want to update the manifest in the root of each app, not in subfolders
  )
}

function hashFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8')

  return createHash('sha256')
    .update(filePath)
    .update('\n')
    .update(content)
    .digest('hex')
}

function hasManifest(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  return entries.some(
    (entry) => entry.isFile() && entry.name === 'manifest.json'
  )
}

function getManifestDirs(dir: string, manifestDirs: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (hasManifest(fullPath)) {
        manifestDirs.push(fullPath)
      } else {
        getManifestDirs(fullPath, manifestDirs)
      }
    }
  }

  return manifestDirs
}

function getAllFiles(dir: string, files: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files)
    } else {
      files.push(fullPath)
    }
  }

  return files
}

export function hashFolder(folder: string): string {
  let files: string[] = []
  getAllFiles(folder, files)
  files = files.filter((f) => !shouldIgnore(f)).sort() // critical for deterministic output

  // hash each file and combine the hashes into a single hash for the folder
  const fileHashes = files.map(hashFile)

  return createHash('sha256').update(fileHashes.join('\n')).digest('hex')
}

function updateAppVersion(dir: string) {
  const manifestPath = path.join(dir, 'manifest.json')

  if (!fs.existsSync(manifestPath)) {
    console.warn(`No manifest found in ${dir}. Skipping.`)
    return
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))

  let currentBuild = parseInt(manifest.build || '-1', 10)
  const currentHash = manifest.hash || ''
  const newHash = hashFolder(dir)

  if (currentBuild < 1) {
    currentBuild = parseInt(manifest.version.split('.')[3], 10)

    console.warn(
      `No build number found in manifest for ${dir}. Adding build number...`
    )
    manifest.version = manifest.version.split('.').slice(0, 3).join('.')
    manifest.build = currentBuild
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    return
  }

  if (currentHash === '') {
    // add the hash to the manifest if it doesn't exist
    console.log(`Adding hash ${newHash} to manifest for ${dir}...`)
    manifest.hash = newHash
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    return
  }

  if (currentHash === newHash) {
    console.log(`No changes detected for ${dir}. Skipping version update.`)
    return
  }

  console.log(`Updating version for ${dir}...`)

  let build = parseInt(manifest.build, 10)

  let [major, minor, patch] = manifest.version.split('.')
  major = parseInt(major, 10)
  minor = parseInt(minor, 10)
  patch = parseInt(patch, 10)

  build += INC

  if (build % 10 === 0) {
    patch += INC

    if (patch % 10 === 0) {
      patch = 0
      minor += INC

      if (minor % 10 === 0) {
        minor = 0
        major += INC
      }
    }
  }

  manifest.build = build
  manifest.version = `${major}.${minor}.${patch}`
  manifest.modified = new Date().toISOString()
  manifest.hash = newHash

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

  console.log(`Updated version to ${manifest.version} for ${dir}`)
}

function walk(dir: string) {
  const manifestDirs: string[] = []
  getManifestDirs(dir, manifestDirs)

  if (manifestDirs.length === 0) {
    console.warn(`No manifest found in ${dir} or subdirectories. Skipping.`)
    return
  }

  manifestDirs.sort()

  console.log(
    `Found manifest in ${manifestDirs.length} directories. Updating versions...`
  )

  for (const dir of manifestDirs) {
    console.log(`Processing ${dir}...`)
    updateAppVersion(dir)
  }
}

console.log()
console.log(`---- Updating app versions ----`)
console.log(`dir: ${DIR}`)
console.log()

walk(DIR)

console.log()
console.log(`---- End updating app versions ----`)
console.log()
