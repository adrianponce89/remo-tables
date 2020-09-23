const firebase = require('../config/firebase');
const TableConfig = require('../config/tableConfig.json');

module.exports = {
  initializateTables: (req: any, res: any) => {
    const tablesRef = firebase.firestore().collection('tables');

    TableConfig.tables.forEach(async (table: { id: string }, i: number) => {
      await tablesRef.doc(table.id).set({ name: table.id, usersList: [], order: i });
      const usersRef = tablesRef.doc(table.id).collection('users');

      // Remove any previous users
      const users = await usersRef.get();
      users.docs.forEach((doc: any) => {
        usersRef.doc(doc.id).delete();
      });
    });
    return res.status(200).json({ status: 'ok' });
  },
};
