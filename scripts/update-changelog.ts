// update-changelog.js
import fs from 'fs'

const args = process.argv.slice(2) // Skip first two: node and script name

console.log('Arguments:', args)

const msg = args[0]!
const type = args[1]!

const now = new Date()

// read version file
const info = JSON.parse(fs.readFileSync('./version.json', 'utf-8'))

let [major, minor, patch, build] = info.version.split('.')
major = parseInt(major)
minor = parseInt(minor)
patch = parseInt(patch)
build = parseInt(build)

const version = `${major}.${minor}`

const changelogFile = 'changelog.json'

// Get latest commit info
// const commitHash = execSync('git rev-parse HEAD').toString().trim()
// const commitMessage = execSync('git log -1 --pretty=%B').toString().trim()
// const author = execSync('git log -1 --pretty=%an').toString().trim()
// const date = execSync('git log -1 --pretty=%ad').toString().trim()

// Read existing changelog or start a new one
let changelog = []
if (fs.existsSync(changelogFile)) {
  const content = fs.readFileSync(changelogFile, 'utf8')
  try {
    changelog = JSON.parse(content)

    // cache the version before we update it
    fs.writeFileSync('changelog.json.old', JSON.stringify(changelog, null, 2))
  } catch (e) {
    console.error('Error parsing changelog.json:', e)
  }
}

if (
  changelog.length === 0 ||
  changelog[changelog.length - 1].version !== version
) {
  // Add new entry
  changelog.push({
    version,
    messages: {},
    author: 'Antony Holmes',
    date: now,
  })
}

if (!changelog[changelog.length - 1].messages[type]) {
  changelog[changelog.length - 1].messages[type] = []
}

// don't add duplicate messages
if (
  changelog[changelog.length - 1].messages[type][
    changelog[changelog.length - 1].messages[type].length - 1
  ]?.msg !== msg
) {
  changelog[changelog.length - 1].messages[type].push({
    msg,
    date: now,
  })
}

// Save changelog
fs.writeFileSync(changelogFile, JSON.stringify(changelog, null, 2))
console.log('✅ changelog.json updated')

// create markdown

// const TYPES = ['Added', 'Changed', 'Deprecated', 'Fixed', 'Removed', 'Security']

// let markdown = '# Changelog\n\n'

// for (const entry of changelog.toReversed()) {
//   markdown += `## ${entry.version}\n\n`

//   for (const type of TYPES) {
//     if (entry.messages[type]) {
//       markdown += `### ${type}\n\n`
//       for (const message of entry.messages[type].toReversed()) {
//         markdown += `- ${message.msg}${message.msg.endsWith('.') ? '' : '.'}\n`
//       }
//       markdown += `\n`
//     }
//   }

//   markdown += `\n`
// }

// fs.writeFileSync('CHANGELOG.md', markdown.trim() + '\n')

// console.log('✅ CHANGELOG.md generated')
