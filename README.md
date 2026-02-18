# LinkedIn Job Applicant Manager

A professional web application for managing LinkedIn job applicants with team collaboration features.

## Features

- 📝 Manual applicant data entry
- 📄 PDF resume upload and viewing
- 💼 LinkedIn profile integration
- 👥 Team commenting system with decisions
- 📊 Card and list view with color-coded consensus
- 💾 Persistent data storage
- 📤 CSV export functionality

## Team Members
- MIZ
- JEANETTE
- MANISH
- AYESHA
- NAYEDA

## Tech Stack

- **Frontend**: React, Vite, CSS Grid
- **Backend**: Express.js, Node.js
- **Storage**: JSON file-based storage
- **File Handling**: Multer for PDF uploads

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/ayesha-rightsteps/linkedin-uiux.git
cd linkedin-uiux
```

2. Install dependencies
```bash
npm install
```

3. Start the backend server
```bash
node server.js
```

4. Start the frontend development server
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Add Applicants**: Fill out the form with applicant details and upload their resume
2. **View Dashboard**: Navigate to `/applicants` to see all applicants
3. **Team Comments**: Click on any applicant to add your decision and comments
4. **Export Data**: Use the export feature to download applicant data as CSV

## API Endpoints

- `POST /api/applicants` - Add new applicant
- `GET /api/applicants` - Get all applicants
- `POST /api/applicants/:id/comments` - Add comment to applicant
- `DELETE /api/applicants/:id` - Delete applicant

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── ApplicantsPage.jsx
│   │   ├── ApplicantDetail.jsx
│   │   └── CSS files
│   └── App.jsx
├── data/
│   └── applicants.json
├── public/
│   └── applications/ (PDF storage)
└── server.js
```

## Deployment

This application can be deployed on platforms like Vercel, Railway, or Render.

---

Built for efficient LinkedIn job applicant management and team collaboration.
