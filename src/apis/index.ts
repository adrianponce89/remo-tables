import firebase from 'firebase';

const API_URL = <string>process.env.REACT_APP_API_URL;
const auth = firebase.auth();

export const sendGetRequest = async (endpoint: string) => {
  const fullUrl = endpoint.indexOf(API_URL) === -1 ? API_URL + endpoint : endpoint;

  const user = auth.currentUser;
  const token = user && (await user.getIdToken());

  const headers = {
    Accept: 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  try {
    const rawResponse = await fetch(fullUrl, {
      headers,
      method: 'GET',
      mode: 'cors',
    }).then((result) => {
      return result;
    });

    return await rawResponse.json();
  } catch (e) {
    throw e;
  }
};

export const sendPostRequest = async (endpoint: string, data: any) => {
  const fullUrl = endpoint.indexOf(API_URL) === -1 ? API_URL + endpoint : endpoint;

  const user = auth.currentUser;
  const token = user && (await user.getIdToken());

  const headers = {
    Accept: 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  try {
    const rawResponse = await fetch(fullUrl, {
      body: JSON.stringify(data),
      headers,
      method: 'POST',
      mode: 'cors',
    }).then((result) => {
      return result;
    });

    return await rawResponse.json();
  } catch (e) {
    throw e;
  }
};
