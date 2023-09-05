<script setup lang="ts">
	import ImageItem from 'components/ImageItem.vue'
	const props = defineProps<{
		caption: string
		content: string
	}>()
</script>

<template>
	<section class="module-content-section">
		<ImageItem src="" :caption="props.caption" />
		<div class="caption-row">{{ props.caption }}</div>
		<div class="content-block">
			{{ props.content }}
		</div>
	</section>
	<!-- .module-content-section -->
</template>

<style lang="scss">
	.module-content-section {
		.image-item__outer {
			height: 200px;
			max-width: 320px;
			margin: 0 auto;
			border: 1px solid $dark-color;
		}

		.caption-row {
			font-size: 12px;
			color: rgba($dark-color, 0.5);
			margin-top: 8px;
		}

		.content-block {
			margin-top: 16px;
		}
	}
</style>
