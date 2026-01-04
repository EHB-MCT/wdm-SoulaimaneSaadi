import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import Child from '../models/Child.js';
import Item from '../models/Item.js';
import Event from '../models/Event.js';

const seedData = async (shouldDisconnect = true) => {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://admin:password@mongo:27017/items-db?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Seed Admins
    console.log(' Seeding Admins...');
    const existingAdmin = await Admin.findOne({ email: 'admin@wdm.com' });
    
    if (!existingAdmin) {
      await Admin.create({
        email: 'admin@wdm.com',
        password: 'password'
      });
      console.log(' Created admin: admin@wdm.com / password');
    } else {
      console.log('ℹ Admin already exists, skipping...');
    }

    // Seed Items
    console.log(' Seeding Items...');
    const itemsToCreate = [
      { name: 'Basketball', isAvailable: true },
      { name: 'Football', isAvailable: true },
      { name: 'Rope', isAvailable: true },
      { name: 'Table Tennis Paddle', isAvailable: true },
      { name: 'Jumping Rope', isAvailable: true },
      { name: 'Baseball Bat', isAvailable: false },
      { name: 'Tennis Ball', isAvailable: true }
    ];

    for (const itemData of itemsToCreate) {
      const existingItem = await Item.findOne({ name: itemData.name });
      if (!existingItem) {
        await Item.create(itemData);
        console.log(`✅ Created item: ${itemData.name}`);
      } else {
        console.log(` Item already exists: ${itemData.name}`);
      }
    }

    // Seed Children
    console.log('👶 Seeding Children...');
    const childrenToCreate = [
      {
        name: 'Alice Johnson',
        email: 'alice@test.com',
        password: 'child123',
        status: 'PRESENT',
        isRestricted: false,
        restrictedUntil: null,
        currentItem: null
      },
      {
        name: 'Bob Smith',
        email: 'bob@test.com',
        password: 'child123',
        status: 'CHECKED_OUT',
        isRestricted: false,
        restrictedUntil: null,
        currentItem: 'Basketball'
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@test.com',
        password: 'child123',
        status: 'PRESENT',
        isRestricted: true,
        restrictedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        currentItem: null
      },
      {
        name: 'Diana Wilson',
        email: 'diana@test.com',
        password: 'child123',
        status: 'PRESENT',
        isRestricted: false,
        restrictedUntil: null,
        currentItem: 'Football'
      },
      {
        name: 'Ethan Davis',
        email: 'ethan@test.com',
        password: 'child123',
        status: 'PUNISHED',
        isRestricted: false,
        restrictedUntil: null,
        currentItem: null
      }
    ];

    for (const childData of childrenToCreate) {
      const existingChild = await Child.findOne({ email: childData.email });
      if (!existingChild) {
        await Child.create(childData);
        console.log(`✅ Created child: ${childData.name}`);
      } else {
        console.log(`ℹ️  Child already exists: ${childData.name}`);
      }
    }

    // Seed Sample Events (for the first few children)
    console.log('📅 Seeding Events...');
    const createdChildren = await Child.find({});
    
    for (const child of createdChildren.slice(0, 3)) {
      const existingEvents = await Event.countDocuments({ childId: child._id });
      
      if (existingEvents === 0) {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        
        await Event.create([
          {
            childId: child._id,
            type: 'CHECK_IN',
            timestamp: yesterday,
            label: 'Morning check-in',
            durationMinutes: 0
          },
          {
            childId: child._id,
            type: 'PUNISH_START',
            timestamp: twoHoursAgo,
            label: 'Misbehavior during lunch',
            durationMinutes: 30
          },
          {
            childId: child._id,
            type: 'PUNISH_END',
            timestamp: new Date(twoHoursAgo.getTime() + 30 * 60 * 1000),
            label: 'Punishment completed',
            durationMinutes: 30
          }
        ]);
        
        console.log(`✅ Created sample events for: ${child.name}`);
      } else {
        console.log(`ℹ️  Events already exist for: ${child.name}`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    if (shouldDisconnect) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
};

// Run seeding if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData();
}

export default seedData;