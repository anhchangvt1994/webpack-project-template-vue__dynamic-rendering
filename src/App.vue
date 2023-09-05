<script setup>
	import { SeoTagHandler } from 'utils/SeoTagHandler'
	import Header from 'components/Header.vue'

	SeoTagHandler.setup({
		title: 'Xác nhận thông tin',
		description: 'Xác nhận thông tin đặt phòng',
		'og:type': 'website',
		'og:title': 'Xác nhận thông tin',
		'og:description': 'Xác nhận thông tin đặt phòng',
		'og:url': window.location.pathname,
		'og:site_name': 'Go2Joy',
		'og:image': '',
		'og:image:width': '1200',
		'og:image:height': '628',
	})
</script>

<template>
	<div class="layout">
		<div class="main-container">
			<Header />
			<RouterView v-slot="{ Component }">
				<template v-if="Component">
					<Suspense>
						<component :is="Component"></component>
					</Suspense>
				</template>
			</RouterView>
		</div>
		<!-- .main-container -->
	</div>
	<!-- .layout -->
</template>

<style lang="scss">
	.main-container {
		max-width: 1280px;
		min-width: 0;
		min-height: 100vh;
		overflow: hidden;
		padding: 16px;
		margin: 0 auto;
	}
</style>
