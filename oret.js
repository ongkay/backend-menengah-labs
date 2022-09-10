/* eslint-disable arrow-body-style */
// eslint-disable-next-line spaced-comment
//format buat plugin
// eslint-disable-next-line no-unused-vars
const notesPlugin = {
  name: 'notes',
  version: '1.0.0',
  register: async (server, options) => {
    // contoh, menetapkan routing untuk /notes
    const { notes } = options;
    server.route([
      {
        method: 'GET',
        path: '/notes',
        handler: () => {
          return notes;
        },
      },
    ]);
  },
};
