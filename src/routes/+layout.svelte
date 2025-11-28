<main>
	<slot />
</main>

<style>
	:global(html)
	:global(body) {
		margin: 0;
		padding: 0;
		height: auto;
		overflow-y: auto;
		background-color: rgb(7, 36, 53);
		color: rgba(240, 248, 255, 0.952);
		scrollbar-width: none;
		scrollbar-color: rgba(240, 248, 255, 0.5) rgb(7, 36, 53);
	}


</style>