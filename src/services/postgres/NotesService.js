const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const { mapDBToModel } = require('../../utils')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class NotesService {
  constructor(collaborationService) {
    this._pool = new Pool()
    this._collaborationService = collaborationService
  }

  async addNote({ title, body, tags, owner }) {
    const id = nanoid(16)
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const query = {
      text: 'INSERT INTO notes VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, body, tags, createdAt, updatedAt, owner],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Catatan gagal ditambahkan')
    }

    return result.rows[0].id
  }

  // [2]
  async getNotes(owner) {
    const query = {
      text: `SELECT notes.* FROM notes
      LEFT JOIN collaborations ON collaborations.note_id = notes.id
      WHERE notes.owner = $1 OR collaborations.user_id = $1
      GROUP BY notes.id`,
      values: [owner],
    }
    const result = await this._pool.query(query)
    return result.rows.map(mapDBToModel)
  }

  //[3]
  async getNoteById(id) {
    const query = {
      text: `SELECT notes.*, users.username
      FROM notes
      LEFT JOIN users ON users.id = notes.owner
      WHERE notes.id = $1`,
      values: [id],
    }
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan')
    }

    return result.rows.map(mapDBToModel)[0]
  }

  async editNoteById(id, { title, body, tags }) {
    const updatedAt = new Date().toISOString()
    const query = {
      text: 'UPDATE notes SET title = $1, body = $2, tags = $3, updated_at = $4 WHERE id = $5 RETURNING id',
      values: [title, body, tags, updatedAt, id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan')
    }
  }

  async deleteNoteById(id) {
    const query = {
      text: 'DELETE FROM notes WHERE id = $1 RETURNING id',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan')
    }
  }

  async verifyNoteOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id],
    }
    const result = await this._pool.query(query)
    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan')
    }
    const note = result.rows[0]
    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }

  //[1]
  async verifyNoteAccess(noteId, userId) {
    try {
      await this.verifyNoteOwner(noteId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }
      try {
        await this._collaborationService.verifyCollaborator(noteId, userId)
      } catch {
        throw error
      }
    }
  }
}

module.exports = NotesService

/** [1]
 * -bertujuan untuk memverifikasi hak akses pengguna (userId) terhadap catatan (id), baik sebagai owner maupun collaboration. Untuk lolos tahap verifikasi, pengguna haruslah seorang owner atau kolaborator dari catatan.
 * -Dalam proses verifikasi, fungsi ini tidak melakukan kueri secara langsung ke database. Melainkan ia memanfaatkan fungsi yang sudah dibuat sebelumnya, yakni verifyNoteOwner dan verifyCollaborator.
 *
 * Tahapannya :
 * -Fungsi ini akan memeriksa hak akses userId terhadap noteId melalui fungsi verifyNoteOwner.
 * -Bila userId tersebut merupakan owner dari noteId maka ia akan lolos verifikasi.
 * -Namun bila gagal, proses verifikasi owner membangkitkan eror (gagal) dan masuk ke block catch.
 * -Dalam block catch (pertama), error yang dibangkitkan dari fungsi verifyNoteOwner bisa berupa NotFoundError atau AuthorizationError.
 * -Bila error merupakan NotFoundError, maka langsung throw dengan error (NotFoundError) tersebut. Kita tak perlu memeriksa hak akses kolaborator karena catatannya memang tidak ada.
 * -Bila AuthorizationError, maka lanjutkan dengan proses pemeriksaan hak akses kolaborator, menggunakan fungsi verifyCollaborator.
 * -Bila pengguna seorang kolaborator, proses verifikasi akan lolos.
 * -Namun jika bukan, maka fungsi verifyNoteAccess gagal dan throw kembali error (AuthorizationError).
 */

/**[2]
 * -kita menggunakan LEFT JOIN karena tabel notes berada di posisi paling kiri (dipanggil pertama kali)
 * -kueri di atas akan mengembalikan seluruh nilai notes yang dimiliki oleh dan dikolaborasikan dengan owner
 * -Data notes yang dihasilkan berpotensi duplikasi, sehingga di akhir kueri, kita GROUP nilainya agar menghilangkan duplikasi yang dilihat berdasarkan notes.id.
 *
 * [3]
 * -Untuk mendapatkan username dari pemilik catatan. Kita harus melakukan join tabel catatan dengan users. Kolom yang menjadi kunci dalam melakukan LEFT JOIN adalah users.id dengan notes.owner.
 * -Dengan begitu notes yang dihasilkan dari kueri tersebut akan memiliki properti username. Agar properti username tampil pada respons, kita perlu menyesuaikan perubahannya pada fungsi mapDBToModel juga
 */
