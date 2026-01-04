// MongoDB initialization script
// This script creates the admin user in the items-db database

// Switch to the items-db database
db = db.getSiblingDB('items-db');

// Create admin user in items-db
db.createUser({
  user: 'admin',
  pwd: 'password',
  roles: [
    {
      role: 'readWrite',
      db: 'items-db'
    },
    {
      role: 'dbAdmin',
      db: 'items-db'
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