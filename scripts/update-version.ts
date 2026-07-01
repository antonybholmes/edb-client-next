import type { IAppInfo } from '@/lib/app-info'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'

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

function hashFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8')

  return createHash('sha256')
    .update(filePath)
    .update('\n')
    .update(content)
    .digest('hex')
}

export function hashFolder(folder: string): string {
  let files: string[] = []
  getAllFiles(folder, files)
  files = files.filter((f) => !shouldIgnore(f)).sort() // critical for deterministic output

  // hash each file and combine the hashes into a single hash for the folder
  const fileHashes = files.map(hashFile)

  return createHash('sha256').update(fileHashes.join('\n')).digest('hex')
}

const newHash = hashFolder('src/')

//const files: string[] = []
//getAllFiles('src/', files)

const info = JSON.parse(
  fs.readFileSync('./src/config/manifest.json', 'utf-8')
) as IAppInfo

const currentHash: string = info.hash

// // find all manifest files
// const manifestFiles = files
//   .filter(
//     (f) =>
//       f.includes('manifest.json') && !f.includes('src/config/manifest.json')
//   )
//   .map((f) => {
//     const stats = fs.lstatSync(f)
//     return { f, mtime: stats.mtime } as { f: string; mtime: Date }
//   })
//   .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

// const manifestFile = manifestFiles[0]!

// console.log('Latest manifest file modification date:', manifestFile)

//console.log(info)
console.log(`Current hash: ${currentHash}`)
console.log(`New hash:     ${newHash}`)

if (newHash !== currentHash) {
  let build = info.build
  const currentVersion = info.version

  const v = currentVersion.split('.')

  let major = parseInt(v[0]!)
  let minor = parseInt(v[1]!)
  let patch = parseInt(v[2]!)

  console.log(`Current version: ${currentVersion}`)
  console.log(`Parsed version: major=${major}, minor=${minor}, patch=${patch}`)
  console.log(`Current build: ${build}`)

  //console.log(info)

  console.log(`Incrementing build from ${build} to ${build + INC}.`)
  build += INC

  if (build % 10 === 0) {
    console.log(`Build reached ${build}, incrementing patch to ${patch + INC}.`)
    patch += INC

    if (patch % 10 === 0) {
      console.log(
        `Patch reached ${patch}, incrementing minor to ${minor + INC}, resetting patch to 0.`
      )
      patch = 0
      minor += INC

      if (minor % 10 === 0) {
        console.log(
          `Minor reached ${minor}, incrementing major to ${major + INC}, resetting minor to 0.`
        )
        minor = 0
        major += INC
      }
    }
  }

  // update version and modified date to latest file modification date
  const newVersion = `${major}.${minor}.${patch}`
  //console.log(`New version: ${newVersion}`)
  info.version = newVersion
  info.build = build
  //info.updated = format(new Date(), 'LLL dd, yyyy')
  info.hash = newHash
  info.modified = new Date().toISOString()
  fs.writeFileSync('./src/config/manifest.json', JSON.stringify(info, null, 2))

  console.log()
  console.log(`---- Version Update ----`)
  console.log()
  console.log(info)
  console.log()
  console.log(`---- End Version Update ----`)
  console.log()
}
