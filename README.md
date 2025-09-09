# 🚀 WorkNest – Task Management Application

**WorkNest** is a full-stack Task Management & Collaboration Platform that helps teams organize tasks, manage projects, and collaborate in real-time with notifications and role-based access.  

📌 Built as part of the **Full-Stack Development Internship Project**.

Live on - https://worknest-delta.vercel.app/

See how it look like

<img width="1920" height="1080" alt="Screenshot (90)" src="https://github.com/user-attachments/assets/fd8bd221-82b1-4390-b4e8-4a229ccea83c" />

<img width="1920" height="1080" alt="Screenshot (78)" src="https://github.com/user-attachments/assets/7c767410-8f5b-4473-91b4-00855518b844" />



<img width="1920" height="1080" alt="Screenshot (87)" src="https://github.com/user-attachments/assets/add23722-a0db-4f69-90c5-20d13e5ad567" />

<img width="1920" height="1080" alt="Screenshot (68)" src="https://github.com/user-attachments/assets/ef93998e-bf74-473f-91a1-d8c717520658" />


<img width="1920" height="1080" alt="Screenshot (64)" src="https://github.com/user-attachments/assets/e7b8b314-14ae-4a04-9f2e-7091f405b79f" />



---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure login with JWT
- Google OAuth integration
- Role-based access (Admin, Member, Guest)

### 📂 Organizations & Projects
- Create organizations & invite members
- Manage projects under each organization
- Role-based membership management

### ✅ Task Management
- Create, assign, and update tasks
- Track progress across boards & columns
- Drag-and-drop Kanban board

### 🔔 Real-time Notifications
- Socket.io powered instant updates
- Notifications for task assignment, comments, and invites

### 💬 Collaboration (Future)
- In-app comments & discussions on tasks
- Mention team members with `@username`

### 🎨 UI/UX
- Fully responsive (mobile-first)
- Clean, modern dashboard with dark mode support

### ⚡ Performance & Security
- API rate limiting
- Protected routes for secure access
- Guest mode with read-only access

---

## 🛠️ Tech Stack

**Frontend**
- React + TypeScript
- TailwindCSS (UI styling)
- Framer Motion (animations)
- Socket.io-client (real-time updates)
- Axios (API calls)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication
- Socket.io for real-time notifications
- Passport (Google OAuth)

**DevOps & Tools**
- GitHub Actions (CI/CD pipeline)
- Vercel (Frontend Deployment)
- Render / Railway (Backend Deployment)
- ESLint + Prettier (Code Quality)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/worknest.git
cd worknest
```

2. Backend Setup
```
cd backend
npm install
```


Create .env file in backend/:
```

MONGO_URI=mongodb://localhost:27017/worknest
JWT_SECRET=supersecret
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx
```

Run backend:

npm start


3. Frontend Setup
```
cd frontend
npm install
```

Create .env file in frontend/:
```

VITE_API_BASE=http://localhost:8000/api
```


Run frontend:
```

npm run dev
```

🚦 CI/CD Pipeline

✅ GitHub Actions configured for:

Run linting & tests on every push

Build frontend & backend

Automatic deployment:

Frontend → Vercel

Backend → Render / Railway

📈 Future Enhancements

💬 Enhanced Collaboration

Full-featured comments & discussions on tasks

Advanced mentions and notifications for team members

📨 Improved Invitation System

Dynamic invitation workflows with role assignments

Email and in-app notifications

⚡ CI/CD Enhancements

Automated testing for backend & frontend

Canary releases for safer deployments

📹 Video Meeting Integration

Zoom / Google Meet APIs for in-app calls

📊 Analytics Dashboard

Insights on project progress, task completion, and team performance

📱 Mobile App

React Native or Flutter app for iOS & Android

🔗 3rd Party Integrations

Slack, Google Drive, Jira, etc.

🤖 AI Task Suggestions

Auto-assign tasks based on workload and priorities

Note: footer , help & support , Contact route are initial Blank you make manually add it . 

🤝 Contributing

Fork the repository

Create a feature branch

git checkout -b feature/awesome


Commit your changes

git commit -m "Add awesome feature"


Push the branch

git push origin feature/awesome


Create a Pull Request 🎉

📜 License

MIT © 2025 [Ayush Updhayay]


---

If you want, I can also create a **shorter, eye-catching version** with badges (like GitHub stars, deployments, issues) and visuals for `README.md`
