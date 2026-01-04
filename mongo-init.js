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

// Create indexes for better performance
db.admins.createIndex({ "email": 1 }, { unique: true });
db.children.createIndex({ "email": 1 }, { unique: true });
db.children.createIndex({ "name": 1 });
db.items.createIndex({ "name": 1 }, { unique: true });
db.events.createIndex({ "childId": 1 });
db.events.createIndex({ "timestamp": -1 });

print('MongoDB initialization completed successfully!');