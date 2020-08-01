//@ts-check
const { getClient } = require('../db')

/**
 * @typedef {Object} SearchResult
 * @property {Array<any>} data
 * @property {number} count
 */

/**
 * @param {string} name
 * @param {string|number} offset
 * @param {string|number} limit
 * @param {string|number} trigramLimit
 * @returns {Promise<SearchResult>}
 * @throws an error if the pg query or connection fails
 */
const searchContributors = async (
  name,
  offset = 0,
  limit = 50,
  trigramLimit = 0.6
) => {
  let client = null
  try {
    client = await getClient()
    client.query('select set_limit($1)', [trigramLimit])
    const results = await client.query(
      `select *, similarity(name, $1) as sml 
      from contributors where name % $1 
      order by sml
      limit $2 offset $3`,
      [name, limit, offset]
    )
    return {
      data: results.rows,
      count: results.rowCount,
    }
  } catch (error) {
    console.error('error searching for contributor', error)
    throw error
  } finally {
    if (client !== null) {
      client.release()
    }
  }
}

module.exports = {
  searchContributors,
}