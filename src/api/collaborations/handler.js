const ClientError = require('../../exceptions/ClientError')

class CollaborationsHandler {
  constructor(collaborationsService, notesService, validator) {
    this._collaborationsService = collaborationsService
    this._notesService = notesService
    this._validator = validator

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this)
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this)
  }

  async postCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload) //[1]
      const { id: credentialId } = request.auth.credentials
      const { noteId, userId } = request.payload

      await this._notesService.verifyNoteOwner(noteId, credentialId) //[2]

      //-menambahkan catatan
      const collaborationId = await this._collaborationsService.addCollaboration(noteId, userId)

      const response = h.response({
        status: 'success',
        message: 'Kolaborasi berhasil ditambahkan',
        data: {
          collaborationId,
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

  async deleteCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload) //[1]
      const { id: credentialId } = request.auth.credentials
      const { noteId, userId } = request.payload

      await this._notesService.verifyNoteOwner(noteId, credentialId) //[2]

      //-menghapus catatan
      await this._collaborationsService.deleteCollaboration(noteId, userId)

      return {
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      }
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

module.exports = CollaborationsHandler

/**NOTE :
 * [1] Fungsi handler ini bertugas untuk menangani permintaan POST yang masuk ke /collaborations
 * -ermintaan tersebut seharusnya membawa payload noteId dan userId pada body. Jadi untuk memastikan hal tersebut, kita awali dengan memvalidasi request.payload menggunakan fungsi this._validator.validateCollaborationPayload
 * [2] sebelum menambahkan kolaborator pada catatan, pengguna yang mengajukan permintaan haruslah owner dari catatan tersebut
 * -Untuk memastikan hal itu, kita perlu verifikasi request.auth.credentials.id dan noteId yang berada di request.payload menggunakan fungsi this._notesService.verifyNoteOwner
 *
 */
