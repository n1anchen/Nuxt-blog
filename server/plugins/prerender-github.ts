import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd, env } from 'node:process'

/**
 * Nitro 插件：在预渲染前预加载 GitHub 缓存
 * 这样在执行 pnpm generate 时，GitHub 卡片可以使用缓存数据
 */
export default defineNitroPlugin(async (_nitroApp) => {
	// 只在预渲染时运行
	if (!import.meta.prerender) {
		return
	}

	try {
		console.warn('[GitHub Cache] Checking GitHub cache for prerender...')

		// 检查缓存是否存在
		const CACHE_FILE = join(cwd(), '.cache', 'github-repos.json')
		let cacheExists = false
		try {
			readFileSync(CACHE_FILE, 'utf-8')
			cacheExists = true
			console.warn('[GitHub Cache] Existing cache found!')
		}
		catch {
			console.warn('[GitHub Cache] No cache found, will fetch from GitHub API...')
		}

		// 只有在没有 GITHUB_TOKEN 且缓存不存在时才警告
		if (!cacheExists && !env.GITHUB_TOKEN) {
			console.warn('[GitHub Cache] Warning: No cache and no GITHUB_TOKEN found.')
			console.warn('[GitHub Cache] Set GITHUB_TOKEN in .env or run "tsx scripts/fetch-github.ts" first.')
			console.warn('[GitHub Cache] GitHub cards may show "Repository not found" in static site.')
			return
		}

		// 如果缓存不存在或需要更新，预加载缓存
		if (!cacheExists) {
			console.warn('[GitHub Cache] Preloading GitHub repositories cache...')

			// 动态导入 fetch-github 脚本
			const { fetchGitHub } = await import('../../scripts/fetch-github')

			// 预加载缓存
			await fetchGitHub()

			console.warn('[GitHub Cache] Cache preload complete!')
		}
		else {
			console.warn('[GitHub Cache] Using existing cache for prerender.')
		}
	}
	catch (err) {
		// 如果预加载失败，只警告不中断构建
		console.warn('[GitHub Cache] Failed to preload cache:', err)
		console.warn('[GitHub Cache] GitHub cards may not display correctly in static site.')
	}
})
