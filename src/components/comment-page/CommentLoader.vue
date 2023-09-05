<script setup lang="ts">
	import type { Ref } from 'vue'
	import ImageItem from 'components/ImageItem.vue'

	const props = withDefaults(
		defineProps<{ amount?: number; delay?: number }>(),
		{
			amount: 1,
			delay: 0,
		}
	)

	const isShow: Ref<boolean> = ref(false)

	if (props.delay === 0) {
		isShow.value = true
	} else {
		setTimeout(function () {
			isShow.value = true
		}, props.delay)
	}
</script>

<template>
	<template v-if="isShow">
		<div v-for="i in props.amount" :key="i" class="comment-loader-row">
			<div class="avatar-col">
				<ImageItem src="" />
			</div>
			<div class="meta-col">
				<p class="name-label"></p>
				<div class="content-label"></div>
				<div class="content-label"></div>
			</div>
		</div>
	</template>
	<!-- .comment-loader-row -->
</template>

<style lang="scss">
	.comment-loader-row {
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
			width: 25%;
			height: 14px;
			background: rgba($dark-color, 0.1);
			margin-bottom: 8px;
		}

		.content-label {
			width: 50%;
			height: 14px;
			margin-bottom: 4px;
			background: rgba($dark-color, 0.1);

			&:last-child {
				margin-bottom: 0;
			}

			&:nth-of-type(2) {
				width: 40%;
			}
		}
	}
</style>
