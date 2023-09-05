<script setup lang="ts">
	import { UserInfoState } from 'store/UserStore'
	import ImageItem from 'components/ImageItem.vue'

	const route = useRoute()

	const onClickLogin = () => {
		UserInfoState.email = 'abc@gmail.com'
		route.meta.reProtect?.()
	}
</script>

<template>
	<div class="login-page">
		<div>
			<router-link
				:to="{
					name: 'HomePage',
				}"
				>Back to HomePage</router-link
			>
		</div>
		<section class="login-section">
			<div class="login-block">
				<div class="login-avatar">
					<ImageItem src="" />
				</div>
				<button class="login-btn" @click="onClickLogin">Login</button>
			</div>
			<!-- .login-block -->
		</section>
		<!-- .login-section -->
	</div>
	<!-- .login-page -->
</template>

<style lang="scss">
	.login-section {
		height: 100vh;
	}

	.login-block {
		display: flex;
		flex-wrap: wrap;
		position: relative;
		max-width: 320px;
		top: 40%;
		left: 50%;
		transform: translate(-50%, -50%);
		justify-content: center;
	}

	.login-avatar {
		height: 100px;
		width: 100px;
		border-radius: 50%;
		overflow: hidden;
		margin: 0 auto;
	}

	.login-btn {
		width: 75%;
		margin-top: 16px;
	}
</style>
