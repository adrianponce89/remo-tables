const firestore = require('firebase-admin').firestore;
const firebase = require('../config/firebase');
const TableConfig = require('../config/tableConfig.json');
const { getRandomUser } = require('./utils');

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

    let currentUser = req['currentUser'];

    // TODO: remove this test
    if (req.body.random) {
      currentUser = getRandomUser();
    }

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
      } else {
        return res.status(400).json({ error: 'All tables are occupied' });
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
  moveTable: async (req: any, res: any) => {
    console.log('move to Table...');
    const currentUser = req['currentUser'];
    const { uid, name, picture, email } = currentUser || {};
    const { tableUID } = req.body;

    const tablesRef = firebase.firestore().collection('tables');

    // Stop movement if destiny is full
    let destinyTable = await tablesRef.doc(tableUID).get();
    if (destinyTable.data().usersList.length >= MAX_USERS) {
      return res.status(400).json({ error: 'Unable to move to new table. Max users reach' });
    }

    // Get a new write batch
    const batch = firebase.firestore().batch();

    let initialTable = await tablesRef.where('usersList', 'array-contains', uid).get();

    if (!initialTable.empty) {
      // Delete user from users collection
      const userRef = tablesRef.doc(initialTable.docs[0].id).collection('users').doc(uid);
      batch.delete(userRef);

      // Delete user from usersList array
      const userArrRef = tablesRef.doc(initialTable.docs[0].id);
      batch.update(userArrRef, {
        usersList: firestore.FieldValue.arrayRemove(uid),
      });
    }

    // Add user to usersList array
    const destinyTableRef = tablesRef.doc(tableUID);
    batch.update(destinyTableRef, {
      usersList: firestore.FieldValue.arrayUnion(uid),
    });

    // Add user to users collection
    const destinyTableUserRef = tablesRef.doc(tableUID).collection('users').doc(uid);
    batch.set(destinyTableUserRef, { uid, name, picture, email });

    // Commit the batch
    await batch.commit();

    return res.status(201).json({ msg: 'Move to table', to: tableUID });
  },
};
