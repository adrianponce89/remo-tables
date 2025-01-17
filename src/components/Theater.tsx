import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './Theater.scss';
import MapImage from '../assets/conference-map.svg';
import TableConfig from './tableConfig.json';
import Firebase, { db } from '../services/firebase';
import { sendPostRequest } from '../apis';
import { store } from 'react-notifications-component';

const Theater: React.FC = () => {
  const profile = Firebase.auth().currentUser;
  const history = useHistory();

  const initialTablesState = TableConfig.tables
    .map((t, i) => ({ order: i, key: t.id }))
    .reduce((a, v) => ({ ...a, [v.key]: { id: v.key, users: [] } }), {});

  const [tablesContent, setTablesContent] = useState(initialTablesState);
  const [showUser, setShowUser] = useState(false);

  useEffect(() => {
    sendPostRequest(`assign-table`, { uid: profile?.uid }).then((response) => {
      if (response.error) {
        showError(response.error);
      }
    });
    const tablesRef = db.collection('tables');

    tablesRef.get().then((tables) => {
      tables.docs.forEach((doc) => {
        const usersRef = tablesRef.doc(doc.id).collection('users');
        usersRef.onSnapshot((querySnapshot) => {
          const users: { id: string }[] = [];
          querySnapshot.forEach((doc) => {
            users.push({
              id: doc.id,
              ...doc.data(),
            });
          });

          setTablesContent((tc) => ({
            ...tc,
            [doc.id]: { ...tc[doc.id], users },
          }));
        });
      });
    });
  }, []);

  const logout = () => {
    sendPostRequest(`unassign-table`, {}).then((response) => console.log(response));
    Firebase.auth().signOut();
    history.push('/');
  };

  const moveTable = (tableUID: string) => {
    sendPostRequest(`move-table`, { tableUID }).then((response) => {
      if (response.error) {
        showError(response.error);
      }
    });
  };

  // TODO: remove this test
  const onAddRandom = () => {
    sendPostRequest(`assign-table`, { random: true }).then((response) => {
      if (response.error) {
        showError(response.error);
      }
    });
  };

  const showError = (error: string) => {
    store.addNotification({
      title: 'Error!',
      message: error,
      type: 'danger',
      insert: 'bottom',
      container: 'bottom-right',
      animationIn: ['animate__animated', 'animate__fadeIn'],
      animationOut: ['animate__animated', 'animate__fadeOut'],
      dismiss: {
        duration: 2000,
        onScreen: true,
      },
    });
  };
  const onShowUser = () => {
    setShowUser(true);
    setTimeout(() => {
      setShowUser(false);
    }, 4000);
  };

  return (
    <div className="remo-theater" style={{ width: TableConfig.width, height: TableConfig.height }}>
      <div className="rt-app-bar">
        <div>
          <img src={profile?.photoURL || undefined} />
          <h4>{profile?.displayName}</h4>
          <button className="rt-button" onClick={onShowUser} disabled={showUser}>
            Show
          </button>
          <button className="rt-button" onClick={onAddRandom} disabled={showUser}>
            Add Random
          </button>
        </div>

        <a className="rt-logout" href="javascript:;" onClick={logout}>
          Logout
        </a>
      </div>

      <div className="rt-rooms">
        {TableConfig.tables.map((table) => (
          <div
            key={table.id}
            className="rt-room"
            style={{
              width: table.width,
              height: table.height,
              top: table.y,
              left: table.x,
            }}
            onDoubleClick={() => moveTable(table.id)}
          >
            {tablesContent[table.id].users.map((user: any, i: number) => (
              <div
                key={user.id}
                className={`rt-user ${profile?.uid == user.id && showUser ? 'bounce' : ''}`}
                style={{
                  top: table.seats[i].y,
                  left: table.seats[i].x,
                  backgroundImage: `url(${user.picture})`,
                }}
              />
            ))}
            <div className="rt-room-name">{table.id}</div>
          </div>
        ))}
      </div>
      <div className="rt-background">
        <img src={MapImage} alt="Conference background" />
      </div>
    </div>
  );
};

export default Theater;
