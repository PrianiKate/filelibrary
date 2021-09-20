const { getStorage, ref, getDownloadURL } = require('firebase/storage');
const { getFirestore, getDocs, collection, query, where } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');
const { firebaseConfig } = require('./config');

const firebase = initializeApp(firebaseConfig);
const db = getFirestore(firebase);
const collections = {
  userCollection: collection(db, 'users'),
  documentCollection: collection(db, 'documents'),
}
const storage = getStorage();

const getUsers = async () => {
  const response = await getDocs(collections.userCollection);
  const userList = [];
  response.forEach((doc) => {
    userList.push({ id: doc.id, ...doc.data() });
  });

  return userList;
};

const getFileNamesByUser = async (login) => {
  const q = query(collections.documentCollection, where("owner", "==", login));
  const response = await getDocs(q);

  const fileNamesList = [];
  response.forEach((doc) => {
    fileNamesList.push(doc.data().name);
  });

  return fileNamesList;
};

const getFileLinksByUser = async (login) => {
  const fileNamesList = await getFileNamesByUser(login);

  const requests = fileNamesList.map(async (name) => {
    const fileRef = ref(storage, name);
    const link = await getDownloadURL(fileRef);
    return link;
  });

  return Promise.all(requests);
};

module.exports = {
  getUsers,
  getFileLinksByUser,
};
