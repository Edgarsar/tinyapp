// Email lookup function
const getUserByEmail = (email, database) => {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// Generates a string of 6 random alphanumeric characters
const generateRandomString = () => {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

// Returns the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser = (id, database) => {
  const newObj = {};
  for (const urlId in database) {
    if (database[urlId]["userID"] === id) {
      newObj[urlId] = database[urlId];
    }
  }
  return newObj;
};


module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser
};