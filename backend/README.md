# Backend API

A production-grade Node.js backend API built with Express.js and MongoDB.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 🛡️ **Security** - Helmet, CORS, rate limiting, data sanitization
- 📝 **Logging** - Winston with daily rotate files
- 🧪 **Testing** - Comprehensive test suite with Jest
- 🐳 **Docker** - Production-ready containerization
- 📊 **Monitoring** - Health checks and error handling
- 🔧 **Development** - Hot reload, linting, formatting
- 📚 **Documentation** - API documentation and setup guides

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm >= 8.0.0

### Installation

1. **Clone and setup**
   ```bash
   cd backend
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7
   
   # Or install locally and start
   mongod
   ```

4. **Run the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot reload |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed database with sample data |

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/updatedetails` - Update user details
- `PUT /api/v1/auth/updatepassword` - Update password
- `POST /api/v1/auth/forgotpassword` - Forgot password
- `PUT /api/v1/auth/resetpassword/:token` - Reset password

### Users (Admin only)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get single user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Health Check
- `GET /health` - Health check endpoint

## Project Structure

```
backend/
├── src/
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Custom middleware
│   ├── models/              # MongoDB models
│   ├── routes/              # Route definitions
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── validators/          # Request validators
│   ├── database/            # Database config and migrations
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/               # End-to-end tests
├── config/                 # Configuration files
├── scripts/                # Utility scripts
├── logs/                   # Application logs
├── uploads/               # File uploads
├── docs/                  # Documentation
├── docker-compose.yml     # Docker compose
├── Dockerfile             # Docker configuration
├── package.json           # Dependencies
└── README.md             # This file
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Environment
NODE_ENV=development

# Server
PORT=5000
HOST=localhost

# Database
DATABASE_URI=mongodb://localhost:27017/your_database_name

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
# Build image
docker build -t backend .

# Run container
docker run -p 5000:5000 --env-file .env backend
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/unit/user.test.js

# Run tests in watch mode
npm run test:watch
```

## Security Features

- **Rate Limiting** - Prevents brute force attacks
- **CORS** - Configurable cross-origin resource sharing
- **Helmet** - Sets various HTTP headers for security
- **Data Sanitization** - Prevents NoSQL injection attacks
- **HPP Protection** - Prevents HTTP Parameter Pollution
- **Account Locking** - Locks accounts after failed login attempts
- **Password Hashing** - Bcrypt with salt rounds
- **JWT Security** - Secure token generation and validation

## Logging

The application uses Winston for logging with the following features:
- Daily rotating files
- Different log levels (error, warn, info, debug)
- Console and file outputs
- Structured JSON logging
- Morgan for HTTP request logging

Log files are stored in the `logs/` directory:
- `application-YYYY-MM-DD.log` - All application logs
- `error-YYYY-MM-DD.log` - Error logs only

## Error Handling

Centralized error handling with:
- Global error handler middleware
- Async wrapper for controllers
- Custom error responses
- Development vs production error details
- Logging of all errors

## Performance Optimizations

- **Compression** - Gzip compression for responses
- **Caching** - Redis integration ready
- **Database Indexing** - Optimized MongoDB queries
- **Connection Pooling** - MongoDB connection optimization
- **Memory Management** - Proper cleanup and garbage collection

## Monitoring

- Health check endpoint (`/health`)
- Process monitoring with PM2
- Docker health checks
- Application metrics and logging

## Development Guidelines

### Code Style
- ESLint with Airbnb configuration
- Prettier for code formatting
- Consistent naming conventions
- Proper error handling

### Git Workflow
- Feature branches
- Descriptive commit messages
- Code review process
- Automated testing on commits

### Database Guidelines
- Use transactions for multi-document operations
- Implement proper indexing
- Data validation with Mongoose schemas
- Migration scripts for schema changes

## API Documentation

For detailed API documentation, visit `/docs` when the server is running, or check the `docs/` directory for:
- API specification
- Request/response examples
- Authentication guides
- Error code references

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the test files for usage examples