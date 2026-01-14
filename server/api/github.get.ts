import { getFromCache, saveToCache } from '../utils/github-cache'

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const repo = query.repo as string

	if (!repo) {
		throw createError({
			statusCode: 400,
			statusMessage: 'repo parameter is required',
		})
	}

	const [owner, repoName] = repo.split('/').filter(Boolean)
	if (!owner || !repoName) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid repo format. Use: owner/repo',
		})
	}

	// 尝试从缓存读取
	const cached = await getFromCache(repo)
	if (cached) {
		return {
			data: cached,
			fromCache: true,
		}
	}

	try {
		const config = useRuntimeConfig()
		const headers: Record<string, string> = {
			Accept: 'application/vnd.github.v3+json',
		}

		if (config.public.githubToken) {
			headers.Authorization = `token ${config.public.githubToken}`
		}

		const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
			headers,
		})

		if (!response.ok) {
			const statusMessage
				= response.status === 404
					? 'Repository not found'
					: response.status === 403
						? 'GitHub API rate limit exceeded'
						: `GitHub API error: ${response.status}`

			throw createError({
				statusCode: response.status,
				statusMessage,
			})
		}

		const data = await response.json()

		// 保存到缓存
		await saveToCache(repo, data)

		return {
			data,
			fromCache: false,
		}
	}
	catch (err: unknown) {
		if (typeof err === 'object' && err !== null && 'statusCode' in err) {
			throw err
		}

		throw createError({
			statusCode: 500,
			statusMessage: err instanceof Error ? err.message : 'Failed to fetch repository data',
		})
	}
})
