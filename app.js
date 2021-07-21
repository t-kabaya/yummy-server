import pg from 'pg'

const { Client } = pg
pg.defaults.ssl = true // sslで接続

export const query = async (sql: string, data: any[]=[]) => {
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
		const response = await client.query(sql, data)
		return response.rows
	} catch(e) {
		console.error(e)
		return null
	} finally {
		client.end() // なぜclient.endの代わりにclient.releaseを使用した方が良いかまだ調べていない。
	}
}
