import {
	joinPath,
	downloadGitHubPath,
	existsDir,
	copyDir,
	removeDir,
	ensureDir,
	joinUrl,
} from '@dovenv/core/utils'

/**
 * Generates a URL to a path in a GitHub repository.
 * @param {string} userID - The GitHub user ID of the repository.
 * @param {string} repoID - The GitHub repository ID.
 * @param {string} path - The path to the asset in the repository.
 * @returns {string} The URL to the asset in the repository.
 */
export const getRepoUrl = ( userID, repoID, path ) =>
	joinUrl( `https://github.com/${userID}/${repoID}/tree/main`, path )

/**
 * Generates a URL to a path in a GitHub repository's main branch.
 * @param {string} userID - The GitHub user ID of the repository.
 * @param {string} repoID - The GitHub repository ID.
 * @param {string} path - The path to the asset in the repository.
 * @returns {string} The URL to the asset in the repository.
 */
export const getRepoRawUrl = ( userID, repoID, path ) =>
	joinUrl( `https://raw.githubusercontent.com/${userID}/${repoID}/refs/heads/main`, path )

/**
 * Trims a string to a maximum number of words and appends ellipsis (...) if the limit is exceeded.
 * @param {string} text - The input string to trim.
 * @param {number} [maxWords] - The maximum number of words allowed.
 * @returns {string} The trimmed string with ellipsis if necessary.
 */
export function trimToMaxWords( text, maxWords = 10 ) {

	const words = text.split( ' ' ) // Split the text into words
	if ( words.length <= maxWords ) return text
	return words.slice( 0, maxWords ).join( ' ' ) + '...' // Trim and append ellipsis

}

/**
 * Generates an object with templates to generate documentation for each repository.
 * @param {string} userID - The GitHub user ID of the repositories.
 * @param {string[]} repos - The GitHub repository IDs.
 * @returns {import('@dovenv/theme-pigeonposse').Config['templates']} An object where each key is a repository ID and the value is an object with the input and output paths of the template, as well as an optional hook to run after the template has been generated.
 */
export const getTemplates = ( userID, repos ) =>  repos.reduce( ( acc, repoId ) => {

	acc[repoId] = {
		input  : getRepoRawUrl( userID, repoId, 'README.md' ),
		output : `./docs/guide/${repoId}/index.md`,
		hook   : { after : async data => {

			await downloadGitHubPath( {
				input  : getRepoUrl( userID, repoId, 'docs' ),
				output : joinPath( data.const.workspaceDir, `./docs/guide/${repoId}/docs` ),
			} )

			const input   = joinPath( data.const.workspaceDir, `./docs/guide/${repoId}/docs/todo` )
			const output  = joinPath( data.const.workspaceDir, `./docs/guide/${repoId}/todo` )
			const todoDir = await existsDir( input )

			if ( todoDir ) {

				await ensureDir( output )
				await copyDir( {
					input,
					output,
				} )
				await removeDir( input )

			}

		} },
	}
	return acc

}, {} )

