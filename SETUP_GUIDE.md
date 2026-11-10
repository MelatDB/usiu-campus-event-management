# Campus Event Management System - Setup Guide for Windows

## ✅ Already Installed
- **Java 21** ✅ (version 21.0.12)

## 📦 Required Installations

### 1. Apache Maven (Build Tool)

**Option A: Using Chocolatey (Recommended - Easiest)**
```powershell
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Maven
choco install maven -y
```

**Option B: Manual Installation**
1. Download Maven from: https://maven.apache.org/download.cgi
   - Download `apache-maven-3.9.9-bin.zip`
2. Extract to `C:\Program Files\Apache\maven`
3. Add to PATH:
   - Right-click "This PC" → Properties → Advanced system settings
   - Click "Environment Variables"
   - Under "System variables", find "Path", click "Edit"
   - Click "New" and add: `C:\Program Files\Apache\maven\bin`
   - Click OK on all dialogs
4. **Restart your terminal/PowerShell**
5. Verify: `mvn -version`

**Option C: Using Winget (Windows Package Manager)**
```powershell
winget install --id Apache.Maven
```

---

### 2. MySQL Database Server

**Option A: Using Chocolatey**
```powershell
choco install mysql -y
```

**Option B: Manual Installation**
1. Download MySQL Community Server from: https://dev.mysql.com/downloads/mysql/
   - Choose Windows (x86, 64-bit), MSI Installer
   - Download `mysql-installer-community-8.x.x.msi`
2. Run the installer:
   - Choose "Custom" installation
   - Select: MySQL Server 8.x
   - Click "Next" → "Execute" to install
3. Configuration:
   - **Root Password**: Choose a password (e.g., `password`)
   - **Port**: Keep default `3306`
   - **Windows Service**: Check "Start MySQL Server at System Startup"
4. Complete the installation
5. Add MySQL to PATH:
   - Add `C:\Program Files\MySQL\MySQL Server 8.x\bin` to PATH
6. **Restart your terminal/PowerShell**
7. Verify: `mysql --version`

**Option C: Using XAMPP (Includes MySQL)**
1. Download from: https://www.apachefriends.org/
2. Install XAMPP
3. Start MySQL from XAMPP Control Panel
4. Default credentials: `root` / (no password)

**Option D: Docker (Advanced)**
```powershell
docker run --name mysql-usiu -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=usiu_events -p 3306:3306 -d mysql:8
```

---

## 🔧 After Installation

### Step 1: Verify All Tools
```powershell
# Check Java
java -version
# Should show: java version "21.0.12"

# Check Maven
mvn -version
# Should show: Apache Maven 3.9.x

# Check MySQL
mysql --version
# Should show: mysql Ver 8.x
```

### Step 2: Configure MySQL Database
```powershell
# Connect to MySQL (enter password when prompted)
mysql -u root -p

# Inside MySQL console, run:
CREATE DATABASE IF NOT EXISTS usiu_events CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Step 3: Configure Application Properties

The application is already configured with sensible defaults. You only need to update if your MySQL password is different:

**File**: `src/main/resources/application.properties`

```properties
# Update these if needed:
spring.datasource.url=jdbc:mysql://localhost:3306/usiu_events?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Africa/Nairobi
spring.datasource.username=root
spring.datasource.password=password
```

**Using Environment Variables (Better for security):**
```powershell
# Set environment variables (for current session)
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
$env:JWT_SECRET="Y2FtcHVzLWV2ZW50LW1hbmFnZW1lbnQtc3lzdGVtLXNlY3JldC1rZXktMzItYnl0ZXM="
```

---

## 🚀 Launch the Application

### Build and Run

```powershell
# Navigate to project directory
cd "c:\Users\KALEB DESTA\Desktop\Melat's Project"

# Clean and compile
mvn clean compile

# Run the application
mvn spring-boot:run
```

**Alternative: Package and Run JAR**
```powershell
# Build JAR file
mvn clean package -DskipTests

# Run the JAR
java -jar target/campus-event-management-0.0.1-SNAPSHOT.jar
```

### Expected Output
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.3.5)

... Starting CampusEventManagementApplication ...
... Started CampusEventManagementApplication in X.XXX seconds
```

### Access the Application

Once running, open your browser:

**Swagger API Documentation:**
```
http://localhost:8080/swagger-ui.html
```

**WebSocket Endpoint:**
```
ws://localhost:8080/ws/notifications
```

**API Base URL:**
```
http://localhost:8080/api/v1
```

---

## 🧪 Test the Application

### 1. Login with Demo Account

**Using Swagger UI:**
1. Go to http://localhost:8080/swagger-ui.html
2. Find `AuthController` → `/api/v1/auth/login`
3. Click "Try it out"
4. Use demo credentials:

```json
{
  "email": "admin@usiu.ac.ke",
  "password": "Admin@12345"
}
```

5. Copy the `accessToken` from response
6. Click "Authorize" button at top
7. Enter: `Bearer YOUR_ACCESS_TOKEN`
8. Now you can test all endpoints!

**Using cURL:**
```powershell
# Login
curl -X POST http://localhost:8080/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@usiu.ac.ke\",\"password\":\"Admin@12345\"}'

# Get events
curl -X GET http://localhost:8080/api/v1/events `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@usiu.ac.ke | Admin@12345 |
| Club Organizer | amina.organizer@usiu.ac.ke | Organizer@12345 |
| Club Organizer | brian.organizer@usiu.ac.ke | Organizer@12345 |
| Student | melat.desta@student.usiu.ac.ke | Student@12345 |
| Student | kevin.njoroge@student.usiu.ac.ke | Student@12345 |

---

## 🛠️ Troubleshooting

### Problem: "Port 8080 already in use"
**Solution:**
```powershell
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change the port in application.properties
server.port=8081
```

### Problem: "Access denied for user 'root'@'localhost'"
**Solution:**
```powershell
# Reset MySQL root password
mysql -u root

# Inside MySQL:
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;
EXIT;
```

### Problem: "Table doesn't exist"
**Solution:**
Flyway will automatically create tables on first run. If issues persist:
```powershell
# Drop and recreate database
mysql -u root -p
DROP DATABASE usiu_events;
CREATE DATABASE usiu_events CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Restart the application
mvn spring-boot:run
```

### Problem: Maven build fails
**Solution:**
```powershell
# Clear Maven cache and rebuild
mvn clean install -U

# Skip tests if failing
mvn clean install -DskipTests
```

---

## 📱 Development Tools (Optional)

### IntelliJ IDEA (Recommended IDE)
- Download: https://www.jetbrains.com/idea/download/
- Open the project folder
- Wait for Maven dependencies to download
- Right-click `CampusEventManagementApplication.java` → Run

### VS Code
```powershell
# Install extensions
code --install-extension vscjava.vscode-java-pack
code --install-extension pivotal.vscode-boot-dev-pack
```

### Postman (API Testing)
- Download: https://www.postman.com/downloads/
- Import the API documentation from Swagger

---

## 🔐 Security Notes

1. **Change Default Passwords** in production
2. **Generate New JWT Secret:**
   ```powershell
   # Generate 256-bit secret
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```
3. **Enable SSL/TLS** for production deployment
4. **Use Environment Variables** for sensitive data

---

## 📚 Next Steps

1. ✅ Install Maven and MySQL
2. ✅ Configure database credentials
3. ✅ Run `mvn spring-boot:run`
4. ✅ Access Swagger UI
5. ✅ Test with demo accounts
6. 📖 Read API documentation in `docs/API_EXAMPLES.md`
7. 🔧 Customize for your needs
8. 🚀 Deploy to production server

---

## 🆘 Need Help?

- Check logs in console output
- Review `VERIFICATION_REPORT.md` for feature details
- Check `README.md` for architecture overview
- Review API examples in `docs/API_EXAMPLES.md`

**Common Commands Reference:**
```powershell
# Start application
mvn spring-boot:run

# Build without tests
mvn clean package -DskipTests

# Run tests
mvn test

# Clean build
mvn clean

# Check dependencies
mvn dependency:tree
```

---

**Ready to launch!** 🚀
