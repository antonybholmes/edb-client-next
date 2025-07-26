import path from 'path'
import { getAllMarkdownFiles } from './markdown'

export const HELP_DIRECTORY = path.join(process.cwd(), 'content', 'help')

export function getHelpFiles(): string[] {
  return getAllMarkdownFiles(HELP_DIRECTORY)
}
