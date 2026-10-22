import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		reporters: ['minimal', 'github-actions'],
		outputFile: {
			junit: './test-results.xml',
		},
		coverage: {
			provider: 'v8',
			include: ['src/**/*.ts'],
			reporter: ['text','lcovonly'],
		},
		include: ['test/**/*.test.ts'],
	},
});
