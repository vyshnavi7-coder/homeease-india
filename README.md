# 🇮🇳 HomeEase India

**HomeEase India** is a modern, scalable full-stack hyperlocal home services marketplace web application connecting local skilled Indian workers (maids, electricians, plumbers, cooks, carpenters, tailors, beauticians, painters) with customers across India.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/homeease-india.git
cd homeease-india

# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Running Locally
From the root directory:
```bash
# Start both Backend Server (port 5000) and Frontend App (port 5173) concurrently:
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📦 How to Push to GitHub

Run the following commands in PowerShell or Terminal inside the `homeease-india` project directory:

```bash
# 1. Initialize Git Repository
git init

# 2. Add all files (respects .gitignore)
git add .

# 3. Commit your changes
git commit -m "feat: complete HomeEase India full-stack hyperlocal platform"

# 4. Rename default branch to main
git branch -M main

# 5. Link to your GitHub repository (create an empty repo on github.com first)
git remote add origin https://github.com/YOUR_USERNAME/homeease-india.git

# 6. Push to GitHub
git push -u origin main
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend) [Recommended Free Tier]

#### Deploying Backend on Render:
1. Go to [Render.com](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository.
3. Set the following settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `PORT` = `5000`
     - `JWT_SECRET` = `your-secure-jwt-secret`
4. Copy the public backend URL provided by Render (e.g. `https://homeease-api.onrender.com`).

#### Deploying Frontend on Vercel:
1. Go to [Vercel.com](https://vercel.com) and import your GitHub repository.
2. Set:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL` = `https://homeease-api.onrender.com`
3. Click **Deploy**.

---

### Option 2: All-in-One Deployment on Railway or Render

1. Create a `render.yaml` or connect Railway to auto-detect both services.
2. Root `package.json` contains standard build scripts:
   - `npm run build` builds both `client` and `server`.
   - `npm start` launches the production server.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet, jsPDF, Canvas-Confetti
- **Backend**: Node.js, Express.js, TypeScript, Socket.IO (Real-time live tracking & chat), Compression
- **Database**: Relational in-memory RAM engine with debounced disk synchronization and PostgreSQL connector compatibility
- **Languages**: 22 Official Indian Languages + English
