const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const bcrypt = require('bcrypt')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthenticationError = require('../../exceptions/AuthenticationError')

class UsersService {
  constructor() {
    this._pool = new Pool()
  }

  async addUser({ username, password, fullname }) {
    // -Verifikasi username, pastikan belum terdaftar.
    await this.verifyNewUsername(username)

    // -Bila verifikasi lolos, maka masukkan user baru ke database.
    const id = `user-${nanoid(16)}`
    const hashedPassword = await bcrypt.hash(password, 10)

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('User gagal ditambahkan')
    }
    return result.rows[0].id
  }

  async verifyNewUsername(username) {
    const query = {
      // lakukan kueri username dari tabel users berdasarkan nilai username yang diberikan pada paramete
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    }

    const result = await this._pool.query(query)

    if (result.rows.length > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.')
    }
  }

  async getUserById(userId) {
    const query = {
      // mendapatkan id, username, dan fullname dari tabel users berdasarkan parameter userId
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('User tidak ditemukan')
    }

    return result.rows[0]
  }

  async verifyUserCredential(username, password) {
    const query = {
      // - mendapatkan id dan password dari tabel user berdasarkan username yang dikirimkan melalui parameter.
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah')
    }

    const { id, password: hashedPassword } = result.rows[0]

    const match = await bcrypt.compare(password, hashedPassword)

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah')
    }
    return id
  }
}

module.exports = UsersService
