const pg = require('pg')
const pgp = require("pg-promise")()
const env = require('./env')
const { query } = require('./execQuery')

pgp.pg.defaults.ssl = {
	rejectUnauthorized: false // 自己証明書を有効に変更
}


exports.execQuery = async (req, res) => {
	const sql = req.query.sql
	const data = JSON.parse(req.query.data) // やや危険な実装。

	const client = pgp({
		host: env.host,
		user: env.user,
		database: env.database,
		password: env.password,
		port: env.port,
	})
	try {
		await client.connect()
		const response = await client.any(sql, data)
		res.status(200).send(response.rows)
	} catch(e) {
		res.status(500).send(null)
	} finally {
		client.end()
	}
}

exports.maybeInitUser = async(req, res) => {
	try {
		const uid = req.query.uid
		if (uid === undefined) {
			throw new Error()
		}
		const userName = 'No Name'
		const icon = ''
		const selectSql = 'SELECT * FROM users SET WHERE uid = $1;'
		const user = await query(selectSql, [uid])

		if (user.length === 0) { // 同じuidのユーザーが存在しなければユーザーを初期化する。
			const initUserSql = 'INSERT INTO users (uid, user_name, icon) VALUES ($1, $2, $3) RETURNING *;'
			const initializedUser = await query(initUserSql, [uid, userName, icon])
			res.status(200).send(initializedUser.rows)
		}
	} catch {
		internalError(res)
	}
}

const internalError = (res) => res.status(500).send(null)
