import { lint } from '@dovenv/theme-pigeonposse'

const { dovenvEslintConfig } = lint

/** @type {import('eslint').Linter.Config[]} */
export default [
	dovenvEslintConfig.includeGitIgnore(),
	...dovenvEslintConfig.config,
	dovenvEslintConfig.setIgnoreConfig( [
		'./docs/**/*',
		'**/CHANGELOG.md',
		'**/examples/**/partials/*',
		'**/examples/**/templates/*',
	] ),

]
