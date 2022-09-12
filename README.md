## Dasar postgreSQL menggunakan CLI

1.  **Login**

    - Format login :

      ```bash
      psql --username <<username>>
      ```

    - contohnya login root :

      ```bash
      psql --username postgres
      ```

1.  **Buat akun baru**

    - pastikan sudh login sebagai `root`
    - Format Login :

      ```bash
      CREATE USER <<nama user>> WITH ENCRYPTED PASSWORD '<<password>>';
      ```

    - Contohnya :

      ```bash
      CREATE USER developer WITH ENCRYPTED PASSWORD 'sukses';
      ```

1.  **Akses database :**

    - Format :

      ```bash
      psql --username <<username>> --dbname <<nama_db_nya>>

      ```

    - contohnya :

      ```bash
      psql --username developer --dbname companydb
      ```

1.  **Buat table database :**

    - Format :

      ```bash
        CREATE TABLE table_name (
        column1 datatype(length) column_constraint,
        column2 datatype(length) column_constraint,
        column3 datatype(length) column_constraint,
        );
      ```

    - contoh :

      ```bash
      CREATE TABLE karyawan (
      id VARCHAR(8) PRIMARY KEY,
      nama_lengkap VARCHAR(30) NOT NULL,
      email VARCHAR(50) UNIQUE NOT NULL,
      alamat TEXT
      );
      ```

    - untu Cek List database yg telah di buat bisa ketik : `\dt`

1.  **INSERT :**

    - Format :

      ```bash
        INSERT INTO table_name(column1, column2, ...)
        VALUES (value1, value2, ...);
      ```

    - contoh

      ```bash
        Cara ke-1 :
        INSERT INTO karyawan(id, nama_lengkap, email, alamat)
        VALUES ('DCD001', 'Dimas Maulana', 'dimas@dicoding.com', 'Batik Kumeli No. 50 Bandung');

        Cara ke-2 :
        INSERT INTO karyawan VALUES ('DCD002', 'Gilang Ramadhan', 'gilang@dicoding.com', 'Batik Kumeli No. 50 Bandung');
      ```

1.  **SELECT :**

    > cara untuk melihat data database:

    - Format :

      ```bash
        SELECT daftar_kolom, yang, ingin, ditampilkan, ... FROM table_name;
      ```

    - contoh

      ```bash
        SELECT id, nama_lengkap, email, alamat FROM karyawan;
      ```

    - bisa menggunakan tanda bintang (\*) jika ingin menampilkan data pada seluruh kolom yang ada agar kuerinya lebih singkat :

      ```bash
        SELECT \* FROM karyawan;
      ```

    - menampilkan data dengan kriteria tertentu, contohnya menampilkan data karyawan yang memiliki nama Gilang Ramadhan

      ```bash
        SELECT \* FROM karyawan WHERE nama_lengkap = 'Gilang Ramadhan';;
      ```

1.  **UPDATE**

    - Format :

      ```bash
        UPDATE table_name
        SET column1 = value1,
        column2 = value2,
        ...
        WHERE condition;
      ```

    - contoh

      ```bash
        UPDATE karyawan
        SET nama_lengkap = 'Gilang Ramadan'
        WHERE id = 'DCD002';
      ```

1.  **DELETE**

    - Format :

      ```bash
         DELETE FROM table_name WHERE condition;
      ```

    - contoh

      ```bash
      DELETE FROM karyawan WHERE id = 'DCD001';
      ```

## Node-Postgres

1.  **Install `node-postgres`**

    - Doc lengkap bisa cek di : https://node-postgres.com/

      ```bash
      npm install pg
      ```

1.  **Membuat Koneksi ke Database**

    > untuk membuat koneksi ke database ada 2tipe ya itu Client dan Pool

    - Client :

      > hanya bekerja satu kali transaksi, Setiap transaksi yang akan dilakukan, Anda perlu membuka koneksi melalui client.connect() dan menutup koneksi ketika transaksi selesai client.end().

      ```javascript
      const { Client } = require('pg');

      const client = new Client({
        user: 'developer',
        host: 'localhost',
        database: 'companydb',
        password: 'supersecretpassword',
        port: 5432,
      });
      ```

    - Pool :

      > tanpa buka tutup koneksi secara manual, cocok untuk melakukan transaksi ke database

      ```javascript
      const { Pool } = require('pg');

      const pool = new Pool({
        user: 'developer',
        host: 'localhost',
        database: 'companydb',
        password: 'supersecretpassword',
        port: 5432,
      });
      ```

1.  **Melakukan Kueri Sederhana (Hanya Teks)**

    - Client :

      ```javascript
      const getAllEmployees = async () => {
        // membuka koneksi database
        await client.connect();

        // melakukan query mendapatkan seluruh data karyawan
        const result = await client.query('SELECT * FROM karyawan');

        // menutup koneksi database
        await client.end();

        // mengembalikan seluruh karyawan dalam bentuk JavaScript array of object
        return result.rows;
      };
      ```

      > Catatan: Lihat bagaimana transaksi data menggunakan client perlu membuka `(client.connect())` dan menutup koneksi terhadap database `(client.end())`

    - Pool

      ```javascript
      const getAllEmployees = async () => {
        // melakukan query mendapatkan seluruh data karyawan
        const result = await pool.query('SELECT * FROM karyawan');

        // mengembalikan seluruh karyawan dalam bentuk JavaScript array of object
        return result.rows;
      };
      ```

1.  **QUARY data dengan parameter**

    - Node-postgres juga mendukung kueri berparameter, caranya mengubah parameter fungsi .query menjadi objek query seperti ini:

      ```javascript
      const insertEmployee = async (id, name, email, address) => {
        // Membuat objek query
        const query = {
          text: 'INSERT INTO karyawan VALUES($1, $2, $3, $4) RETURNING *',
          values: [id, name, email, address],
        };

        const result = await pool.query(query);
        return result.rows;
      };
      ```

      > - Seluruh kueri yang merupakan parameter diubah dengan `$angka` (contoh $1). Angka terkecil dimulai dari 1. Referensi angka yang digunakan adalah berdasarkan urutan nilai yang ditempatkan pada query.values. Ingat! Urutan penempatan nilai sangatlah berpengaruh. Jadi jangan sampai salah urutan yah.
      > - RETURNING merupakan kueri yang memungkinkan kita untuk mengambil nilai kolom dari baris yang terdampak oleh operasi INSERT, UPDATE, ataupun DELETE.
      > - INSERT .... RETURNING \* artinya hasil kueri akan mengembalikan seluruh nilai kolom yang baru saja dimasukkan oleh operasi INSERT. cek doc : https://www.postgresql.org/docs/current/dml-returning.html
      > - cek panduan resminya : https://node-postgres.com/

## Langkah-langkah praktekan ke projek ini :

1.  **Membuat Database dan install pg**

    - Silakan buka Powershell/bash/Terminal dan masuk ke PostgreSQL menggunakan akun root.

      ```bash
        psql --username postgres
      ```

    - Buat database dengan nama notesapp.

      ```bash
        CREATE DATABASE notesapp;
      ```

    - Setelah itu berikan hak akses ke user developer.

      ```bash
        GRANT ALL PRIVILEGES ON DATABASE notesapp TO developer;
      ```

    - Setelah itu berikan hak akses ke user developer.

      ```bash
        npm install pg
      ```

1.  **Mengonfigurasi Environment**

    - Install `dotenv` :

      ```bash
        npm install dotenv
      ```

    - buat folder `.env` di root dan isi :

      ```bash
        # server configuration
        HOST=localhost
        PORT=5000

        # node-postgres configuration
        PGUSER=developer
        PGHOST=localhost
        PGPASSWORD=supersecretpassword
        PGDATABASE=notesapp
        PGPORT=5432
      ```

      > VARIABEL=value
      > untuk VARIABEL wajib menggunakan huruf kapital
      > selengkapnya bisa cek https://www.npmjs.com/package/dotenv

    - buat folder `.prod.env` di root dan isi :

      ```bash
        # server configuration
        HOST=0.0.0.0
        PORT=5000
      ```

      > ini berfungsi untuk production

    - inport semuanya ke file `server.js` dan rubah port serta host menuju ke .env

1.  **Buat Tabel Notes dengan Teknik Migrate**

    - Struktur Folder :

      - Properti objek notes

        > Tabel notes ini akan kita gunakan untuk menampung catatan yang sebelumnya kita simpan di memory. Catatan yang disimpan memiliki properti yang digambarkan melalui tabel berikut.

        | No  | Nama Properti | Tipe Data       | Ketentuan                   |
        | --- | ------------- | --------------- | --------------------------- |
        | 1   | id            | string          | Unik dan Tidak boleh kosong |
        | 2   | title         | string          | Tidak boleh kosong          |
        | 3   | body          | string          | Tidak boleh kosong          |
        | 4   | tags          | array of string | Tidak boleh kosong          |
        | 5   | createdAt     | string          | Tidak boleh kosong          |
        | 6   | updatedAt     | string          | Tidak boleh kosong          |

      - Tabel notes

        > Dalam membuat tabel di database, kita bisa mereferensi dari struktur data yang sudah ada. Tentunya dengan sedikit perubahan seperti penamaan properti menjadi kolom, penyesuaian tipe data, dan juga constraint.
        > Jadi, kita akan membuat tabel notes yang memiliki struktur kolom berikut:

        | No  | Nama Properti | Tipe Data   | Ketentuan   |
        | --- | ------------- | ----------- | ----------- |
        | 1   | id            | VARCHAR(50) | PRIMARY KEY |
        | 2   | title         | TEXT        | NOT NULL    |
        | 3   | body          | TEXT        | NOT NULL    |
        | 4   | tags          | TEXT        | NOT NULL    |
        | 5   | createdAt     | TEXT[]      | NOT NULL    |
        | 6   | updatedAt     | TEXT        | NOT NULL    |

        > Pemilihan tipe data saat ini bukanlah concern utama. Kami memilih tipe data TEXT untuk memudahkan proses pada data yang dihasilkan oleh end-user. Sedangkan untuk data yang dihasilkan oleh sistem (contoh: id), kami gunakan VARCHAR(50) karena ukuran nilainya expected.

    - Instalisasi node-pg-migrate https://salsita.github.io/node-pg-migrate/#/

      - Install now

        ```bash
        npm install node-pg-migrate
        ```

      - Kemudian buat runner script baru pada package.json seperti ini :

        ```json
        "scripts": {
        "start-prod": "NODE_ENV=production node ./src/server.js",
        "start-dev": "nodemon ./src/server.js",
        "lint": "eslint ./src",
        "migrate": "node-pg-migrate" // ini dia
        },
        ```

      - Eksekusi lewat bash

        ```bash
        npm run migrate create "create table notes"
        ```

        > Perintah migrate create akan menghasilkan berkas migration yang secara default disimpan pada folder /migrations. Silakan lihat folder tersebut, harusnya ada satu berkas migrations di sana.

      - Buka berkas hasil migrations nya dan copas :

        ```javascript
        exports.shorthands = undefined;

        exports.up = (pgm) => {
          pgm.createTable('notes', {
            id: {
              type: 'VARCHAR(50)',
              primaryKey: true,
            },
            title: {
              type: 'TEXT',
              notNull: true,
            },
            body: {
              type: 'TEXT',
              notNull: true,
            },
            tags: {
              type: 'TEXT[]',
              notNull: true,
            },
            created_at: {
              type: 'TEXT',
              notNull: true,
            },
            updated_at: {
              type: 'TEXT',
              notNull: true,
            },
          });
        };

        exports.down = (pgm) => {
          pgm.dropTable('notes');
        };
        ```

      - Setelah memuat scema diatas selanjutnya Runing migrate :

        ```bash
        npm run migrate up
        ```

1.  **Eksekusi buat fungsinya**

    - Langkah awal adalah kita buat folder baru bernama postgres di dalam src -> services. Kemudian di dalam folder postgres, buatlah berkas JavaScript baru dengan nama NotesService.js

    - Buat fungsi masing2 :

      ```javascript
      const { Pool } = require('pg');
      const { nanoid } = require('nanoid');
      const InvariantError = require('../../exceptions/InvariantError');
      const { mapDBToModel } = require('../../utils');
      const NotFoundError = require('../../exceptions/NotFoundError');

      class NotesService {
        constructor() {
          this._pool = new Pool();
        }

        //[1] BUAT FUNGSI ADDNOTE :
        async addNote({ title, body, tags }) {
          const id = nanoid(16);
          const createdAt = new Date().toISOString();
          const updatedAt = createdAt;

          //-buat objek query untuk memasukan notes baru ke database
          const query = {
            text: 'INSERT INTO notes VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
            values: [id, title, body, tags, createdAt, updatedAt],
          };

          //-mengeksekusi query yang sudah dibuat, akan berjalan secara asynchronous
          const result = await this._pool.query(query);

          //- Jika nilai id tidak undefined, = catatan berhasil dimasukan dan kembalikan fungsi dengan nilai id
          //- Jika tidak maka throw InvariantError.

          if (!result.rows[0].id) {
            throw new InvariantError('Catatan gagal ditambahkan');
          }

          return result.rows[0].id;
        }

        //[2] Membuat Fungsi getNotes
        //- Di dalamnya kita dapatkan seluruh data notes yang ada di database dgn query : “SELECT * FROM notes”
        async getNotes() {
          const result = await this._pool.query('SELECT * FROM notes');
          return result.rows.map(mapDBToModel);
        }

        //[4]BUAT FUNGSI GetNoteById
        //- melakukan query untuk mendapatkan note di dalam database berdasarkan id yang diberikan
        async getNoteById(id) {
          const query = {
            text: 'SELECT * FROM notes WHERE id = $1',
            values: [id],
          };

          const result = await this._pool.query(query);

          //-bila "result.rows" nilainya 0 (false) maka bangkitkan NotFoundError
          if (!result.rows.length) {
            throw new NotFoundError('Catatan tidak ditemukan');
          }

          //- Bila "true", maka kembalikan dengan result.rows[0] yang sudah di-mapping dengan fungsi mapDBToModel
          return result.rows.map(mapDBToModel)[0];
        }

        //[5] Fungsi editNoteById
        //- melakukan query untuk mengubah note di dalam database berdasarkan id yang diberikan
        async editNoteById(id, { title, body, tags }) {
          const updatedAt = new Date().toISOString();
          const query = {
            text: 'UPDATE notes SET title = $1, body = $2, tags = $3, updated_at = $4 WHERE id = $5 RETURNING id',
            values: [title, body, tags, updatedAt, id],
          };

          const result = await this._pool.query(query);

          //-jika "result.row" nilainya 0(false) maka error, dan jika tru tidak perlu mengembalikan nilai apapun
          if (!result.rows.length) {
            throw new NotFoundError(
              'Gagal memperbarui catatan. Id tidak ditemukan'
            );
          }
        }

        //[6] deleteNoteById
        //-menghapus note di dalam database berdasarkan id yang diberikan
        async deleteNoteById(id) {
          const query = {
            text: 'DELETE FROM notes WHERE id = $1 RETURNING id',
            values: [id],
          };

          const result = await this._pool.query(query);

          if (!result.rows.length) {
            throw new NotFoundError(
              'Catatan gagal dihapus. Id tidak ditemukan'
            );
          }
        }
      }

      module.exports = NotesService;
      //Impor ke server.js
      ```

    - Impor ke `src -> server.js`

      ```javascript
      const NotesService = require('./services/postgres/NotesService');
      ```
