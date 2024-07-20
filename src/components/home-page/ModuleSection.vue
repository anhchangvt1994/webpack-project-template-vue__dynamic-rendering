<script setup lang="ts">
	import ImageItem from 'components/ImageItem.vue'
	const moduleList: Array<{
		title: string
		id: number
	}> = [
		{
			title: 'Excepteur nostrud deserunt do ipsum eu dolore.',
			id: 1,
		},
		{
			title:
				'Ex Lorem commodo nisi et qui adipisicing consectetur magna duis enim pariatur eu.',
			id: 2,
		},
		{
			title: 'Dolor in voluptate anim magna.',
			id: 3,
		},
		{
			title:
				'Eiusmod exercitation sint adipisicing magna sit dolore adipisicing.',
			id: 4,
		},
	]
</script>

<template>
	<section class="module-section">
		<div class="grid grid-cols-3 gap-16">
			<input type="button" value="click input" />
			<button>click button</button>
			<a>nofollow</a>
			<router-link
				v-for="item in moduleList"
				:key="item.title"
				:to="{
					name: ROUTER_CONTENT_NAME,
					params: {
						id: item.id,
						title: getSlug(item.title),
					},
				}"
			>
				<div class="module-card">
					<ImageItem src="sadfasdf" :caption="item.title" />
					<div v-if="BotInfo.isBot" class="module-card__title">
						{{ item.title }}
					</div>
					<!-- .module-card__title -->
					<!-- .module-card__image-outer -->
				</div>
			</router-link>
		</div>
	</section>
	<!-- .module-section -->
</template>

<style lang="scss">
	.module-card {
		.image-item__outer {
			border-radius: 8px;
			border: 1px solid $dark-color;
		}

		&__title {
			color: $dark-color;
			text-decoration: none;
			max-width: 100%;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			margin-top: 8px;
		}
	}
</style>
