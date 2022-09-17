const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')

class CollaborationsService {
  constructor() {
    this._pool = new Pool()
  }

  // Fungsi untuk menambahkan kolaborasi.
  async addCollaboration(noteId, userId) {
    const id = `collab-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, noteId, userId],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan')
    }
    return result.rows[0].id
  }

  // Fungsi untuk menghapus kolaborasi.
  async deleteCollaboration(noteId, userId) {
    const query = {
      // -kueri untuk menghapus nilai collaboration--pada tabel collaborations--berdasarkan noteId dan userId yang diberikan di parameter
      text: 'DELETE FROM collaborations WHERE note_id = $1 AND user_id = $2 RETURNING id',
      values: [noteId, userId],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal dihapus')
    }
  }

  // Fungsi untuk memeriksa apakah user merupakan kolabolator dari catatan
  async verifyCollaborator(noteId, userId) {
    const query = {
      // -lakukan kueri untuk memastikan kolaborasi dengan noteId dan userId yang diberikan di parameter yang ada di database
      text: 'SELECT * FROM collaborations WHERE note_id = $1 AND user_id = $2',
      values: [noteId, userId],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal diverifikasi')
    }
  }
}

module.exports = CollaborationsService
// - kita akan melakukan sedikit perubahan pada NotesService, yakni membuat fungsi baru yang berfungsi untuk menentukan hak akses kolaborasi pada catata
