const amqp = require('amqplib') // [1]

const ProducerService = {
  sendMessage: async (queue, message) => {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER) // [2]
    const channel = await connection.createChannel() // [3]

    // [4]
    await channel.assertQueue(queue, {
      durable: true,
    })

    await channel.sendToQueue(queue, Buffer.from(message)) // [5]

    // [6]
    setTimeout(() => {
      connection.close()
    }, 1000)
  },
}

module.exports = ProducerService // [7]

/**NOTE:
 * [1] npm install amqplib
 * [2] buat connection ke RabbitMQ server yang di simpan di .env
 * [3] selanjutnya kita buat channel dengan menggunakan fungsi connection.createChannel.
 * [4] buat queue menggunakan channel.assertQueue.
 * [5] kirim pesan dalam bentuk Buffer ke queue dengan menggunakan perintah channel.sendToQueue.
 * [6] tutup koneksi setelah satu detik berlangsung dari pengiriman pesan.
 * [7] ekspor ProducerService agar dapat digunakan pada berkas JavaScript lain
 */
