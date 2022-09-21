const Joi = require('joi')

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string()
    .valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp')
    .required(),
}).unknown() // [2]

module.exports = { ImageHeadersSchema }

/**
 * -Valid merupakan variadic function yang digunakan untuk menentukan validitas nilai properti berdasarkan nilai secara spesifik
 * -Nilai tersebut dapat ditetapkan pada parameter fungsi ini. Jika nilai properti content-type termasuk ke dalam nilai tersebut, maka validasi berhasil
 * -Untuk daftar mime/type yang digunakan pada gambar bisa cek di --> https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
 *
 * [2] Unknown merupakan fungsi untuk membuat objek bersifat tidak diketahui
 * -Artinya, objek boleh memiliki properti apa pun karena memang kita tidak tahu objek dapat memiliki properti apa saja
 * - Pada contoh kode di atas, itu berarti objek dapat memiliki properti apa pun selama terdapat properti content-type karena properti tersebut ditandai dengan required
 */
