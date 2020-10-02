module.exports = {
  getRandomUser: () => ({
    uid: `${Math.floor(Math.random() * 1000000)}`,
    name: `${Math.floor(Math.random() * 1000000)}`,
    picture: 'https://picsum.photos/200',
    email: `${Math.floor(Math.random() * 1000)}@${Math.floor(Math.random() * 1000)}.com`,
  }),
};

export {}