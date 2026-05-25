# StackVortex Pro

StackVortex Pro is a fully functional EdTech platform that enables users to create, consume, and rate educational content. The platform is built using the MERN stack (MongoDB, Express, React, Node.js) and aims to provide a seamless and interactive learning experience for students and instructors alike.

## 🚀 Features

### For Students
-   **Browse & Search:** Explore a wide range of courses across various categories.
-   **Course Enrollment:** Securely purchase and enroll in courses using Razorpay integration.
-   **Learning Dashboard:** Access enrolled courses, track progress, and view content.
-   **Video Player:** High-quality video streaming for course lectures.
-   **Rating & Reviews:** Rate courses and leave feedback for instructors.
-   **Cart Management:** Add multiple courses to the cart for a single checkout.

### For Instructors
-   **Course Creation:** Create new courses with detailed descriptions, thumbnails, and pricing.
-   **Content Management:**  Organize course content into sections and subsections (videos).
-   **Instructor Dashboard:** View detailed statistics on course sales, total revenue, and student enrollment.
-   **Edit & Delete:**  Manage existing courses and content.

### General
-   **Authentication:** Secure user registration and login via email/password and OTP verification.
-   **Role-Based Access:** Distinct features and dashboards for Students and Instructors.
-   **Profile Management:**  Update profile details, profile picture, and change password.
-   **Responsive Design:**  Fully responsive UI built with Tailwind CSS.

## 🛠️ Tech Stack

**Front-end:**
-   [React](https://reactjs.org/) - JS library for building user interfaces.
-   [Redux Toolkit](https://redux-toolkit.js.org/) - State management.
-   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework.
-   [React Router](https://reactrouter.com/) - declarative routing.
-   [Chart.js](https://www.chartjs.org/) - Data visualization for instructor dashboard.

**Back-end:**
-   [Node.js](https://nodejs.org/) - Runtime environment.
-   [Express.js](https://expressjs.com/) - Web application framework.
-   [MongoDB](https://www.mongodb.com/) - NoSQL database.
-   [Mongoose](https://mongoosejs.com/) - ODM for MongoDB.
-   [Cloudinary](https://cloudinary.com/) - Cloud storage for images and videos.
-   [Razorpay](https://razorpay.com/) - Payment gateway.
-   [Brevo](https://www.brevo.com/) - Transactional email API.

## 🏗️ System Architecture

The application follows a client-server architecture.
-   **Frontend:** The React application handles the user interface and interacts with the backend via RESTful APIs.
-   **Backend:** The Express server handles API requests, authenticates users, processes logic, and interacts with the database and external services (Cloudinary, Razorpay).
-   **Database:** MongoDB stores user data, course information, and transaction records.

For detailed flow diagrams of key processes (Authentication, Course Creation, Payment, etc.), please refer to [FLOW_DIAGRAMS.md](./FLOW_DIAGRAMS.md).

## ⚡ Getting Started

### Prerequisites
-   Node.js (v14 or higher)
-   MongoDB (Local or Atlas)
-   Cloudinary Account
-   Razorpay Account

### Environment Variables

You need to set up environment variables for both the client and the server.

**1. Server (`/Server/.env`):**
Create a `.env` file in the `Server` directory with the following:

```env
PORT=4000
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
BREVO_API_KEY=<your_brevo_api_key>
BREVO_SENDER_EMAIL=<verified_sender_email_in_brevo>
BREVO_SENDER_NAME=Aditya Singh - StackVortex
JWT_SECRET=<your_jwt_secret>
FOLDER_NAME=<cloudinary_folder_name>
RAZORPAY_KEY=<razorpay_key>
RAZORPAY_SECRET=<razorpay_secret>
CLOUD_NAME=<cloudinary_cloud_name>
API_KEY=<cloudinary_api_key>
API_SECRET=<cloudinary_api_secret>
```

**2. Client (`/.env`):**
Create a `.env` file in the root directory (if required by specific client integrations, though typically React apps verify keys via the backend or use `REACT_APP_` prefixed variables).
*Note: Ensure your backend URL is correctly configured in the frontend service files.*

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/StackVortexPro.git
    cd StackVortexPro
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies:**
    ```bash
    cd Server
    npm install
    cd ..
    ```

### Running the Application

1.  **Start the Backend Server:**
    ```bash
    cd Server
    npm run dev
    ```
    The server will start on `http://localhost:4000`.

2.  **Start the Frontend Application:**
    Open a new terminal in the root directory:
    ```bash
    npm start
    ```
    The application will run on `http://localhost:3000`.

Alternatively, if you have `concurrently` set up in the root `package.json`:
```bash
npm run dev
```
(This will start both client and server).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
