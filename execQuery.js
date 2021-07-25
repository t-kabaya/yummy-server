const pg = require('pg')
const env = require('./env')

const { Client } = pg
pg.defaults.ssl = true // sslで接続

exports.query = async (sql, data) => {
	const client = await new Client({
		host: env.host,
		user: env.user,
		database: env.database,
		password: env.password,
		port: env.port,
		// ローカルからherokuのpostgrelqlに接続するため自己証明書を有効にしている。
		// 御行儀がよくないため、時間がある時に修正する。
		ssl: { rejectUnauthorized: false }
	})

	try {
		await client.connect()
		const response = await client.query(sql, data)
		return response.rows
	} catch(e) {
		await client.query('ROLLBACK')
		throw new Error()
	} finally {
		client.end()
	}
}
