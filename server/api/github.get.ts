/**
 * GitHub 仓库信息 API
 * 代理 GitHub API，解决 CORS 和 Token 问题
 * 使用 cachedEventHandler 在开发环境缓存响应，避免频繁请求触发速率限制
 * Nuxt SSG 会自动将 useAsyncData 的结果序列化到静态 HTML 中
 */
export default defineCachedEventHandler(async (event) => {
	const { repo } = getQuery(event)

	if (!repo || typeof repo !== 'string') {
		throw createError({ statusCode: 400, statusMessage: 'repo parameter is required' })
	}

	if (!repo.includes('/') || repo.split('/').filter(Boolean).length !== 2) {
		throw createError({ statusCode: 400, statusMessage: 'Invalid repo format. Use: owner/repo' })
	}

	const config = useRuntimeConfig()
	const headers: Record<string, string> = {
		'Accept': 'application/vnd.github.v3+json',
		'User-Agent': 'Nuxt-Blog',
	}

	if (config.githubToken) {
		headers.Authorization = `token ${config.githubToken}`
	}

	const response = await fetch(`https://api.github.com/repos/${repo}`, { headers })

	if (!response.ok) {
		throw createError({
			statusCode: response.status,
			statusMessage: response.status === 404
				? 'Repository not found'
				: response.status === 403
					? 'GitHub API rate limit exceeded'
					: `GitHub API error: ${response.status}`,
		})
	}

	return { data: await response.json() }
}, {
	// 缓存 1 小时，开发时避免频繁请求
	maxAge: 60 * 60,
	// 使用 repo 参数作为缓存 key
	getKey: event => `github:${getQuery(event).repo}`,
})
