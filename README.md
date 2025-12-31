# 🚀 PathPilot

**Your Personal Academic Journey Tracker**

PathPilot is a modern, full-stack web application designed to help students track their academic progress, manage daily habits, and gain AI-powered insights into their learning journey. Built with a sophisticated zinc/gray theme and full dark mode support for an optimal user experience.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb)

---

## ✨ Features

### 🎨 Modern UI/UX
- **Zinc/Gray Theme**: Professional, easy-on-the-eyes color scheme
- **Dark Mode**: Seamless light/dark theme toggle with system preference detection
- **Smooth Animations**: Carefully timed transitions (0.6-0.9s) using Framer Motion
- **Skeleton Loaders**: Enhanced UX with loading states
- **Responsive Design**: Optimized for all screen sizes
- **Interactive Components**: Built with shadcn/ui for consistency

### 📚 Course Management
- Add and track multiple courses
- Categorize courses (Academic, Skill, Hobby)
- Set weekly target hours for each course
- Monitor progress with visual indicators
- Real-time statistics dashboard

### 📅 Daily Habit Tracking
- Log daily metrics:
  - Sleep hours
  - Study time
  - Entertainment
  - Exercise
  - Food quality (1-10)
  - Mood (1-10)
  - Stress level (1-10)
- View recent habit history
- Beautiful tab-based interface

### 📊 Analytics & Insights
- Weekly summary statistics
- AI-powered personalized recommendations
- Visual progress tracking
- Trend analysis with indicators
- Detailed metric breakdowns

### 🔐 Authentication
- Secure user registration and login
- JWT-based authentication
- Protected routes
- Persistent sessions

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.1.1 (App Router)
- **UI Library**: React 19.2.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Components**: shadcn/ui (12+ components)
- **Animations**: Framer Motion
- **Icons**: React Icons
- **Theme**: next-themes (dark mode)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs for password hashing

### AI Integration
- **Framework**: Python with FastAPI (Uvicorn)
- **Model**: Google Generative AI (Gemini)
- **Purpose**: Personalized habit recommendations

---

## 📁 Project Structure

```
PathPilot/
├── client/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── page.tsx           # Home/Dashboard
│   │   │   ├── courses/           # Course management
│   │   │   ├── habits/            # Habit tracking
│   │   │   ├── analytics/         # Analytics & AI insights
│   │   │   ├── login/             # Authentication
│   │   │   ├── register/          # User registration
│   │   │   └── dashboard/         # Welcome page
│   │   ├── components/    # Reusable components
│   │   │   ├── Navbar.tsx         # Navigation with theme toggle
│   │   │   ├── Protected.tsx      # Auth protection
│   │   │   ├── ThemeProvider.tsx  # Dark mode provider
│   │   │   ├── ThemeToggle.tsx    # Theme switcher
│   │   │   ├── SkeletonCard.tsx   # Loading states
│   │   │   └── ui/                # shadcn components
│   │   └── lib/
│   │       ├── api.ts             # API client functions
│   │       └── utils.ts           # Utility functions
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Express.js Backend
│   ├── controllers/       # Business logic
│   │   └── userController.js
│   ├── middleware/        # Auth middleware
│   │   └── auth.js
│   ├── models/           # Mongoose schemas
│   │   ├── User.js
│   │   ├── Course.js
│   │   └── Habit.js
│   ├── routes/           # API routes
│   │   ├── userRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── habitRoutes.js
│   │   └── analyticsRoutes.js
│   ├── src/config/       # Configuration
│   │   └── db.js
│   ├── index.js          # Server entry point
│   └── package.json
│
└── ai/                   # Python AI Service
    └── main.py          # FastAPI server with Gemini AI
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Python 3.8+ (for AI service)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/PathPilot.git
   cd PathPilot
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Install AI Service Dependencies**
   ```bash
   cd ../ai
   pip install fastapi uvicorn google-generativeai python-dotenv
   ```

### Environment Setup

1. **Backend (.env in server/)**
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

2. **AI Service (.env in ai/)**
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd server
   node index.js
   # Server runs on http://localhost:5000
   ```

3. **Start AI Service**
   ```bash
   cd ai
   uvicorn main:app --reload
   # AI service runs on http://localhost:8000
   ```

4. **Start Frontend**
   ```bash
   cd client
   npm run dev
   # Frontend runs on http://localhost:3000
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

---

## 🎯 Usage

### 1. **Register/Login**
- Create a new account or login with existing credentials
- Credentials are securely stored with bcrypt hashing

### 2. **Add Courses**
- Navigate to "My Courses"
- Click "Add New Course"
- Fill in course name, category, and weekly target hours
- Track progress for each course

### 3. **Log Daily Habits**
- Go to "Daily Habit Tracker"
- Enter your daily metrics (sleep, study, mood, etc.)
- View your habit history in the History tab

### 4. **View Analytics**
- Check "Weekly Analytics" for insights
- Click "Generate AI Feedback" for personalized recommendations
- Monitor your progress trends

### 5. **Toggle Dark Mode**
- Use the theme toggle in the navbar (sun/moon icon)
- Theme preference is saved automatically

---

## 🎨 UI Components Used

- **Button**: Call-to-action buttons
- **Card**: Content containers
- **Input**: Form fields
- **Label**: Form labels
- **Textarea**: Multi-line inputs
- **Navigation Menu**: Main navigation
- **Progress**: Progress bars
- **Tabs**: Tabbed interfaces
- **Dialog**: Modal windows
- **Select**: Dropdown selections
- **Badge**: Status indicators
- **Avatar**: User avatars
- **Skeleton**: Loading placeholders
- **Switch**: Theme toggle

---

## 🔒 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses/add` - Add new course

### Habits
- `POST /api/habits/log` - Log daily habit
- `GET /api/habits/today` - Get today's habit
- `GET /api/habits/recent` - Get recent habits

### Analytics
- `GET /api/analytics/weekly-summary` - Get weekly summary
- `POST /api/analytics/ai-advice` - Get AI recommendations

---

## 🌟 Key Features in Detail

### Dark Mode Implementation
- Uses `next-themes` for seamless theme switching
- Respects system preferences
- Persistent theme selection
- Smooth transitions across all components

### Skeleton Loaders
- 1-second loading delay for better UX
- Skeleton cards mimic actual content structure
- Prevents layout shift

### Animations
- Page transitions: 0.8-0.9s
- Button interactions: 0.3s
- Card hovers: 0.5s
- Staggered children: 0.1-0.2s delay

### Color Palette
```
Light Mode:
- Background: zinc-50 (#fafafa)
- Cards: white
- Text: zinc-800
- Accents: zinc-600

Dark Mode:
- Background: zinc-950 (#09090b)
- Cards: zinc-900
- Text: zinc-100
- Accents: zinc-400
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**PathPilot Team**

---

## 🙏 Acknowledgments

- shadcn/ui for beautiful components
- Framer Motion for smooth animations
- Next.js team for the amazing framework
- Google Gemini AI for intelligent insights

---

## 🐛 Known Issues

- None reported yet!

---

## 🔮 Future Enhancements

- [ ] Mobile app version
- [ ] Study group features
- [ ] Calendar integration
- [ ] Export data to PDF/CSV
- [ ] Pomodoro timer integration
- [ ] Achievement badges system
- [ ] Social features (friend comparisons)
- [ ] Email notifications
- [ ] More AI insights and predictions

---

## 📞 Support

For support, email support@pathpilot.com or open an issue on GitHub.

---

**Made with ❤️ for students, by students**

*Start your journey to academic excellence today!* 🎓
