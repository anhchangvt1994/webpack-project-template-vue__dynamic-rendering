<template>
	<div class="content-loader__wrapper">
		<span class="content-loader"></span>
	</div>
</template>

<style lang="scss">
	.content-loader__wrapper {
		.content-loader {
			width: 12px;
			height: 12px;
			border-radius: 50%;
			background-color: #000;
			box-shadow: 24px 0 #000, -24px 0 #000;
			position: relative;
			animation: flash 0.5s ease-out infinite alternate;
		}
	}

	@keyframes flash {
		0% {
			background-color: #fff2;
			box-shadow: 24px 0 #fff2, -24px 0 #000;
		}
		50% {
			background-color: #000;
			box-shadow: 24px 0 #fff2, -24px 0 #fff2;
		}
		100% {
			background-color: #fff2;
			box-shadow: 24px 0 #000, -24px 0 #fff2;
		}
	}
</style>
