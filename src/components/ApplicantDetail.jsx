import { useState } from 'react'
import './ApplicantDetail.css'

const API_URL = 'https://linkdin-server.onrender.com'

function ApplicantDetail({ applicant }) {
  const [pdfError, setPdfError] = useState(false)
  const [commentForm, setCommentForm] = useState({
    person: '',
    decision: '',
    note: ''
  })
  const [comments, setComments] = useState(applicant.comments || [])

  const handleLinkedInClick = () => {
    if (applicant.linkedinUrl) {
      window.open(applicant.linkedinUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handlePdfLoad = () => {
    setPdfError(false)
  }

  const handlePdfError = () => {
    setPdfError(true)
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    
    if (!commentForm.person || !commentForm.decision) {
      alert('Please select both person and decision')
      return
    }

    const newComment = {
      id: Date.now(),
      person: commentForm.person,
      decision: commentForm.decision,
      note: commentForm.note,
      timestamp: new Date().toLocaleString()
    }

    try {
      const response = await fetch(`${API_URL}/api/applicants/${applicant.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newComment)
      })

      if (response.ok) {
        // Remove previous comment from the same person and add new one
        setComments(prev => 
          prev.filter(comment => comment.person !== newComment.person)
              .concat(newComment)
        )
        setCommentForm({ person: '', decision: '', note: '' })
      } else {
        alert('Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Error adding comment')
    }
  }

  const handleCommentChange = (field, value) => {
    setCommentForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="applicant-detail">
      <div className="detail-header">
        <div className="applicant-info">
          <h2>{applicant.fullName}</h2>
        </div>
        
        {/* <div className="action-buttons">
          {applicant.linkedinUrl && (
            <button 
              className="linkedin-btn"
              onClick={handleLinkedInClick}
              title="View LinkedIn Profile"
            >
              <span className="linkedin-icon">💼</span>
              LinkedIn Profile
            </button>
          )}
        </div> */}
      </div>

      <div className="detail-content">
        <div className="info-section">
          <h3>Applicant Information</h3>
          <div className="info-grid">
            {applicant.expectedSalary && (
              <div className="info-item">
                <label>Expected Salary:</label>
                <span className="salary-value">{applicant.expectedSalary}</span>
              </div>
            )}
            
            {applicant.linkedinUrl && (
              <div className="info-item">
                <label>LinkedIn Profile:</label>
                <a 
                  href={applicant.linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="linkedin-link"
                >
                  View Profile →
                </a>
              </div>
            )}
            
            {applicant.notes && (
              <div className="info-item full-width">
                <label>Notes:</label>
                <div className="notes-content">{applicant.notes}</div>
              </div>
            )}
          </div>

          <div className="comments-section">
            <h3>Team Comments</h3>
            
            <div className="add-comment">
              <h4>Add Comment</h4>
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Person:</label>
                    <select
                      value={commentForm.person}
                      onChange={(e) => handleCommentChange('person', e.target.value)}
                      required
                    >
                      <option value="">Select Person</option>
                      <option value="MIZ">MIZ</option>
                      <option value="JEANETTE">JEANETTE</option>
                      <option value="MANISH">MANISH</option>
                      <option value="AYESHA">AYESHA</option>
                      <option value="NAYEDA">NAYEDA</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Decision:</label>
                    <select
                      value={commentForm.decision}
                      onChange={(e) => handleCommentChange('decision', e.target.value)}
                      required
                    >
                      <option value="">Select Decision</option>
                      <option value="Considering">Considering</option>
                      <option value="Not Considering">Not Considering</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Additional Note (Optional):</label>
                  <textarea
                    value={commentForm.note}
                    onChange={(e) => handleCommentChange('note', e.target.value)}
                    placeholder="Add any additional comments..."
                    rows={3}
                  />
                </div>
                
                <button type="submit" className="submit-comment-btn">
                  Add Comment
                </button>
              </form>
            </div>

            <div className="comments-list">
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-person">{comment.person}</div>
                      <div className={`comment-decision ${comment.decision.toLowerCase().replace(' ', '-')}`}>
                        {comment.decision}
                      </div>
                      <div className="comment-time">{comment.timestamp}</div>
                    </div>
                    {comment.note && (
                      <div className="comment-note">{comment.note}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-comments">
                  <p>No comments yet. Be the first to add a comment about this candidate.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {applicant.resumePath && (
          <div className="resume-section">
            <div className="resume-header">
              <h3>Resume</h3>
              <div className="resume-actions">
                <a
                  href={`${API_URL}/${applicant.resumePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-btn"
                  download
                >
                  📥 Download
                </a>
                <a
                  href={`${API_URL}/${applicant.resumePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-btn"
                >
                  🔗 Open in New Tab
                </a>
              </div>
            </div>
            
            <div className="resume-viewer">
              {!pdfError ? (
                <iframe
                  src={`${API_URL}/${applicant.resumePath}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="pdf-viewer"
                  title={`${applicant.fullName} Resume`}
                  onLoad={handlePdfLoad}
                  onError={handlePdfError}
                />
              ) : (
                <div className="pdf-error">
                  <div className="error-content">
                    <h4>📄 Resume Preview Unavailable</h4>
                    <p>The PDF couldn't be displayed in the browser, but you can:</p>
                    <div className="error-actions">
                      <a
                        href={`${API_URL}/${applicant.resumePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="error-btn primary"
                      >
                        📱 Open in New Tab
                      </a>
                      <a
                        href={`${API_URL}/${applicant.resumePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="error-btn secondary"
                        download
                      >
                        💾 Download PDF
                      </a>
                    </div>
                    <p className="file-info">
                      File: {applicant.resumeName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!applicant.resumePath && (
          <div className="no-resume">
            <div className="no-resume-content">
              <h4>📋 No Resume Uploaded</h4>
              <p>This applicant hasn't uploaded a resume yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicantDetail