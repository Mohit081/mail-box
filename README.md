# User Registration & Mailbox Application

A full-stack web application built with React.js and Node.js that provides user registration/management and Gmail-like mailbox functionality.

## Features

### User Registration & Management (Question 1)
- ✅ **User Registration**: Complete registration form with validation
- ✅ **User Authentication**: JWT-based login/logout system
- ✅ **User Profile Management**: View and edit user profiles
- ✅ **Admin User Management**: Admin panel for managing all users
- ✅ **CRUD Operations**: Create, Read, Update, Delete users
- ✅ **Data Validation**: Comprehensive client and server-side validation
- ✅ **Error Handling**: Proper error handling and user feedback

### Mailbox Application (Question 2)
- ✅ **Gmail-like Interface**: Modern, responsive email interface
- ✅ **Email Composition**: Compose and send emails
- ✅ **Email Management**: Inbox, Sent, Drafts, Important, Trash folders
- ✅ **Email Operations**: Reply, Forward, Delete, Mark as Important
- ✅ **Search Functionality**: Search emails by subject and content
- ✅ **Real-time Updates**: Dynamic email status updates
- ✅ **Responsive Design**: Mobile-friendly interface

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** - Frontend framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **CSS3** - Styling

## Project Structure

```
task/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── index.js            # Server entry point
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install all dependencies (root, server, and client)
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   # Navigate to server directory
   cd server
   
   # Create environment file
   cp config.env.example config.env
   
   # Edit config.env with your settings
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mailbox_app
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   # Default connection: mongodb://localhost:27017
   ```

5. **Run the application**
   ```bash
   # From the root directory, run both frontend and backend
   npm run dev
   
   # Or run them separately:
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user
- `PUT /api/users/:id/activate` - Activate user (Admin only)
- `PUT /api/users/:id/role` - Update user role (Admin only)

### Emails
- `GET /api/emails` - Get user's emails
- `GET /api/emails/:id` - Get single email
- `POST /api/emails` - Send email or save draft
- `PUT /api/emails/:id` - Update email
- `DELETE /api/emails/:id` - Delete email (move to trash)
- `POST /api/emails/:id/reply` - Reply to email
- `POST /api/emails/:id/forward` - Forward email

## Usage

### User Registration
1. Navigate to `/register`
2. Fill out the registration form with required information
3. Submit to create a new account
4. Login with your credentials

### User Management (Admin)
1. Login as an admin user
2. Navigate to `/admin/users`
3. View, edit, activate/deactivate users
4. Change user roles

### Mailbox Features
1. **Compose Email**: Click "Compose" to create new emails
2. **View Emails**: Browse emails in different folders (Inbox, Sent, Drafts, etc.)
3. **Email Actions**: Reply, forward, delete, mark as important
4. **Search**: Use the search bar to find specific emails
5. **Bulk Operations**: Select multiple emails for batch actions

## Data Models

### User Model
```javascript
{
  firstName: String (required, 2-50 chars),
  lastName: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  password: String (required, min 6 chars, hashed),
  phone: String (optional, valid phone),
  dateOfBirth: Date (optional, past date),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  profilePicture: String,
  isActive: Boolean (default: true),
  role: String (enum: ['user', 'admin'], default: 'user'),
  lastLogin: Date
}
```

### Email Model
```javascript
{
  from: ObjectId (ref: User),
  to: [ObjectId] (ref: User),
  cc: [ObjectId] (ref: User),
  bcc: [ObjectId] (ref: User),
  subject: String (required, max 200 chars),
  body: String (required),
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  }],
  isRead: Boolean (default: false),
  isImportant: Boolean (default: false),
  isDraft: Boolean (default: false),
  isDeleted: Boolean (default: false),
  labels: [String],
  threadId: ObjectId,
  replyTo: ObjectId (ref: Email),
  forwardedFrom: ObjectId (ref: Email)
}
```

## Validation & Error Handling

### Client-side Validation
- Form validation using React Hook Form
- Real-time error feedback
- Input sanitization
- Password strength requirements

### Server-side Validation
- Express-validator for input validation
- Database schema validation
- JWT token validation
- Error middleware for consistent error responses

### Error Handling
- Try-catch blocks for async operations
- Proper HTTP status codes
- User-friendly error messages
- Toast notifications for user feedback

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Both client and server-side validation
- **CORS Protection**: Configured for specific origins
- **SQL Injection Prevention**: Using Mongoose ODM
- **XSS Protection**: Input sanitization

## Assumptions

1. **Database**: MongoDB is running locally on default port (27017)
2. **Authentication**: JWT tokens expire after 7 days
3. **File Uploads**: Email attachments are stored locally (can be extended to cloud storage)
4. **Email Delivery**: This is a demo application - actual email sending would require SMTP configuration
5. **Admin Access**: First user registered becomes admin (can be modified)
6. **Responsive Design**: Optimized for desktop and mobile devices

## Future Enhancements

- [ ] Email templates
- [ ] File attachment support
- [ ] Email threading/conversations
- [ ] Advanced search filters
- [ ] Email scheduling
- [ ] Push notifications
- [ ] Email encryption
- [ ] Bulk email operations
- [ ] Email analytics
- [ ] Multi-language support

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in config.env

2. **Port Already in Use**
   - Change PORT in config.env
   - Kill existing processes on ports 3000/5000

3. **JWT Secret Error**
   - Ensure JWT_SECRET is set in config.env
   - Use a long, secure secret key

4. **CORS Issues**
   - Check CORS configuration in server/index.js
   - Ensure frontend URL is allowed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact [your-email@example.com]
