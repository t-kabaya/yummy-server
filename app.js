const express = require('express')
const pg = require('pg')

const { Client } = pg
pg.defaults.ssl = true // sslで接続

const app = express()

// queryを投げるだけなので、全てgetで大丈夫かな？
app.get('/', async (req, res) => {
	const client = await new Client({
		host: 'ec2-35-171-250-21.compute-1.amazonaws.com',
		user: 'yrukxmdgnsxqlw',
		database: 'd2uuqa38bme5q9',
		password: '4f08f2cb878b021a31494040159fb41732d32b652268604b646f480fdc6de57b',
		port: 5432,
		// ローカルからherokuのpostgrelqlに接続するため自己証明書を有効にしている。
		// 御行儀がよくないため、時間がある時に修正する。
		ssl: { rejectUnauthorized: false }
	})
	try {
		await client.connect()

		const param = req.query
		const sql = param.sql
		const data = eval(param.data) // TODO: めちゃくちゃ危険な実装なので、修正したい。
		const response = await client.query(sql, data)

		res
		.status(200)
		.set('Content-Type', 'text/plain')
		.send(response.rows)
		.end()
	} catch {
		res.status(500)
		.set('Content-Type', 'text/plain')
		.send(null)
		.end()
	} finally {
		client.end() // なぜclient.endの代わりにclient.releaseを使用した方が良いかまだ調べていない。
	}
})

const port = 8080
app.listen(port)