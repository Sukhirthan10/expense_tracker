
---

## Expense Tracker by Sukhirthan

A full-stack expense tracker built with **Node.js**, **Express**, **MongoDB**, and **React**. Users can register, login, add and delete expenses, view detailed analytics and visualizations all tailored to their spending patterns.

---

### Features

* **User Authentication**: Secure login and registration using JWT and bcrypt.
* **Add Expenses**: Input title, amount, category (select or custom), and date/time (defaults to current but editable).
* **Monthly View**: Expenses are grouped by month with totals displayed.
* **Category Breakdown**: Pie chart showing distribution of expenses—filterable by month or all-time.
* **Responsive UI**: Easily readable, clean layout with logout functionality positioned at top-right.

---

### Folder Structure (approximate)

```
backend/           # Server-side code (Express + MongoDB)
frontend/          # React app with charts and authentication UI
README.md          # This file!
```

---

### Getting Started

## Installation

### 1. Clone the repo

```bash
git clone https://github.com/Sukhirthan10/expense_tracker.git
cd expense_tracker
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Required Packages

* express
* mongoose
* cors
* bcryptjs
* jsonwebtoken
* dotenv

Dev dependency:

* nodemon

#### Start backend

```bash
npx nodemon server.js
```

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

#### Required Packages

* axios
* recharts

#### Start frontend (Vite)

```bash
npm run dev
```

---

### 4. MongoDB Setup

If using **local MongoDB** on Ubuntu:

```bash
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

### Usage

1. Open the app in your browser.
2. **Register** a new account or **Log in**.
3. In the dashboard:

   * **Add a new expense** with title, amount, category, and date/time.
   * **View expenses grouped by month**, with monthly totals.
   * Use the **pie chart** to visualize spending by category (for all time or a specific month).
4. **Logout** from the top-right corner to return to the login screen.

---

### Customization & Maintenance

* **Add categories** by choosing “Other” and typing a custom one.
* **Filter charts** by switching between “All Time” or specific months.
* Default date/time is automatically set to the current moment but editable as needed.

---

### Technologies Used

| Layer    | Tech Stack                          |
| -------- | ----------------------------------- |
| Backend  | Node.js, Express, MongoDB, Mongoose |
| Auth     | JWT, bcrypt                         |
| Frontend | React, Recharts, Fetch API          |
| Styling  | Inline styles (customizable)        |

---

### Future Enhancements

* Use third party api to get spend information directly from payment apps.
* Add bar charts or other visualizations for monthly trends.
* Improve styling using a CSS framework like Tailwind or Material UI.
* Add category filters and search on the frontend.
* Enable user profile display and extended analytics.

---

### Credits

Created and maintained by **Sukhirthan**. If you'd like to contribute or collaborate, feel free to open an issue or pull request.

---
