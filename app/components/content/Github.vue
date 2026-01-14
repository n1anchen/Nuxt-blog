<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

interface GitHubRepo {
	name: string
	description: string
	owner: {
		login: string
		avatar_url: string
	}
	html_url: string
	license?: {
		name: string
	}
	stargazers_count: number
	language?: string
}

const props = defineProps<{
	repo: string
}>()

const loading = ref(true)
const error = ref<string | null>(null)
const repoData = ref<GitHubRepo | null>(null)

const ownerName = computed(() => repoData.value?.owner?.login ?? 'Unknown')
const repoName = computed(() => repoData.value?.name ?? 'Unknown')
const description = computed(() => repoData.value?.description ?? 'No description')
const license = computed(() => repoData.value?.license?.name ?? 'No License')
const avatar = computed(() => repoData.value?.owner?.avatar_url ?? '')
const repoUrl = computed(() => repoData.value?.html_url ?? '')
const stars = computed(() => repoData.value?.stargazers_count ?? 0)
const language = computed(() => repoData.value?.language ?? '')

async function fetchRepoData() {
	try {
		loading.value = true
		error.value = null

		const [owner, repo] = props.repo.split('/').filter(Boolean)
		if (!owner || !repo) {
			error.value = 'Invalid repository format. Use: owner/repo'
			loading.value = false
			return
		}

		const response = await fetch(`/api/github?repo=${owner}/${repo}`)

		if (!response.ok) {
			const statusCode = response.status
			if (statusCode === 404)
				error.value = 'Repository not found'
			else if (statusCode === 403)
				error.value = 'GitHub API rate limit exceeded. Please set GITHUB_TOKEN in .env'
			else
				error.value = `GitHub API error: ${statusCode}`

			loading.value = false
			return
		}

		const result = await response.json()
		repoData.value = result.data
	}
	catch (err) {
		error.value = err instanceof Error ? err.message : 'Failed to fetch repository data'
	}
	finally {
		loading.value = false
	}
}

onMounted(() => {
	fetchRepoData()
})
</script>

<template>
<UtilLink :to="repoUrl" class="github-card card" target="_blank" rel="noopener noreferrer">
	<div v-if="loading" class="github-card-loading">
		加载中...
	</div>

	<template v-else-if="error">
		<div class="github-card-info">
			<div class="github-card-title">
				{{ error }}
			</div>
		</div>
	</template>

	<template v-else>
		<Icon class="github-logo" name="ri:github-fill" />
		<div class="github-card-info">
			<div class="github-card-title">
				{{ ownerName }}/<strong>{{ repoName }}</strong>
			</div>
			<div class="github-card-description">
				{{ description }}
			</div>
			<div class="github-card-meta-container">
				<span v-if="language" class="github-card-meta">{{ language }}</span>
				<span class="github-card-meta">{{ license }}</span>
				<span class="github-card-meta">⭐ {{ stars }}</span>
			</div>
		</div>
		<UtilImg class="github-card-icon" :src="avatar" :alt="ownerName" />
	</template>
</UtilLink>
</template>

<style lang="scss" scoped>
.github-card {
	display: flex;
	align-items: center;
	gap: 1.2rem;
	padding: 1rem 1.2rem;
	font-size: 1em;
	line-height: 1.5;

	article & {
		width: 28rem;
		max-width: 90%;
		margin: 2rem auto;
	}

	.github-card-loading {
		padding: 1rem;
		text-align: center;
	}
}

.github-card-info {
	flex-grow: 1;
	overflow: hidden;
}

.github-card-title {
	display: -webkit-box;
	overflow: hidden;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	line-clamp: 2;
}

.github-card-description {
	overflow: hidden;
	opacity: 0.5;
	margin-top: 0.2em;
	font-size: 0.9em;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.github-card-meta-container {
	display: flex;
	gap: 2em;
	margin-top: 0.3em;
	font-size: 0.85em;
	opacity: 0.6;
}

.github-card-meta {
	white-space: nowrap;
}

.github-logo {
	flex-shrink: 0;
	width: 1.8rem;
	height: 1.8rem;
	opacity: 0.7;
}

.github-card-icon {
	flex-shrink: 0;
	height: 3.5rem;
	max-width: 5.5rem;
	border-radius: 0.5rem;
	object-fit: cover;
}
</style>
