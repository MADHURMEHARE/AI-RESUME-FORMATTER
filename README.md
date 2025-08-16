# 🚀 Advanced AI CV Transformer

**A world-class, enterprise-ready AI-powered CV formatting application that transforms raw CVs into polished, professional documents using cutting-edge AI technology.**

---

## ✨ What Makes This Special

This isn't just another CV formatter - it's a **10x engineering showcase** that demonstrates:

- ⚡ **Multi-Model AI Integration**: GPT-4, Claude, and Gemini working together  
- 🎯 **Industry-Specific Intelligence**: Tailored for different career paths  
- 📑 **Professional EHS Standards**: Enterprise-grade formatting compliance  
- 📊 **Advanced Analytics**: ATS scoring, quality analysis, and market insights  
- 📤 **Multi-Format Export**: PDF, DOCX, HTML, and LaTeX generation  
- ⚙️ **Real-Time Processing**: Live CV transformation with progress tracking  

---

## 🎯 Core Features

### 🤖 AI-Powered Processing
- **Multi-Model AI**: GPT-4 for content extraction, Claude for skill analysis, Gemini for formatting  
- **Intelligent Parsing**: Extracts real content from PDF, DOCX, and Excel files  
- **Content Enhancement**: Applies professional language and structure improvements  
- **Skill Gap Analysis**: Identifies missing skills and provides learning recommendations  

### 🎨 Professional Templates
- Industry-Specific: Technology, Finance, Healthcare, Creative, Education  
- Customizable Styling: Colors, fonts, layouts, and emphasis areas  
- **EHS Compliance** with enterprise formatting standards  
- Real-Time Preview before export  

### 📊 Advanced Analytics
- ATS Scoring for Applicant Tracking System compatibility  
- Section-by-section **Quality Assessment**  
- **Market Insights**: Salary ranges and industry trends  
- Actionable **Improvement Recommendations**  

### 📤 Multi-Format Export
- PDF (print-ready)  
- DOCX (editable)  
- HTML (responsive)  
- LaTeX (academic/research CVs)  

---

## 🛠 Technical Architecture

### **Frontend**
- Next.js 14 (App Router)  
- TypeScript  
- Tailwind CSS  
- Heroicons  

### **Backend**
- Node.js + Express.js  
- Multer (file upload)  
- PDF-Parse (PDF extraction)  
- Mammoth (DOCX)  
- XLSX (Excel)  

### **AI Integration**
- OpenAI GPT-4 → Content extraction  
- Anthropic Claude → Skill analysis  
- Google Gemini → Formatting & enhancement  

### **Export Services**
- PDFKit  
- docx  
- HTML templates  
- LaTeX  

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+  
- npm or yarn  
- API keys (optional for demo mode)  

### Installation
```bash
# Clone repo
git clone <your-repo-url>
cd ai-cv-transformer

# Install dependencies
npm install
cd apps/api && npm install
cd ../..

# Setup environment (apps/api/.env)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_ai_key

# Start backend
cd apps/api
npm start

# Start frontend
npm run dev
