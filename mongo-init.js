// MongoDB initialization script
// This script creates the admin user in the games-db database

// Switch to the games-db database
db = db.getSiblingDB('games-db');

// Create admin user in games-db
db.createUser({
  user: 'admin',
  pwd: 'password',
  roles: [
    {
      role: 'readWrite',
      db: 'games-db'
    },
    {
      role: 'dbAdmin',
      db: 'games-db'
    }
  ]
});

// Create collections to ensure they exist
db.createCollection('admins');
db.createCollection('children');
db.createCollection('events');
db.createCollection('items');

print('MongoDB initialization completed successfully!');