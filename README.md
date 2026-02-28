# 🏗️ Seven Directions ERP

> A full-stack, production-ready **Enterprise Resource Planning (ERP)** system built with **Next.js 16** and **MongoDB**. Designed for construction & field-based businesses to manage projects, employees, payroll, assets, attendance, quotations, and on-site foreman operations — all from a single, elegant dashboard.

---

## ✨ Features

### 📊 Dashboard
- Top-level KPI stats (active projects, employee count, payroll summaries)
- Interactive **sales/financials chart** powered by Recharts
- Recent orders/activity widget
- Built-in **calendar** view
- Brand splash-screen loader on first visit (session-aware)

### 📁 Project Management
- Create, update, and close projects with client info, location & budget
- Track **income** and **expenses** per project with timestamped entries
- Link invoices to project expenses
- View active vs. completed projects at a glance
- Status workflow: `Active → Completed`

### 👷 Employee Management
- Full employee registry with Iqama number, nationality, role, and joining date
- Active/Inactive status toggle
- Per-employee expense/claim tracking
- Field tracking view for on-site employees

### 💰 Payroll & Salary
- Create **salary lists** grouping multiple employees per pay period
- Per-employee salary records with:
  - Base salary + allowances
  - Absent-day deductions (auto-calculated)
  - Manual ad-hoc expense deductions
  - Linked loan/advance deductions from the expense database
- Salary status: `Pending → Paid` with paid date recording
- Historical salary snapshots preserved per record

### 🏭 Company Assets
- Register assets (heavy machinery, vehicles, equipment) with serial numbers
- Status tracking: `Operational / Maintenance / Repair / Inactive / Sold`
- **Project assignment** — assign assets to active projects
- Full **assignment history** log (project, assigned date, unassigned date, notes)

### 📅 Attendance
- Mark daily attendance: `Present / Absent / Leave / Not Marked`
- Link attendance records to specific projects
- Compound index prevents duplicate entries for the same employee on the same day
- Attendance history with full search and filter

### 📄 Quotations
- Create and manage client quotations with reference numbers
- Upload and store **quotation documents** via Cloudinary
- Status pipeline: `Draft → Sent → Accepted → Rejected`

### 👨‍🔧 Foreman Management
- Assign foreman (from employee pool) to specific projects
- **Cash ledger** per foreman:
  - Log amounts sent (Cash, Bank Transfer, UPI)
  - Log invoices/bills received back
- Auto-calculated `totalSent`, `totalInvoiced`, and `remainingBalance` via pre-save hook
- Expense categorization (Local Labor, Hardware, Fuel, etc.)

### 👤 User & Access Management
- Multi-user system with role-based access
- Secure password hashing with **bcryptjs**
- JWT-based authentication using **jose**
- User profile management

### ⚙️ Personalization & Settings
- **10 theme colors** via DaisyUI (light, dark, and more)
- **10 Google Font choices**: Inter, Poppins, Roboto, Montserrat, Open Sans, Lato, Nunito, Raleway, Source Sans 3, Playfair Display
- Preferences persisted in `localStorage`
- **Bilingual UI**: English 🇬🇧 and Urdu 🇵🇰 via `next-intl`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | JavaScript (React 19) |
| **Database** | [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [DaisyUI v5](https://daisyui.com/) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **File Storage** | [Cloudinary](https://cloudinary.com/) |
| **Email** | [Nodemailer](https://nodemailer.com/) |
| **Authentication** | [jose](https://github.com/panva/jose) (JWT) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **HTTP Client** | [Axios](https://axios-http.com/) |
| **Internationalization** | [next-intl](https://next-intl-docs.vercel.app/) |
| **Date Utilities** | [Day.js](https://day.js.org/) |
| **Spreadsheet Export** | [xlsx](https://sheetjs.com/) |
| **SFTP** | [ssh2-sftp-client](https://github.com/theophilusx/ssh2-sftp-client) |
| **Notifications** | [react-hot-toast](https://react-hot-toast.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Counters** | [react-countup](https://github.com/glennreyes/react-countup) |

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── (admin)/Dashboard/      # Admin dashboard routes
│   │   ├── Attendance/         # Attendance marking & history
│   │   ├── Company-Assets/     # Asset registry & tracking
│   │   ├── Employees/          # Employee management
│   │   ├── Foremans/           # Foreman cash ledger
│   │   ├── Profile/            # User profile
│   │   ├── Projects/           # Project management & P&L
│   │   ├── Quotations/         # Quotation management
│   │   ├── Salary/             # Payroll & salary lists
│   │   ├── Setting/            # Theme, font, app settings
│   │   ├── Users/              # System user management
│   │   ├── layout.js           # Dashboard shell (sidebar + header + footer)
│   │   └── page.js             # Main dashboard overview
│   ├── (user)/                 # Public / login routes
│   └── api/                    # Next.js API Routes (REST)
│       ├── assets/
│       ├── attendance/
│       ├── employee/
│       ├── project/
│       ├── quotation/
│       ├── salary/
│       ├── top-stats/
│       └── user/
├── Components/                 # 44 reusable React components
├── lib/                        # Utility singletons
│   ├── cloudinary.js
│   ├── mongodb.js
│   ├── nodemailer.js
│   ├── toast.js
│   └── utils.js
├── locales/
│   ├── en.json                 # English translations
│   └── ur.json                 # Urdu translations
├── models/                     # Mongoose schemas
│   ├── companyAssets.js
│   ├── employee.js
│   ├── employeeAttendance.js
│   ├── employeeExpenses.js
│   ├── employeeSalary.js
│   ├── foreman.js
│   ├── project.js
│   ├── quotation.js
│   ├── salaryList.js
│   └── user.js
└── stores/                     # Zustand global stores
    ├── fontStore.js
    ├── language.js
    └── userStore.js
```

---

## � Demo Credentials

You can log in and explore the system using the following test account:

| Field | Value |
|---|---|
| **Email** | `user@gmail.com` |
| **Password** | `user@1234` |

> ⚠️ This is a shared test account. Please do not change the password or delete existing data.

---

## �🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Cloudinary** account (for file/document storage)
- **SMTP credentials** (for email via Nodemailer)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/FaiqWajahat/seven-directions.git
   cd seven-directions
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory (see [Environment Variables](#-environment-variables) below).

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>

# Authentication (JWT secret)
JWT_SECRET=your_super_secret_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nodemailer (SMTP)
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_email_password

# SFTP (optional)
SFTP_HOST=your_sftp_host
SFTP_PORT=22
SFTP_USER=your_sftp_user
SFTP_PASS=your_sftp_password
```

> **Never commit `.env.local` to version control.** It is already listed in `.gitignore`.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint checks |

---

## 🧩 Data Models

| Model | Key Fields |
|---|---|
| `Project` | name, location, clientName, startDate, estimatedBudget, status, expenses[], income[] |
| `Employee` | name, iqamaNumber, nationality, role, joiningDate, salary, status |
| `EmployeeAttendance` | employeeId, date, status (Present/Absent/Leave), projectId |
| `EmployeeSalary` | employeeId, baseSalary, allowances, absentDeduction, manualExpenses[], linkedExpenses[], netSalary, status |
| `SalaryList` | (groups multiple EmployeeSalary records per pay period) |
| `CompanyAssets` | name, category, serialNumber, status, currentProject, projectHistory[] |
| `Quotation` | clientName, projectName, referenceNo, status, documentUrl |
| `Foreman` | foremanId, projectId, amountSent[], invoicesReceived[], remainingBalance |
| `User` | (authentication & profile) |

---

## 🌐 Internationalization

The application supports two languages out of the box:

| Language | Locale |
|---|---|
| English | `en` |
| Urdu | `ur` |

Translations are managed in `src/locales/` and powered by `next-intl`. All major navigation links and UI labels are translated.

---

## 🎨 Customization

Users can personalize their dashboard experience via **Settings**:

- **Theme Color**: Choose from multiple DaisyUI themes (light, dark, cupcake, business, etc.)
- **Font Style**: Select from 10 professional Google Fonts
- Preferences are persisted in `localStorage` and applied immediately on load

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a **Pull Request**

Please follow the existing code conventions and keep PR scope focused.

---

## 📄 License

This project is **proprietary software**. All rights reserved by [Faiq Wajahat](https://github.com/FaiqWajahat). Unauthorized copying, distribution, or use is prohibited.

---

## 👨‍💻 Author

**Faiq Wajahat**
- GitHub: [@FaiqWajahat](https://github.com/FaiqWajahat)

---

<p align="center">Made with ❤️ by Faiq Wajahat</p>
