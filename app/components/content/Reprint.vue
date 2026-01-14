<script setup lang="ts">
defineProps<{
	author?: string
	link?: string
	license?: string
	licenseLink?: string
}>()
</script>

<template>
<div class="reprint">
	<div class="reprint-icon">
		<Icon name="ph:share-network-bold" />
	</div>
	<div class="reprint-content">
		<p class="reprint-title">
			转载声明
		</p>
		<div class="reprint-info">
			<p v-if="author" class="reprint-item">
				<strong>原作者：</strong>
				<span>{{ author }}</span>
			</p>
			<p v-if="link" class="reprint-item">
				<strong>原文链接：</strong>
				<a :href="link" target="_blank" rel="noopener">{{ link }}</a>
			</p>
			<p v-if="license || licenseLink" class="reprint-item">
				<strong>使用协议：</strong>
				<span v-if="licenseLink">
					<a :href="licenseLink" target="_blank" rel="noopener">{{ license }}</a>
				</span>
				<span v-else>{{ license }}</span>
			</p>
		</div>
	</div>
</div>
</template>

<style lang="scss" scoped>
.reprint {
	--c-reprint: var(--c-accent);

	position: relative;
	display: flex;
	gap: 1rem;
	margin: 1.5em 0;
	padding: 1em 1.25em;
	border-radius: 0.75em;
	background-color: var(--ld-bg-card);
	overflow: hidden;
	transition: box-shadow 0.3s, transform 0.3s;

	@supports (color: color-mix(in srgb, transparent, transparent)) {
		--c-reprint-soft: color-mix(in srgb, var(--c-reprint) 12%, transparent);
		background-color: color-mix(in srgb, var(--c-reprint) 6%, var(--ld-bg-card));
	}

	// 装饰性渐变背景
	&::before {
		content: '';
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 0 0, var(--c-reprint-soft, rgba(var(--c-accent), 0.1)), transparent 50%),
			linear-gradient(135deg, var(--c-reprint-soft, transparent) 0%, transparent 60%);
		pointer-events: none;
		opacity: 0.8;
	}

	&:hover {
		box-shadow: 0 4px 20px -4px color-mix(in srgb, var(--c-reprint) 20%, transparent);
		transform: translateY(-1px);
	}

	.reprint-icon {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5em;
		height: 2.5em;
		color: var(--c-reprint);
		background: var(--c-reprint-soft, rgba(var(--c-accent), 0.1));
		border-radius: 50%;
		flex-shrink: 0;
		transition: transform 0.3s, background 0.3s;

		:deep(svg) {
			width: 1.25em;
			height: 1.25em;
		}
	}

	&:hover .reprint-icon {
		transform: rotate(-10deg) scale(1.05);
		background: color-mix(in srgb, var(--c-reprint) 20%, transparent);
	}

	.reprint-content {
		position: relative;
		z-index: 1;
		flex: 1;
		min-width: 0;

		.reprint-title {
			margin: 0 0 0.75em 0;
			font-size: 1.05em;
			font-weight: 600;
			color: var(--c-reprint);
			letter-spacing: 0.02em;
		}

		.reprint-info {
			display: flex;
			flex-direction: column;
			gap: 0.6em;
			font-size: 0.9em;

			.reprint-item {
				display: flex;
				flex-wrap: wrap;
				align-items: baseline;
				gap: 0.25em;
				margin: 0;
				color: var(--c-text-2);
				line-height: 1.6;

				strong {
					color: var(--c-text-1);
					font-weight: 500;
					white-space: nowrap;
				}

				a {
					color: var(--c-reprint);
					text-decoration: none;
					word-break: break-all;
					background: linear-gradient(var(--c-reprint), var(--c-reprint)) no-repeat 0 100%;
					background-size: 100% 1px;
					padding-bottom: 1px;
					transition: background-size 0.25s ease, color 0.25s;

					&:hover {
						background-size: 100% 2px;
						color: color-mix(in srgb, var(--c-reprint) 80%, var(--c-text-1));
					}
				}
			}
		}
	}
}

@media (max-width: $breakpoint-mobile) {
	.reprint {
		gap: 0.75rem;
		padding: 0.875em 1em;

		.reprint-icon {
			width: 2em;
			height: 2em;

			:deep(svg) {
				width: 1em;
				height: 1em;
			}
		}

		.reprint-content {
			.reprint-title {
				font-size: 0.95em;
				margin-bottom: 0.5em;
			}

			.reprint-info {
				font-size: 0.85em;
				gap: 0.5em;
			}
		}
	}
}
</style>
