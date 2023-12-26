import { promises as fsp } from 'node:fs'

// TODO: swap out when https://github.com/lodash/lodash/pull/5649 is merged
import { template as lodashTemplate } from 'lodash-es'
import { genDynamicImport, genImport, genSafeVariableName } from 'knitwork'

import type { NuxtTemplate } from '@nuxt/schema'
import { logger } from '../logger'

/** @deprecated */
// TODO: Remove support for compiling ejs templates in v4
export async function compileTemplate (template: NuxtTemplate, context: any) {
  const data = { ...context, options: template.options }

  if (template.src) {
    try {
      const sourceContents = await fsp.readFile(template.src, 'utf8')

        return lodashTemplate(sourceContents, {})(data)
    } catch (error) {
      logger.error('Error compiling template: ', template)

      throw error
    }
  }

  if (template.getContents) {
    return template.getContents(data)
  }

  throw new Error('Invalid template: ' + JSON.stringify(template))
}

/** @deprecated */
const serialize = (data: any) => JSON
  .stringify(data, undefined, 2)
  .replaceAll(
    /"{(.+)}"(?=,?$)/gm,
    (r) => JSON.parse(r).replace(/^{(.*)}$/, '$1')
  )

/** @deprecated */
const importSources = (sources: string | string[], { lazy = false } = {}) => {
  if (!Array.isArray(sources)) {
    sources = [sources]
  }

  return sources.map((source) => {
    if (lazy) {
      return `const ${genSafeVariableName(source)} = ${genDynamicImport(source, { comment: `webpackChunkName: ${JSON.stringify(source)}` })}`
    }

    return genImport(source, genSafeVariableName(source))
  }).join('\n')
}

/** @deprecated */
const importName = genSafeVariableName

/** @deprecated */
export const templateUtils = { serialize, importName, importSources }
