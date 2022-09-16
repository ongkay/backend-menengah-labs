const Jwt = require('@hapi/jwt')
const InvariantError = require('../exceptions/InvariantError')

const TokenManager = {
  generateAccessToken: (payload) => Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),
  generateRefreshToken: (payload) => Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken)
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY)
      const { payload } = artifacts.decoded

      return payload
      // - Nilai payload tersebut nantinya akan digunakan dalam membuat akses token baru.
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid')
    }
  },
}

module.exports = TokenManager

// - Parameter payload merupakan objek yang disimpan ke dalam salah satu artifacts JWT. Biasanya objek payload berisi properti yang mengindikasikan identitas pengguna, contohnya user id.
// - Fungsi generate menerima dua parameter, yang pertama adalah payload dan kedua adalah secretKey. Pada parameter payload, kita akan memberikan nilai payload yang ada di parameter fungsi. Kemudian secretKey, sesuai namanya ia adalah kunci yang digunakan algoritma enkripsi sebagai kombinasi untuk membuat JWT token. Kunci ini bersifat rahasia, jadi jangan disimpan di source code secara transparan. Kita akan simpan key di dalam environment variable ACCESS_TOKEN_KEY.
