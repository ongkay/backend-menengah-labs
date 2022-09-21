const fs = require('fs')

class StorageService {
  constructor(folder) {
    this._folder = folder // [1]

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true }) // [2]
    }
  }

  writeFile(file, meta) {
    const filename = +new Date() + meta.filename // [3]
    const path = `${this._folder}/${filename}` // [4]

    const fileStream = fs.createWriteStream(path) // [5]

    // [6]
    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error))
      file.pipe(fileStream)
      file.on('end', () => resolve(filename))
    })
  }
}

module.exports = StorageService

/**NOTE:
 * [1] this._folder akan kita gunakan sebagai basis folder dalam penyimpanan berkas yang akan ditulis.
 * [2] Options recursive: true membuat mkdirSync bekerja secara rekursif, --> https://nodejs.org/api/fs.html#fs_fs_mkdirsync_path_options
 * [3] Variabel filename menampung nilai dari nama berkas yang akan dituliskan. Nilainya diambil dari meta.filename yang dikombinasikan dengan timestamp. Kombinasi tersebut bertujuan untuk memberikan nama berkas yang unik
 * [4] ariabel path dibuat untuk menampung path atau alamat lengkap dari berkas yang akan dituliskan. Nilainya diambil dari basis folder yang digunakan (this._folder) dan nama berkas (filename).
 * [5] setelah kita memiliki nilai path, kita dapat membuat writable stream dari path tersebut menggunakan fungsi fs.createWriteStream
 * [6] Fungsi writeFile kita buat mengembalikan Promise sehingga proses penulisan berkas akan berjalan secara asynchronous
 * - Di dalam executor function Promise, kita menuliskan proses penulisan berkas menggunakan teknik stream. Jika proses penulisannya berhasil (end), maka Promise akan menghasilkan resolve yang membawa nama berkas (filename) sebagai nilai kembalian. Namun jika penulisan berkas terjadi error, Promise akan menghasilkan reject dengan membawa error yang dihasilkan
 */
