import React, { useEffect } from 'react';
import './Theater.scss';
import MapImage from '../assets/conference-map.svg';
import TableConfig from './tableConfig.json';
import Firebase from '../services/firebase';
import { sendPostRequest } from '../apis';

const Theater: React.FC = () => {
  const profile = Firebase.auth().currentUser;

  useEffect(() => {
    sendPostRequest(`assign-table`, { uid: profile?.uid }).then((response) =>
      console.log(response)
    );
  }, []);

  const logout = () => {
    sendPostRequest(`unassign-table`, { uid: profile?.uid }).then((response) =>
      console.log(response)
    );
    Firebase.auth().signOut();
  };

  return (
    <div className="remo-theater" style={{ width: TableConfig.width, height: TableConfig.height }}>
      <div className="rt-app-bar">
        <div>
          <img src={profile?.photoURL || undefined} />
          <h4>{profile?.displayName}</h4>
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
          >
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
