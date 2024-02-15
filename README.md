
# StaffScanner

## Overview
StaffScanner is a Node.js-based back-end application designed to streamline the management and tracking of staff within an organization. Utilizing MongoDB for data storage, this application provides a robust solution for handling staff data, including personal details, attendance records, and performance metrics.

## Features
- **Staff Management:** Add, update, and remove staff member details.
- **Attendance Tracking:** Record and monitor staff attendance.
- **Performance Evaluation:** Evaluate and track staff performance over time.
- **Secure Authentication:** Secure login mechanisms for staff and administrators.
- **API Endpoints:** RESTful API endpoints for easy integration with front-end applications or third-party services.

## Server Architecture 
This picture shows the architecture of how the NodeJS Server deals with HTTP requests and other layers of the system.

![Server Arch](https://github.com/MujahedTwair/staffScanner/assets/135132989/3bcd32a9-aacf-4095-9722-933f5caa8b40)

## Getting Started

### Prerequisites
- Node.js (Version 12.x or higher recommended)
- MongoDB (Version 4.x or higher recommended)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/MujahedTwair/staffScanner.git
```

2. Navigate to the project directory:
```bash
cd staffScanner
```

3. Install the necessary dependencies:
```bash
npm install
```

4. Configure your MongoDB connection string and other variables in the `.env` file. If `.env` does not exist, create it in the root directory and add fill the following data:
```
DB_GLOBAL=''
LOGINCOMPANY=''
SALT_ROUND=8
LOGINEMPLOYEE=''
BEARERKEY=''
api_key=""
api_secret=""
APP_NAME=""
cloud_name=""
Time_Zone=''
```

5. Start the application:
```bash
npm start
```

The application should now be running and accessible on `localhost:3000` (or another port if configured differently).

## Usage and Documentation

After starting the application, you can use tools like Postman or any HTTP client to interact with the API endpoints. Here my Postamn documentation:
https://documenter.getpostman.com/view/28553004/2s9YRCXWux

