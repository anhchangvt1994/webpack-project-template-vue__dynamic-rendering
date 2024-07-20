<script setup>
	import { UserInfoState } from 'app/store/UserStore'

	const router = useRoute()
</script>

<template>
	<header class="header">
		<div class="header-left">
			<router-link
				:to="{
					name: router.name,
					params: {
						...router.params,
						locale: 'en-us',
					},
				}"
			>
				EN
			</router-link>
			|
			<router-link
				:to="{
					name: router.name,
					params: {
						...router.params,
						locale: 'vi-vn',
					},
				}"
			>
				VI
			</router-link>
		</div>
		<div v-if="UserInfoState.email" class="header-right">
			<span>{{ UserInfoState.email }}</span> |
			<span
				style="cursor: pointer"
				@click="
					() => {
						UserInfoState.email = ''
						$route.meta.reProtect?.()
					}
				"
				>Logout</span
			>
		</div>
		<router-link v-else :to="{ name: ROUTER_LOGIN_NAME }"> Login </router-link>
	</header>
</template>

<style lang="scss">
	.header {
		text-align: right;
		padding: 16px;
	}
</style>
