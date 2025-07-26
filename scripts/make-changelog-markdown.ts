// update-changelog.js
import * as datefns from 'date-fns'
import fs from 'fs'

// read version file
const changelog = JSON.parse(fs.readFileSync('./changelog.json', 'utf-8'))

// create markdown

const TYPES = ['Added', 'Changed', 'Deprecated', 'Fixed', 'Removed', 'Security']

let markdown = '# Changelog\n\n'

for (const entry of changelog.toReversed()) {
  markdown += `## ${entry.version} (${datefns.format(entry.date, 'MMM, yyyy')})\n\n`

  for (const type of TYPES) {
    if (entry.messages[type]) {
      markdown += `### ${type}\n\n`
      for (const message of entry.messages[type].toReversed()) {
        markdown += `- ${message.msg}${message.msg.endsWith('.') ? '' : '.'}\n`
      }
      markdown += `\n`
    }
  }

  markdown += `\n`
}

fs.writeFileSync('CHANGELOG.md', markdown.trim() + '\n')

console.log('✅ CHANGELOG.md generated')
