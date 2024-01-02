<script setup lang="ts">
	import CommentLoader from 'components/comment-page/CommentLoader.vue'
</script>

<template>
	<Transition mode="out-in">
		<!-- <KeepAlive> -->
		<section class="comment-section">
			<Suspense :key="$route.fullPath">
				<slot></slot>
				<template #fallback>
					<CommentLoader :amount="3" :delay="0" />
				</template>
			</Suspense>
		</section>
		<!-- </KeepAlive> -->
	</Transition>
</template>

<style lang="scss">
	.comment-section {
		margin-top: 24px;
	}
</style>
