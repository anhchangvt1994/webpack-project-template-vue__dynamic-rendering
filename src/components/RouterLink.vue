<script setup lang="ts">
	import { RouteLocationRaw, RouterLinkProps, RouterLink } from 'vue-router'

	interface ILinkProps extends RouterLinkProps {
		to: RouteLocationRaw & { params: Record<string, any> }
		class?: string
	}

	const props = defineProps<ILinkProps>()

	if (props.to.params?.locale) {
		const arrLocale = props.to.params.locale.split('-')
		props.to.params.locale = getLocale(arrLocale[0], arrLocale[1])
	} else {
		props.to.params = {
			...props.to.params,
			locale: getLocale(LocaleState.lang, LocaleState.country),
		}
	}
</script>

<template>
	<router-link v-bind="props" v-slot="{ isActive, href, navigate }" custom>
		<a
			:href="href"
			:class="`${props.class ? props.class : ''}${
				isActive ? ' --is-active ' : ''
			}`"
			@click="navigate"
		>
			<slot />
		</a>
	</router-link>
</template>
