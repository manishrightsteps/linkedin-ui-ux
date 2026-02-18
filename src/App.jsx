import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || '${API_URL}'

function App() {
  const [applicants, setApplicants] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    linkedinUrl: '',
    expectedSalary: '',
    resume: null,
    notes: ''
  })

  useEffect(() => {
    fetchApplicants()
  }, [])

  const fetchApplicants = async () => {
    try {
      const response = await fetch('${API_URL}/api/applicants')
      if (response.ok) {
        const data = await response.json()
        setApplicants(data)
      }
    } catch (error) {
      console.error('Failed to fetch applicants:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({
        ...prev,
        resume: file
      }))
    } else {
      alert('Please select a PDF file only')
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.fullName) {
      alert('Please fill in required field (Name)')
      return
    }

    try {
      let resumePath = null
      let resumeName = null
      
      if (formData.resume) {
        const timestamp = Date.now()
        const fileName = `${formData.fullName.replace(/\s+/g, '_')}_${timestamp}.pdf`
        
        const formDataUpload = new FormData()
        formDataUpload.append('file', formData.resume)
        formDataUpload.append('fileName', fileName)
        
        const uploadResponse = await fetch('${API_URL}/api/upload-resume', {
          method: 'POST',
          body: formDataUpload
        })
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          resumePath = uploadResult.filePath
          resumeName = uploadResult.originalName
        } else {
          alert('Failed to upload resume')
          return
        }
      }

      const applicantData = {
        fullName: formData.fullName,
        linkedinUrl: formData.linkedinUrl,
        expectedSalary: formData.expectedSalary,
        notes: formData.notes,
        resumeName: resumeName,
        resumePath: resumePath
      }

      const response = await fetch('${API_URL}/api/applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicantData)
      })

      if (response.ok) {
        await fetchApplicants()
        setFormData({
          fullName: '',
          linkedinUrl: '',
          expectedSalary: '',
          resume: null,
          notes: ''
        })
        document.getElementById('applicantForm').reset()
        alert('Applicant added successfully!')
      } else {
        alert('Failed to save applicant')
      }
    } catch (error) {
      console.error('Error saving applicant:', error)
      alert('Error saving applicant')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this applicant?')) {
      try {
        const response = await fetch(`${API_URL}/api/applicants/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          await fetchApplicants()
        } else {
          alert('Failed to delete applicant')
        }
      } catch (error) {
        console.error('Error deleting applicant:', error)
        alert('Error deleting applicant')
      }
    }
  }


  const exportToCSV = () => {
    if (applicants.length === 0) {
      alert('No applicants to export')
      return
    }

    const headers = [
      'Full Name', 'LinkedIn URL', 'Expected Salary', 'Resume File', 'Notes', 'Date Added'
    ]

    const csvContent = [
      headers.join(','),
      ...applicants.map(applicant => [
        `"${applicant.fullName}"`,
        `"${applicant.linkedinUrl || ''}"`,
        `"${applicant.expectedSalary || ''}"`,
        `"${applicant.resumeName || ''}"`,
        `"${applicant.notes || ''}"`,
        `"${applicant.dateAdded}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `applicants_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const clearAllApplicants = async () => {
    if (window.confirm('Are you sure you want to clear all applicants? This action cannot be undone.')) {
      try {
        const response = await fetch('${API_URL}/api/clear-all', {
          method: 'DELETE'
        })
        
        if (response.ok) {
          await fetchApplicants()
        } else {
          alert('Failed to clear applicants')
        }
      } catch (error) {
        console.error('Error clearing applicants:', error)
        alert('Error clearing applicants')
      }
    }
  }

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })


  return (
    <div className="app">
      <header className="header">
        <h1>LinkedIn Job Applicant Manager</h1>
        <p>Manage and track job applicants for easy sharing with your team</p>
        <div className="navigation">
          <Link to="/applicants" className="nav-link">
            📊 View All Applicants Dashboard
          </Link>
        </div>
      </header>

      <div className="main-content">
        <div className="form-section">
          <h2>Add New Applicant</h2>
          <form id="applicantForm" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="linkedinUrl">LinkedIn Profile URL</label>
                <input
                  type="url"
                  id="linkedinUrl"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="expectedSalary">Expected Salary</label>
                <input
                  type="text"
                  id="expectedSalary"
                  name="expectedSalary"
                  value={formData.expectedSalary}
                  onChange={handleInputChange}
                  placeholder="e.g. $80,000 - $100,000"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="resume">Resume (PDF)</label>
              <input
                type="file"
                id="resume"
                name="resume"
                onChange={handleFileChange}
                accept=".pdf"
              />
              <small>Upload PDF resume (optional)</small>
            </div>

            <div className="form-group full-width">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes about the candidate"
              />
            </div>

            <button type="submit" className="btn-primary">Add Applicant</button>
          </form>
        </div>

        <div className="applicants-section">
          <div className="section-header">
            <h2>Applicants List ({applicants.length})</h2>
            <div className="export-buttons">
              <button onClick={exportToCSV} className="btn-secondary">Export to CSV</button>
              <button onClick={clearAllApplicants} className="btn-danger">Clear All</button>
            </div>
          </div>
          
          <div className="search-filter">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search applicants..."
            />
          </div>

          <div className="applicants-grid">
            {filteredApplicants.length === 0 ? (
              <div className="no-applicants">
                <p>{applicants.length === 0 ? 'No applicants added yet. Use the form above to add your first applicant.' : 'No applicants match your search criteria.'}</p>
              </div>
            ) : (
              filteredApplicants.map(applicant => (
                <div key={applicant.id} className="applicant-card">
                  <div className="card-header">
                    <h3>{applicant.fullName}</h3>
                    <div className="card-actions">
                      <button
                        onClick={() => handleDelete(applicant.id)}
                        className="btn-delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    {applicant.linkedinUrl && (
                      <p><strong>LinkedIn:</strong> <a href={applicant.linkedinUrl} target="_blank" rel="noopener noreferrer">View Profile</a></p>
                    )}
                    {applicant.expectedSalary && <p><strong>Expected Salary:</strong> {applicant.expectedSalary}</p>}
                    {applicant.resumeName && (
                      <p><strong>Resume:</strong> 
                        {applicant.resumePath ? (
                          <a href={`${API_URL}/${applicant.resumePath}`} target="_blank" rel="noopener noreferrer" download>
                            {applicant.resumeName}
                          </a>
                        ) : (
                          applicant.resumeName
                        )}
                      </p>
                    )}
                    {applicant.notes && <p><strong>Notes:</strong> {applicant.notes}</p>}
                    <p><strong>Added:</strong> {applicant.dateAdded}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
