# 🌱 GreenGrid – Smart Waste Management System

GreenGrid is a web-based Smart Waste Management System aimed at improving waste collection, coordination, and monitoring through a centralized digital platform.

The project aims to simplify waste management operations by bringing together customers, waste collectors, and administrators in a single application.

> 🚧 **Project Status: Under Development**
>
> GreenGrid is currently under development. Core application modules are being built and progressively enhanced, with a focus on database integration, functional workflows, and smarter waste management.

## 🎯 Project Objective

Traditional waste management processes often face challenges such as inefficient collection coordination, limited monitoring, and fragmented information.

GreenGrid aims to address these challenges by providing a centralized platform where waste collection activities can be managed and monitored more efficiently.

## ✨ Key Features

The application is being developed around the following modules:

- **Customer Module:** Interface for submitting and viewing waste pickup requests.
- **Collector Module:** Interface for managing assigned collection activities.
- **Administrator Module:** Dashboard for overseeing waste management operations.
- **Truck Management:** Module for managing waste collection vehicles and assignments.
- **Waste Monitoring:** Tracking collected waste quantities and disposal records.
- **AI-Assisted Waste Sorting:** Exploring AI-based assistance for identifying and sorting different waste categories.
- **Data Analytics:** Insights into waste collection and management activities.

*Note: These represent the project's intended functionality. Features are being implemented progressively.*

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| AI Integration | Google Gemini API |
| Development Language | TypeScript |

## 🏗️ Application Architecture

GreenGrid follows a client-server architecture.

1. **Frontend:** React provides the user interface and dashboard views.
2. **Backend:** Express.js handles API requests and application logic.
3. **Database:** MongoDB Atlas is being integrated for persistent data storage.
4. **AI Integration:** Google Gemini API supports AI-assisted waste sorting functionality.

## 📁 Project Structure

```text
GreenGrid/
│
├── config/
│   └── database.ts
│
├── src/
│   ├── components/
│   ├── App.tsx
│   ├── mockData.ts
│   └── types.ts
│
├── server.ts
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MongoDB Atlas account
- Google Gemini API key (for AI functionality)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/GreenGrid.git
```

### 2. Navigate to the Project Directory

```bash
cd GreenGrid
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project's root directory.

Add the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

Replace the placeholder values with your actual credentials.

**Important:** Never commit your `.env` file or expose API keys and database credentials publicly.

### 5. Start the Development Server

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

## 🚧 Development Roadmap

The following improvements are planned as the project progresses:

- [ ] Persistent application data storage using MongoDB.
- [ ] User authentication and role-based access control.
- [ ] Functional pickup request management.
- [ ] Truck and collector assignment workflows.
- [ ] GPS-based vehicle tracking.
- [ ] Waste collection and disposal record management.
- [ ] Data-driven analytics and reporting.
- [ ] Improved collection and route optimization.

## 🔮 Future Enhancements

- Real-time vehicle location updates.
- Smarter waste collection planning.
- Advanced waste analytics and reporting.
- AI-assisted waste classification and recommendations.
- Improved operational monitoring.

## 🤝 Contribution

GreenGrid is being developed as an academic project. Suggestions and feedback for improving the system are welcome.

## 👩‍💻 Developer

**Srujana RV**

Computer Science and Engineering  
Vasavi College of Engineering

---

*GreenGrid – Towards smarter and more efficient waste management.*
