<script setup lang="ts">
	import Header from 'components/Header.vue'
	import { ProxyAPIExample_v1 } from 'utils/ProxyAPIHelper/EndpointGenerator'

	if (BotInfo.isBot) {
		setMetaViewportTag('width=device-width, initial-scale=1')
	} else {
		setMetaViewportTag(
			'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
		)
	}

	const info: Ref<string> = ref(JSON.stringify(getAPIStore('/users')))
	fetch(
		ProxyAPIExample_v1.get(`/users?test=1&user=2`, {
			expiredTime: 10000,
			cacheKey: `/users`,
			enableStore: true,
			storeInDevice: DeviceInfo.type,
			relativeCacheKey: ['/users/1'],
		}),
		{
			method: 'GET',
			headers: new Headers({
				Accept: 'application/json',
				Author: 'admin',
			}),
			// body: JSON.stringify({ test: 1, user: 2 }),
		}
	).then(async (res) => {
		const text = await res.text()
		info.value = text
	})
</script>

<template>
	<div class="layout">
		<p style="margin-bottom: 16px">
			<code>{{ info }}</code>
		</p>
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
