
import { defineConfig } from '@dovenv/core'
import {
	yaml,
	getObjectFrom,
} from '@dovenv/core/utils'
import pigeonposseTheme, { getWorkspaceConfig } from '@dovenv/theme-pigeonposse'

import {
	getRepoRawUrl,
	getTemplates,
	trimToMaxWords,
} from './utils.js'

const core = await getWorkspaceConfig( {
	metaURL : import.meta.url,
	path    : '../',
} )

const pkg       = core.pkg
const ghUserID  = pkg.extra.collective.id
const name      = pkg.extra.productName || pkg.name
const libraries = pkg.extra.libraries

export default defineConfig(
	{ const: { libraries } },
	pigeonposseTheme( {
		core : core,
		web  : { values : {
			type     : 'documentation',
			subtypes : [ 'ai', 'toolkit' ],
		} },
		lint : { staged: { '*.{js,cjs,mjs,jsx,ts,cts,mts,tsx,json,yml,yaml}': 'dovenv lint eslint --silent' } },
		docs : async () => {

			const sidebar = [
				{
					text  : 'Introduction',
					items : [
						{
							text : `What is ${name}?`,
							link : `/guide/`,
						},
					],
				},
				{
					text  : 'Projects',
					items : libraries.map( l => ( {
						text : l.icon + ' ' + l.id,
						link : `/guide/${l.id}/`,
					} ) ),
				},
			]

			return {
				css : `
.vp-doc p:has( > a) {
    display: flex;
    gap: 10px;
}
.image-bg {
	opacity: 0.3 !important;
}
				`,

				favicon      : '/favicon.png',
				logo         : '/logo.png',
				changelogURL : false,
				npmURL       : false,
				sidebar      : {
					'/guide/'       : sidebar,
					'/todo/'        : sidebar,
					'/contributors' : sidebar,
				},
				autoSidebar : {
					reference : false,
					intro     : false,
				},
				vitepress : { ignoreDeadLinks: true },
			}

		},
		templates : {
			...getTemplates( ghUserID, libraries.map( l => l.id ) ),
			'docs-guide-index' : {
				input : `# What is ${name}?
${pkg.description}

## View more

{{const.docsGuideIndex}}
<!-- {{const.templateMark}} -->
`,
				output : './docs/guide/index.md',
				hook   : { before : async data => {

					let res = ''
					for ( const lib of data.const.libraries ) {

						const libPkg  = await getObjectFrom( getRepoRawUrl( ghUserID, lib.id, 'package.json' ) )
						const libName = libPkg.extra.productName || libPkg.name
						res          += `- ${lib.icon} [${libName}](./${lib.id}/index.md)\n`

					}

					data.const.docsGuideIndex = res

				} },
			},
			'docs-index' : {
				input : `---
{{const.templateMark}}

{{const.docsIndex}}
---
`,
				output : './docs/index.md',
				hook   : { before : async data => {

					const { pkg }      = data.const
					const layoutConfig = {
						layout : 'home',
						hero   : {
							name    : name,
							tagline : pkg.extra.shortDesc,
							text    : pkg.extra.action,
							image   : {
								src : '/logo.png',
								alt : name,
							},
						},
						features : [],
					}
					for ( const lib of data.const.libraries ) {

						const libPkg = await getObjectFrom( getRepoRawUrl( ghUserID, lib.id, 'package.json' ) )

						layoutConfig.features.push( {
							title   : libPkg.extra.productName || libPkg.name,
							icon    : lib.icon,
							details : trimToMaxWords( libPkg.description, 12 ),
							link    : `/guide/${lib.id}`,
						} )

					}
					layoutConfig.features.push( {
						title   : 'Repository',
						icon    : '🧑‍💻',
						details : 'View project on GitHub',
						link    : core.pkg.repository.url,
					} )
					data.const.docsIndex = yaml.serialize( layoutConfig )

					return data

				} },
			},
		},
	} ),
)

