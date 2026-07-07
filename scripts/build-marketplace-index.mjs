#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.argv[2] || process.cwd()
const stagesDir = join(root, 'stages')
const outPath = join(root, 'index.json')
const validationStates = new Set(['validated', 'unvalidated', 'error'])

async function* walk(dir) {
  let entries = []
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return
    throw error
  }
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else if (entry.isFile() && entry.name.endsWith('.json')) yield path
  }
}

function requireField(entry, field, file) {
  if (entry[field] === undefined || entry[field] === null || entry[field] === '') {
    throw new Error(`${file}: missing ${field}`)
  }
}

function validateEntry(entry, file) {
  if (entry.marketplaceVersion !== 1) throw new Error(`${file}: marketplaceVersion must be 1`)
  for (const field of ['repoOwner', 'repoName', 'repoUrl', 'defaultBranch', 'commitSha', 'title', 'author', 'badges', 'publishedAt', 'updatedAt']) {
    requireField(entry, field, file)
  }
  if (!entry.repoName.startsWith('fossbot-')) throw new Error(`${file}: repoName must start with fossbot-`)
  if (!Array.isArray(entry.tags)) throw new Error(`${file}: tags must be an array`)
  if (!validationStates.has(entry.badges?.validation)) throw new Error(`${file}: invalid badges.validation`)
}

const stageFiles = []
for await (const file of walk(stagesDir)) stageFiles.push(file)
stageFiles.sort()

const stages = []
for (const file of stageFiles) {
  const entry = JSON.parse(await readFile(file, 'utf8'))
  validateEntry(entry, file)
  stages.push(entry)
}

stages.sort((a, b) => {
  const updated = String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))
  if (updated) return updated
  return `${a.repoOwner}/${a.repoName}`.localeCompare(`${b.repoOwner}/${b.repoName}`)
})

const index = {
  generatedAt: new Date().toISOString(),
  schemaVersion: 1,
  stages,
}

await writeFile(outPath, `${JSON.stringify(index, null, 2)}\n`)
console.log(`Wrote ${outPath} with ${stages.length} stage${stages.length === 1 ? '' : 's'}`)
