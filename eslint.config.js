import { lint } from '@dovenv/theme-pigeonposse'

const conf = lint.dovenvEslintConfig

/** @type {import('eslint').Linter.Config[]} */
export default [
	conf.includeGitIgnore(),
	...conf.config,
	conf.setIgnoreConfig( [
		'./docs/**/*',
		'**/CHANGELOG.md',
		'**/examples/**/partials/*',
		'**/examples/**/templates/*',
	] ),

]
