<script setup lang="ts">
	import ImageItem from 'components/ImageItem.vue'

	const route = useRoute()

	const props = defineProps<{
		total?: number
	}>()

	await new Promise((res) => {
		const duration = Math.floor(Math.random() * 10) * 100
		setTimeout(function () {
			res('OK')
		}, duration)
	})

	const amount = props.total || Math.floor(Math.random() * 4) + 1
</script>

<template>
	<div v-for="i in amount" :key="i" class="comment-row">
		<div class="avatar-col">
			<ImageItem src="" />
		</div>
		<div class="meta-col">
			<p class="name-label">
				Proident consectetur deserunt officia consectetur ad aliqua do excepteur
				sit.
			</p>
			<div class="content-label">
				Excepteur reprehenderit minim officia anim occaecat nostrud nulla elit.
				Excepteur officia fugiat nisi anim enim quis proident consectetur
				exercitation. Consequat eu ea enim ullamco. Amet elit ad sit ipsum magna
				consequat exercitation consectetur ullamco.
			</div>
		</div>
	</div>

	<router-link
		v-if="route.name !== ROUTER_COMMENT_NAME"
		:to="{
			name: ROUTER_COMMENT_NAME,
			params: route.params,
		}"
		>See more</router-link
	>
	<!-- .comment-loader-row -->
</template>

<style lang="scss">
	.comment-row {
		display: flex;
		margin-bottom: 24px;

		&:last-child {
			margin-bottom: 0;
		}

		.avatar-col {
			margin-right: 8px;
			flex: 0 0 50px;
			height: 50px;

			.image-item__outer {
				height: 100%;
				width: 100%;
				overflow: hidden;
				border-radius: 50%;
				background-color: rgba($dark-color, 0.1);
				background-size: 16px 16px;
			}
		}

		.meta-col {
			min-width: 0;
			flex: 1 1 auto;
		}

		.name-label {
			margin-bottom: 8px;
		}
	}
</style>
