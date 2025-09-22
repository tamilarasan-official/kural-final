// MongoDB initialization script for Docker
db = db.getSiblingDB('backend_db');

db.createUser({
  user: 'backend_user',
  pwd: 'backend_password',
  roles: [
    {
      role: 'readWrite',
      db: 'backend_db'
    }
  ]
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'must be a valid email and is required'
        },
        password: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        role: {
          bsonType: 'string',
          enum: ['user', 'admin'],
          description: 'must be either user or admin'
        }
      }
    }
  }
});

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

print('Database initialized successfully');