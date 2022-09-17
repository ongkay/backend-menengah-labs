const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')

class AuthenticationsService {
  constructor() {
    this._pool = new Pool()
  }

  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    }

    await this._pool.query(query)
  }

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

  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    }
    await this._pool.query(query)
  }
}

module.exports = AuthenticationsService

// AuthenticationService ini akan bertanggung jawab dalam menangani pengelolaan data refresh token pada tabel authentications melalui fungsi-fungsi:
// -1. Memasukkan refresh token (addRefreshToken).
// -2. Memverifikasi atau memastikan refresh token ada di database (verifyRefreshToken).
// -3. Menghapus refresh token (deleteRefreshToken).
