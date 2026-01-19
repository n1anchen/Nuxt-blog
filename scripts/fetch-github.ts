import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { argv, cwd, env, exit } from 'node:process'
/**
 * 构建时预加载 GitHub 仓库信息缓存
 * 使用: npx tsx scripts/fetch-github.ts
 */
import { config as dotenvConfig } from 'dotenv'
import { saveToCache } from './utils-server.ts'

async function preloadGitHubCache() {
	try {
		// 加载 .env 文件（如果环境变量已存在则不会覆盖，适合云构建场景）
		dotenvConfig()

		// 读取 example.md 找出所有使用的 GitHub 仓库
		const examplePath = join(cwd?.() ?? '.', 'content/previews/example.md')
		const content = readFileSync(examplePath, 'utf-8')

		// 解析 ::github 组件中的 repo 属性
		const repos = new Set<string>()
		const lines = content.split('\n')

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]
			if (line.includes('::github')) {
				// 查找 repo: 行
				for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
					const repoLine = lines[j]
					if (repoLine.includes('repo:')) {
						const match = repoLine.match(/repo:\s*(\S+)/)
						if (match && match[1]) {
							const repo = match[1].trim()
							if (repo && !repo.includes('\n') && repo.includes('/')) {
								repos.add(repo)
							}
						}
						break
					}
				}
			}
		}

		if (repos.size === 0) {
			console.log('No GitHub repositories found in content')
			return
		}

		console.log(`Found ${repos.size} repositories. Preloading cache...`)

		const token = env.GITHUB_TOKEN
		const headers: Record<string, string> = {
			Accept: 'application/vnd.github.v3+json',
		}

		if (token) {
			headers.Authorization = `token ${token}`
		}

		for (const repo of repos) {
			try {
				console.log(`Fetching ${repo}...`)
				const response = await fetch(`https://api.github.com/repos/${repo}`, {
					headers,
				})

				if (!response.ok) {
					console.warn(`Failed to fetch ${repo}: ${response.status}`)
					continue
				}

				const data = await response.json()
				await saveToCache(repo, data)
				console.log(`✓ Cached ${repo}`)
			}
			catch (err) {
				console.error(`Error fetching ${repo}:`, err)
			}
		}

		console.log('Cache preload complete!')
	}
	catch (err) {
		console.error('Failed to preload cache:', err)
		exit(1)
	}
}

// 导出供直接调用
export { preloadGitHubCache }

// 如果直接运行此文件
if (argv[1]?.endsWith('preload-github-cache.ts')) {
	preloadGitHubCache().catch(console.error)
}
