<script setup lang="ts">
	import CommentSection from 'components/comment-page/CommentSection.vue'
	import CommentRow from 'components/comment-page/CommentRow.vue'
</script>

<template>
	<div class="comment-page">
		<div>
			<router-link
				:to="{
					name: ROUTER_HOME_NAME,
				}"
				>Back to HomePage</router-link
			>
		</div>
		<CommentSection>
			<CommentRow :total="7" />
		</CommentSection>
	</div>
</template>
