# AwasarHub

AwasarHub is a professional networking platform designed to connect individuals with career opportunities and jobs. It features a modern, responsive interface and a robust backend to handle user interactions, job postings, and content discovery.

## 🚀 Features

- **User Authentication**: Secure Registration and Login using JWT (JSON Web Tokens) with automatic token refreshing.
- **Dynamic Feed**: A personalized global feed that aggregates Jobs and Opportunities.
- **Filtering & Sorting**: Filter feed items by type (Jobs/Opportunities) and sort by Recency or Popularity.
- **Job & Opportunity Management**: Users can post and view detailed job listings and opportunities.
- **Engagement**: (Backend support) Like, comment, and share posts.
- **User Profiles**: View user profiles and their posted content.
- **Modern UI**: Built with React and Tailwind CSS, featuring a clean, responsive design with Dark Mode support.
- **Interactive Elements**: Smooth animations using Framer Motion.

## 🛠️ Tech Stack

### Backend
- **Framework**: Django & Django REST Framework (DRF)
- **Authentication**: `djangorestframework-simplejwt`
- **Database**: SQLite (Development) / PostgreSQL (Production ready)
- **CORS**: `django-cors-headers`

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **State Management**: React Context API (AuthContext, ThemeContext)
- **Routing**: React Router DOM
- **HTTP Client**: Axios (with interceptors for token management)
- **Icons**: React Icons
- **Animations**: Framer Motion
- **Utilities**: Date-fns (Date formatting)

## 📂 Project Structure

```
AwasarHub/
├── backend/                # Django Backend
│   ├── accounts/           # User authentication & profiles
│   ├── feed/               # Feed aggregation logic
│   ├── jobs/               # Job posting models & views
│   ├── opportunities/      # Opportunity models & views
│   ├── engagement/         # Likes, comments, shares
│   ├── awasarhub/          # Project settings & configuration
│   ├── manage.py           # Django CLI entry point
│   └── requirements.txt    # Python dependencies
│
└── frontend/               # React Frontend
    ├── src/
    │   ├── api/            # API client configuration
    │   ├── components/     # Reusable UI components
    │   ├── context/        # Auth & Theme providers
    │   ├── pages/          # Application pages (Feed, Login, etc.)
    │   └── App.jsx         # Main application component
    ├── package.json        # Node dependencies
    ├── tailwind.config.js  # Tailwind configuration
    └── vite.config.js      # Vite configuration
```

## ⚡ Getting Started

### Prerequisites
- Python 3.8+
- Node.js & npm

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the server:
   ```bash
   python manage.py runserver
   ```
   The API will be available at `http://127.0.0.1:8000`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 🔑 Key Functionalities

- **Smart "Apply Now" Button**: Automatically handles missing protocols (e.g., adds `https://`) and disables itself if no link is provided.
- **Auto-Logout Prevention**: The frontend automatically refreshes the access token silently when it expires, preventing unexpected logouts.
- **Password Visibility**: Users can toggle password visibility in Login and Register forms.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the Khem Bahadur Lodh License.
