# 🎉 Your Campus Event Management System is Ready to Launch!

## ✅ Installation Status: COMPLETE

### What's Installed:
- ✅ **Java 21** (version 21.0.12)
- ✅ **Apache Maven** (version 3.9.16)
- ✅ **MySQL** (version 9.7.2)
- ✅ **Database Created**: `usiu_events`
- ✅ **Project Compiled**: 124 source files, **BUILD SUCCESS**

---

## 🚀 How to Launch the Application

### Option 1: Using PowerShell Script (Easiest)
```powershell
# Navigate to project folder
cd "C:\Users\KALEB DESTA\Desktop\Melat's Project"

# Run the startup script
.\run-app.ps1
```

### Option 2: Manual Command
```powershell
# Set PATH variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Navigate to project
cd "C:\Users\KALEB DESTA\Desktop\Melat's Project"

# Run the application
mvn spring-boot:run
```

### Option 3: Using the JAR file (Fastest after first build)
```powershell
# Build JAR (first time only)
mvn clean package -DskipTests

# Run the JAR
java -jar target/campus-event-management-0.0.1-SNAPSHOT.jar
```

---

## ⏱️ First Startup

**Note**: The first time you run `mvn spring-boot:run`, it will:
1. Download additional dependencies (1-2 minutes)
2. Run Flyway migrations to create database tables
3. Seed initial data (schools, programs, users, events)
4. Harden demo passwords using BCrypt
5. Start the Spring Boot application

**Look for this in the console:**
```
Started CampusEventManagementApplication in X.XXX seconds
```

---

## 🌐 Access Your Application

Once the application is running, open your browser:

### Swagger API Documentation:
```
http://localhost:8080/swagger-ui.html
```

### API Base URL:
```
http://localhost:8080/api/v1
```

### WebSocket Endpoint:
```
ws://localhost:8080/ws/notifications
```

---

## 🧪 Test the Application

### 1. Using Swagger UI (Recommended):

1. Go to http://localhost:8080/swagger-ui.html
2. Find `AuthController` → `POST /api/v1/auth/login`
3. Click "Try it out"
4. Enter credentials:
   ```json
   {
     "email": "admin@usiu.ac.ke",
     "password": "Admin@12345"
   }
   ```
5. Click "Execute"
6. Copy the `accessToken` from the response
7. Click the **"Authorize"** button at the top right
8. Enter: `Bearer YOUR_ACCESS_TOKEN`
9. Click "Authorize"
10. Now you can test any endpoint!

### 2. Demo Accounts:

| Role | Email | Password |
|------|-------|----------|
| **Administrator** | admin@usiu.ac.ke | Admin@12345 |
| **Club Organizer** | amina.organizer@usiu.ac.ke | Organizer@12345 |
| **Club Organizer** | brian.organizer@usiu.ac.ke | Organizer@12345 |
| **Student** | melat.desta@student.usiu.ac.ke | Student@12345 |
| **Student** | kevin.njoroge@student.usiu.ac.ke | Student@12345 |

### 3. Test Endpoints:

#### Get Events:
```http
GET http://localhost:8080/api/v1/events
Authorization: Bearer YOUR_TOKEN
```

#### Student Dashboard (Personalized Recommendations):
```http
GET http://localhost:8080/api/v1/events/dashboard
Authorization: Bearer STUDENT_TOKEN
```

#### Get Your Notifications:
```http
GET http://localhost:8080/api/v1/notifications
Authorization: Bearer YOUR_TOKEN
```

---

## 📊 Features Available

### ✅ What Works:
- **Authentication & Authorization** (JWT-based)
- **Event Management** (Create, Approve, Publish, Cancel)
- **Student Registration** for events
- **Smart Recommendations** (Based on school, program, year)
- **Real-time Notifications** (WebSocket + Email)
- **Favorites** (Bookmark events)
- **Attendance Tracking**
- **Analytics Dashboard** (Admin only)
- **Complete REST API** with Swagger docs

### 🎯 Seeded Data:
- 5 Schools (SST, CSB, SHSS, SPHS, SCCCA)
- 22 Academic Programs
- 8 Demo Users (1 Admin, 2 Organizers, 5 Students)
- 4 Student Clubs
- 10 Event Categories
- 5 Venues
- 4 Sample Events
- Sample registrations and notifications

---

## 🛠️ Useful Commands

### Check Application Status:
```powershell
# Check if port 8080 is in use
netstat -ano | findstr :8080
```

### Stop the Application:
- Press `Ctrl+C` in the terminal where the app is running

### Rebuild After Code Changes:
```powershell
mvn clean compile
mvn spring-boot:run
```

### View Database:
```powershell
mysql -u root -p
USE usiu_events;
SHOW TABLES;
```

---

## 📖 Documentation

All documentation is in the `docs/` folder:

- **ERD.md** - Entity Relationship Diagram
- **UML.md** - UML Class Diagram
- **DATABASE_SCHEMA.md** - Complete database schema
- **API_EXAMPLES.md** - API request/response examples
- **VERIFICATION_REPORT.md** - Complete feature verification
- **SETUP_GUIDE.md** - Detailed setup instructions

---

## ❓ Troubleshooting

### "Port 8080 already in use"
```powershell
# Find and kill the process
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### "Can't connect to MySQL"
```powershell
# Check if MySQL is running
mysql --version

# If using XAMPP, start MySQL from XAMPP Control Panel
```

### "mvn: command not found"
```powershell
# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Close and reopen PowerShell
```

### Database Reset:
```powershell
mysql -u root
DROP DATABASE usiu_events;
CREATE DATABASE usiu_events CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Restart the application - Flyway will recreate everything
```

---

## 🎓 Next Steps

1. ✅ **Launch the application** using one of the methods above
2. ✅ **Access Swagger UI** at http://localhost:8080/swagger-ui.html
3. ✅ **Login** with a demo account
4. ✅ **Explore the API** and test different endpoints
5. 📖 **Read the documentation** in the `docs/` folder
6. 🔧 **Customize** the application for your needs
7. 🚀 **Deploy** to a production server when ready

---

## 💡 Tips

- **Use Swagger UI** for easy API testing (no need for Postman initially)
- **Check the logs** in the console for detailed information
- **Notifications** are sent via WebSocket (connect to `/ws/notifications`)
- **Email notifications** are disabled by default (set `EMAIL_NOTIFICATIONS_ENABLED=true` to enable)
- **All passwords** are encrypted with BCrypt
- **JWT tokens** expire after 24 hours

---

## 📞 Need Help?

- Check **VERIFICATION_REPORT.md** for feature details
- Check **SETUP_GUIDE.md** for detailed setup instructions
- Check **API_EXAMPLES.md** for API usage examples
- Check **DATABASE_SCHEMA.md** for database structure

---

**Ready!** Run `.\run-app.ps1` and access http://localhost:8080/swagger-ui.html 🚀

**Build Status**: ✅ **SUCCESS** (124 files compiled)  
**Database**: ✅ **READY** (usiu_events created)  
**Dependencies**: ✅ **DOWNLOADED**  
**Status**: ✅ **READY TO LAUNCH**
