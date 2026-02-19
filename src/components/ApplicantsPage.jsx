import { useState, useEffect } from 'react'
import ApplicantDetail from './ApplicantDetail'
import './ApplicantsPage.css'

const API_URL = 'https://linkdin-server.onrender.com'

function ApplicantsPage() {
  const [applicants, setApplicants] = useState([])
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'list'

  useEffect(() => {
    fetchApplicants()
  }, [])

  const fetchApplicants = async () => {
    try {
      const response = await fetch(`${API_URL}/api/applicants`)
      if (response.ok) {
        const data = await response.json()
        setApplicants(data)
      }
    } catch (error) {
      console.error('Failed to fetch applicants:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredApplicants = applicants.filter(applicant =>
    (applicant.fullName || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedApplicants = filteredApplicants.sort((a, b) =>
    (a.fullName || '').localeCompare(b.fullName || '')
  )

  // Get latest decision per person for each applicant
  const getLatestDecisions = (comments = []) => {
    const latestDecisions = {}

    if (!comments || comments.length === 0) return latestDecisions

    // Sort comments by timestamp (latest first)
    const sortedComments = [...comments].sort((a, b) => {
      // Convert timestamp format "18/02/2026, 16:27:29" to proper date
      const parseTimestamp = (timestamp) => {
        if (!timestamp) return new Date(0)
        const parts = timestamp.split(', ')
        if (parts.length !== 2) return new Date(0)
        const [datePart, timePart] = parts
        const dateParts = datePart.split('/')
        if (dateParts.length !== 3) return new Date(0)
        const [day, month, year] = dateParts
        return new Date(`${year}-${month}-${day}T${timePart}`)
      }
      return parseTimestamp(b?.timestamp) - parseTimestamp(a?.timestamp)
    })

    // Get latest decision per person
    sortedComments.forEach(comment => {
      if (comment?.person && comment?.decision && !latestDecisions[comment.person]) {
        latestDecisions[comment.person] = comment.decision
      }
    })

    return latestDecisions
  }

  // Calculate team consensus color
  const getRowColor = (comments = []) => {
    const decisions = getLatestDecisions(comments)
    const considering = Object.values(decisions).filter(d => d === 'Considering').length
    const notConsidering = Object.values(decisions).filter(d => d === 'Not Considering').length
    const pending = Object.values(decisions).filter(d => d === 'Pending').length
    
    if (considering > notConsidering && considering > pending) {
      // Green intensity based on considering count
      const intensity = Math.min(considering * 0.15, 0.6)
      return `rgba(34, 197, 94, ${intensity})`
    } else if (notConsidering > considering && notConsidering > pending) {
      // Red intensity based on not considering count
      const intensity = Math.min(notConsidering * 0.15, 0.6)
      return `rgba(239, 68, 68, ${intensity})`
    } else if (pending > considering && pending > notConsidering) {
      // Yellow intensity based on pending count
      const intensity = Math.min(pending * 0.15, 0.6)
      return `rgba(251, 191, 36, ${intensity})`
    }
    
    return 'transparent' // No consensus or equal votes
  }

  if (loading) {
    return (
      <div className="applicants-page">
        <div className="loading">Loading applicants...</div>
      </div>
    )
  }

  return (
    <div className="applicants-page">
      <div className="applicants-layout">
        <div className="applicants-list">
          <div className="list-header">
            <div className="header-row">
              <h3>Applicants ({applicants.length})</h3>
              <button 
                onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
                className="view-toggle-btn"
              >
                {viewMode === 'cards' ? '📊 List View' : '🔍 Card View'}
              </button>
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sidebar-search"
            />
          </div>
          {sortedApplicants.length === 0 ? (
            <div className="no-results">
              {searchTerm ? 'No applicants found matching your search.' : 'No applicants found.'}
            </div>
          ) : viewMode === 'cards' ? (
            <div className="applicant-cards">
              {sortedApplicants.map(applicant => (
                <div
                  key={applicant.id}
                  className={`applicant-item ${selectedApplicant?.id === applicant.id ? 'selected' : ''}`}
                  onClick={() => setSelectedApplicant(applicant)}
                >
                  <div className="applicant-preview">
                    <h4>{applicant.fullName || 'Unknown'}</h4>
                    <div className="applicant-meta">
                      {applicant.expectedSalary ? (
                        <span className="salary">💰 {applicant.expectedSalary}</span>
                      ) : (
                        <span className="first-batch">First 14 Applicants</span>
                      )}
                    </div>
                  </div>
                  <div className="applicant-badges">
                    {applicant.linkedinUrl && <span className="badge linkedin">LinkedIn</span>}
                    {applicant.resumeName && <span className="badge resume">Resume</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="applicants-table">
              <div className="table-header">
                <div>Name</div>
                <div>Salary</div>
                <div>MIZ</div>
                <div>JEANETTE</div>
                <div>MANISH</div>
                <div>AYESHA</div>
                <div>NAYEDA</div>
              </div>
              <div className="table-body">
                {sortedApplicants.map(applicant => {
                  const decisions = getLatestDecisions(applicant.comments)
                  return (
                    <div
                      key={applicant.id}
                      className={`table-row ${selectedApplicant?.id === applicant.id ? 'selected' : ''}`}
                      onClick={() => setSelectedApplicant(applicant)}
                      style={{ backgroundColor: getRowColor(applicant.comments) }}
                    >
                      <div className="col-name">{applicant.fullName || 'Unknown'}</div>
                      <div className="col-salary">
                        {applicant.expectedSalary || 'First 14'}
                      </div>
                      <div className="col-miz">
                        {decisions.MIZ && (
                          <div className={`decision-badge ${decisions.MIZ.toLowerCase().replace(' ', '-')}`}>
                            {decisions.MIZ === 'Considering' ? '✓' : decisions.MIZ === 'Not Considering' ? '✗' : '?'}
                          </div>
                        )}
                      </div>
                      <div className="col-jeanette">
                        {decisions.JEANETTE && (
                          <div className={`decision-badge ${decisions.JEANETTE.toLowerCase().replace(' ', '-')}`}>
                            {decisions.JEANETTE === 'Considering' ? '✓' : decisions.JEANETTE === 'Not Considering' ? '✗' : '?'}
                          </div>
                        )}
                      </div>
                      <div className="col-manish">
                        {decisions.MANISH && (
                          <div className={`decision-badge ${decisions.MANISH.toLowerCase().replace(' ', '-')}`}>
                            {decisions.MANISH === 'Considering' ? '✓' : decisions.MANISH === 'Not Considering' ? '✗' : '?'}
                          </div>
                        )}
                      </div>
                      <div className="col-ayesha">
                        {decisions.AYESHA && (
                          <div className={`decision-badge ${decisions.AYESHA.toLowerCase().replace(' ', '-')}`}>
                            {decisions.AYESHA === 'Considering' ? '✓' : decisions.AYESHA === 'Not Considering' ? '✗' : '?'}
                          </div>
                        )}
                      </div>
                      <div className="col-nayeda">
                        {decisions.NAYEDA && (
                          <div className={`decision-badge ${decisions.NAYEDA.toLowerCase().replace(' ', '-')}`}>
                            {decisions.NAYEDA === 'Considering' ? '✓' : decisions.NAYEDA === 'Not Considering' ? '✗' : '?'}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="applicant-details">
          {selectedApplicant ? (
            <ApplicantDetail applicant={selectedApplicant} />
          ) : (
            <div className="no-selection">
              <div className="placeholder-content">
                <h3>👋 Welcome to the Applicants Dashboard</h3>
                <p>Select an applicant from the list to view their complete profile, LinkedIn, and resume.</p>
                <div className="stats">
                  <div className="stat-item">
                    <strong>{applicants.length}</strong>
                    <span>Total Applications</span>
                  </div>
                  <div className="stat-item">
                    <strong>{applicants.filter(a => a.resumeName).length}</strong>
                    <span>With Resume</span>
                  </div>
                  <div className="stat-item">
                    <strong>{applicants.filter(a => a.linkedinUrl).length}</strong>
                    <span>With LinkedIn</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
    </div>
  )
}

export default ApplicantsPage