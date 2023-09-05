<script setup lang="ts">
	import type { Ref } from 'vue'
	const props = defineProps<{
		src?: string
		caption?: string
	}>()
	const ImageItemOuter: Ref<Element | null> = ref(null)

	function onErrorHandler() {
		if (ImageItemOuter) {
			ImageItemOuter.value?.classList.add('--is-error')
		}
	}
</script>

<template>
	<div ref="ImageItemOuter" class="image-item__outer">
		<img
			:src="props.src"
			:alt="props.caption"
			class="image-item"
			:onerror="onErrorHandler"
		/>
	</div>
</template>

<style lang="scss">
	.image-item__outer {
		height: 100px;
		width: 100%;
		background-color: #b5b3b21a;

		&.--is-error {
			background-image: url('/images/icons/image-loading-icon.png');
			background-position: center;
			background-size: 24px 24px;
			background-repeat: no-repeat;
			.image-item {
				display: none;
			}
		}
	}

	.image-item {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;

		&[src=''],
		&[src] {
			display: none;
		}

		// NOTE - css trick to hide alt text
		&:first {
			position: absolute;
			left: -9999px;
			top: -9999px;
			z-index: -100;
		}
	}
</style>
