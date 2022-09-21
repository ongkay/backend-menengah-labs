const ClientError = require('../../exceptions/ClientError')

class UploadsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this)
  }

  async postUploadImageHandler(request, h) {
    try {
      // -kita dapatkan dulu data pada request.payload yang merupakan Readable
      const { data } = request.payload
      // -validasi untuk memastikan objek headers memiliki content-type yang sesuai
      this._validator.validateImageHeaders(data.hapi.headers)

      // -Eksekusi Menulis berkas yang dikirim pada storage
      const filename = await this._service.writeFile(data, data.hapi)

      const response = h.response({
        status: 'success',
        data: {
          fileLocation: `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`,
        },
      })
      response.code(201)

      return response
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        })
        response.code(error.statusCode)
        return response
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      })
      response.code(500)
      console.error(error)
      return response
    }
  }
}

module.exports = UploadsHandler
