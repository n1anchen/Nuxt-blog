import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'

const CACHE_DIR = join(cwd(), '.cache')
const GITHUB_CACHE_FILE = join(CACHE_DIR, 'github-repos.json')

interface CachedRepo {
	data: any
	timestamp: number
}

interface GitHubCache {
	[key: string]: CachedRepo
}

async function ensureCacheDir() {
	try {
		await fs.mkdir(CACHE_DIR, { recursive: true })
	}
	catch (err) {
		console.error('Failed to create cache directory:', err)
	}
}

async function readCache(): Promise<GitHubCache> {
	try {
		const content = await fs.readFile(GITHUB_CACHE_FILE, 'utf-8')
		return JSON.parse(content)
	}
	catch {
		return {}
	}
}

async function writeCache(cache: GitHubCache) {
	try {
		await ensureCacheDir()
		await fs.writeFile(GITHUB_CACHE_FILE, JSON.stringify(cache, null, 2))
	}
	catch (err) {
		console.error('Failed to write cache:', err)
	}
}

export async function saveToCache(repoKey: string, data: any) {
	const cache = await readCache()
	cache[repoKey] = {
		data,
		timestamp: Date.now(),
	}
	await writeCache(cache)
}
