# USIU Campus Events - React Frontend

Modern React + TypeScript frontend with blue (#1E40AF) and cream (#F5E6D3) color scheme.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

The app will open at **http://localhost:3000**

### 3. Make sure Backend is Running
Backend should be running at **http://localhost:8080**

## ✨ Features

- ✅ React 18 + TypeScript
- ✅ React Router for navigation
- ✅ Axios for API calls
- ✅ JWT authentication
- ✅ Role-based dashboards (Admin, Organizer, Student)
- ✅ Event browsing and registration
- ✅ Smart recommendations for students
- ✅ Event details modal
- ✅ Real-time notifications panel
- ✅ Responsive design
- ✅ Blue & cream color scheme

## 🎯 Demo Accounts

Use the quick login buttons:
- **Admin:** admin@usiu.ac.ke / Admin@12345
- **Student (Melat):** melat.desta@student.usiu.ac.ke / Student@12345
- **Organizer:** amina.organizer@usiu.ac.ke / Organizer@12345

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Navbar.tsx
│   ├── EventCard.tsx
│   ├── EventModal.tsx
│   └── NotificationsPanel.tsx
├── pages/              # Page components
│   ├── Login.tsx
│   └── Dashboard.tsx
├── services/           # API service layer
│   └── api.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main app with routing
└── index.tsx           # Entry point
```

## 🎨 Color Scheme

- Primary Blue: #1E40AF
- Dark Blue: #1E3A8A
- Light Blue: #3B82F6
- Cream: #F5E6D3
- Dark Cream: #E8D4BA

## 🔧 Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 📦 Build for Production

```bash
npm run build
```

The optimized build will be in the `build/` folder.

## 🌐 API Configuration

API base URL is configured in `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

## 🛠️ Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling
- **Font Awesome** - Icons

---

**Built with ❤️ using React + TypeScript**
