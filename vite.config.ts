import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		headers: {
			'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
		}
	}
});
