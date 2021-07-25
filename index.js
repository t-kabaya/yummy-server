const pg = require('pg')
const env = require('./env')

const { Client } = pg
pg.defaults.ssl = true // sslで接続

exports.execQuery = async (req, res) => {
	const sql = req.query.sql
	const data = JSON.parse(req.query.data) // やや危険な実装。
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
		res.status(200).send(response.rows)
	} catch(e) {
		await client.query('ROLLBACK')
		res.status(500).send(null)
	} finally {
		client.end()
	}
}
