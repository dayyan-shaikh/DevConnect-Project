# 🌐 DevConnect

An interactive **developer networking platform** built with **React Router v7, shadcn/ui, Aceternity UI, NestJS, and MongoDB**.  
Think of it as a mini **LinkedIn + GitHub**, where developers can showcase profiles, skills, projects, and connect via chat.  

---

## ✨ Features

✅ **Authentication & Profiles**  
- User registration & login  
- Create/edit profile with **skills, education, projects, social links**  
- Upload avatars & media (In Progress)  

✅ **Developer Directory**  
- Browse other developers  
- Powerful **search & skill filters**  
- Pagination with cursor-based navigation  

✅ **Profile View Mode**  
- View another developer’s profile (GitHub/LinkedIn style)  
- Restrict editing when viewing other profiles  

✅ **Messaging**  
- One-to-one chat between users  
- Real-time messaging with **WebSockets (Socket.IO + NestJS)**  
- Message history stored in MongoDB  
- Mark messages as read/unread  

✅ **UI & Animations**  
- Built with **shadcn/ui + Aceternity UI components**  
- Beautiful transitions with **Framer Motion**  
- Dark theme with glassmorphism design  

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ **React Router v7** – modern routing with layouts & loaders  
- 🎨 **shadcn/ui** – beautiful, accessible UI components  
- 💫 **Aceternity UI** – modern motion-based components  
- ⚡ **TanStack Query (React Query)** – API state management  
- 🔔 **Sonner** – toast notifications  

### Backend
- 🚀 **NestJS** – modular backend framework  
- 🗄️ **MongoDB + Mongoose** – NoSQL database for profiles & messages  
- 🔌 **Socket.IO** – real-time messaging  

---

## 📸 Screenshots
Login Page - 
https://github.com/dayyan-shaikh/DevConnect-Project/blob/bf27846920e10faa6d9436575f5350b737296078/Screenshot%202025-09-23%20162009.png

Home Page - 
https://github.com/dayyan-shaikh/DevConnect-Project/blob/ec0588eb1688ffbf2c81cb299409ab518a6496af/Screenshot%202025-09-23%20162026.png

Developers Page - 
https://github.com/dayyan-shaikh/DevConnect-Project/blob/ec0588eb1688ffbf2c81cb299409ab518a6496af/Screenshot%202025-09-23%20162046.png

Messages Page - 
https://github.com/dayyan-shaikh/DevConnect-Project/blob/ec0588eb1688ffbf2c81cb299409ab518a6496af/Screenshot%202025-09-23%20162105.png

Profile Page - 
https://github.com/dayyan-shaikh/DevConnect-Project/blob/ec0588eb1688ffbf2c81cb299409ab518a6496af/Screenshot%202025-09-23%20162125.png
---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repo
```bash
git clone https://github.com/your-username/devconnect.git
cd devconnect

Install dependencies
Front-End
cd frontend
npm install
npm run dev

Back-End
cd backend
npm install
npm run start:dev
