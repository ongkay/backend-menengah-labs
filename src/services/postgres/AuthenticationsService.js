const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')

class AuthenticationsService {
  constructor() {
    this._pool = new Pool()
  }

  async addRefreshToken(token) {
    const query = {
      // -lakukan kueri untuk memasukkan token (parameter) ke dalam tabel authentications
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    }

    await this._pool.query(query)
  }

  // Di dalam fungsi ini, lakukan kueri mendapatkan refresh token berdasarkan token yang dibawa oleh parameter.
  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Refresh token tidak valid')
    }
  }

  // Fungsi DeleteRefreshToken
  async deleteRefreshToken(token) {
    const query = {
      // -menghapus refresh token pada tabel authentications berdasarkan token yang dibawa di paramete
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    }
    await this._pool.query(query)
  }
}

module.exports = AuthenticationsService
// AuthenticationService ini akan bertanggung jawab dalam menangani pengelolaan data refresh token pada tabel authentications melalui fungsi-fungsi:
// 1. Memasukkan refresh token (addRefreshToken).
// 2. Memverifikasi atau memastikan refresh token ada di database (verifyRefreshToken).
// 3. Menghapus refresh token (deleteRefreshToken).
