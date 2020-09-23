const firestore = require('firebase-admin').firestore;
const firebase = require('../config/firebase');
const TableConfig = require('../config/tableConfig.json');

const MAX_USERS = 6;

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
  assignTable: async (req: any, res: any) => {
    console.log('assignTable...');

    const currentUser = req['currentUser'];

    // Check if user has already a table assigned
    const tablesRef = firebase.firestore().collection('tables');
    let assignedTable = await tablesRef
      .where('usersList', 'array-contains', currentUser?.uid)
      .get();
    // Assign table if user has no table assigned
    if (assignedTable.empty) {
      const tables = await tablesRef.orderBy('order').get();

      let emptierTableIndex = 0;
      let emptierUsersCount = tables.docs[0].data().usersList.length;
      tables.docs.forEach((doc: any, i: number) => {
        const tableUsersCount = doc.data().usersList.length;
        if (tableUsersCount > 0 && tableUsersCount < emptierUsersCount) {
          emptierTableIndex = i;
          emptierUsersCount = tableUsersCount;
        }
      });

      // If all tables have at least 2 users, get the next emptier table (including tables with no users)
      if (emptierUsersCount >= 2) {
        emptierTableIndex = 0;
        emptierUsersCount = tables.docs[0].data().usersList.length;
        tables.docs.forEach((doc: any, i: number) => {
          const tableUsersCount = doc.data().usersList.length;
          if (tableUsersCount < emptierUsersCount) {
            emptierTableIndex = i;
            emptierUsersCount = tableUsersCount;
          }
        });
      }

      // Assing table if at least one table have less than the max Users
      if (emptierUsersCount < MAX_USERS) {
        const tableUID = tables.docs[emptierTableIndex].id;
        const { uid, name, picture, email } = currentUser || {};

        // Add user to usersList array
        tablesRef.doc(tableUID).update({
          usersList: firestore.FieldValue.arrayUnion(uid),
        });
        // Add user to users collection
        tablesRef.doc(tableUID).collection('users').doc(uid).set({ uid, name, picture, email });

        console.log('Table assigned:', tableUID);
        return res.status(201).json({ msg: 'Table assigned', assignedTable: tableUID });
      }
    } else {
      console.log('User has already a table assigned:', assignedTable.docs[0].id);
      return res.status(200).json({ msg: 'User has already a table assigned' });
    }
    return res.status(400).json({ msg: 'Could not assign table' });
  },
  unAssignTable: async (req: any, res: any) => {
    console.log('un-assignTable...');
    const currentUser = req['currentUser'];
    const { uid } = currentUser || {};

    const tablesRef = firebase.firestore().collection('tables');
    let assignedTable = await tablesRef.where('usersList', 'array-contains', uid).get();

    if (!assignedTable.empty) {
      tablesRef.doc(assignedTable.docs[0].id).collection('users').doc(uid).delete();
      tablesRef.doc(assignedTable.docs[0].id).update({
        usersList: firestore.FieldValue.arrayRemove(uid),
      });
      console.log('Removed user from table:', assignedTable.docs[0].id);
      return res.status(200).json({ msg: 'Removed user from table' });
    } else {
      console.log('User has no table assigned');
      return res.status(200).json({ msg: 'User has no table assigned' });
    }
  },
};
