// API Configuration
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
    window.location.href = 'index.html';
}

// Set authorization header for all requests
const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    displayUserInfo();
    loadNotificationCount();
    
    if (user.role === 'STUDENT') {
        loadStudentDashboard();
    } else {
        loadAllEvents();
    }
});

// Display user information
function displayUserInfo() {
    // Check if user data is valid
    if (!user.firstName || !user.lastName || !user.role) {
        console.error('Invalid user data:', user);
        alert('Session error: Please login again');
        localStorage.clear();
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('userRole').textContent = user.role.toLowerCase().replace('_', ' ');
    document.getElementById('welcomeMessage').textContent = `Welcome back, ${user.firstName}!`;
    
    if (user.role === 'ADMINISTRATOR') {
        document.getElementById('allEventsTitle').textContent = 'Manage Events';
    } else if (user.role === 'CLUB_ORGANIZER') {
        document.getElementById('allEventsTitle').textContent = 'My Events';
    }
}

// Load notification count
async function loadNotificationCount() {
    try {
        const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
            headers: authHeaders
        });
        
        if (response.ok) {
            const data = await response.json();
            const badge = document.getElementById('notificationCount');
            badge.textContent = data.count || 0;
            if (data.count === 0) {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error loading notification count:', error);
    }
}

// Load student dashboard with recommendations
async function loadStudentDashboard() {
    document.getElementById('recommendedSection').style.display = 'block';
    
    try {
        const response = await fetch(`${API_BASE_URL}/events/dashboard`, {
            headers: authHeaders
        });
        
        if (response.ok) {
            const data = await response.json();
            displayRecommendedEvents(data.recommendedEvents);
            displayAllEvents(data.upcomingEvents);
        } else {
            throw new Error('Failed to load dashboard');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        loadAllEvents(); // Fallback to all events
    }
}

// Load all events
async function loadAllEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/events?page=0&size=20&sort=startDateTime,asc`, {
            headers: authHeaders
        });
        
        if (response.ok) {
            const data = await response.json();
            displayAllEvents(data.content);
        } else {
            throw new Error('Failed to load events');
        }
    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById('allEvents').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Events</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Display recommended events
function displayRecommendedEvents(events) {
    const container = document.getElementById('recommendedEvents');
    
    if (!events || events.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-star"></i>
                <h3>No Recommendations Yet</h3>
                <p>Check out all events below!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = events.map(event => createEventCard(event)).join('');
}

// Display all events
function displayAllEvents(events) {
    const container = document.getElementById('allEvents');
    
    if (!events || events.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>No Events Available</h3>
                <p>Check back later for upcoming events</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = events.map(event => createEventCard(event)).join('');
}

// Create event card HTML
function createEventCard(event) {
    const startDate = new Date(event.startDateTime);
    const formattedDate = startDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
    const formattedTime = startDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const statusClass = event.approvalStatus === 'APPROVED' ? 'status-approved' : 'status-pending';
    const statusText = event.approvalStatus.toLowerCase();
    
    const capacity = `${event.currentParticipants}/${event.maximumCapacity}`;
    const isFull = event.currentParticipants >= event.maximumCapacity;
    
    return `
        <div class="event-card">
            <div class="event-image">
                <i class="fas fa-calendar-day"></i>
            </div>
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                <p class="event-description">${event.description}</p>
                
                <div class="event-meta">
                    <div class="event-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${formattedTime}</span>
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.venue?.venueName || 'TBA'}</span>
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-users"></i>
                        <span>${capacity} participants</span>
                    </div>
                </div>
                
                <span class="event-status ${statusClass}">${statusText}</span>
                
                <div class="event-actions">
                    ${user.role === 'STUDENT' && !isFull && event.approvalStatus === 'APPROVED' 
                        ? `<button class="btn-register" onclick="registerForEvent(${event.id})">
                               <i class="fas fa-user-plus"></i> Register
                           </button>` 
                        : ''}
                    <button class="btn-view" onclick="viewEvent(${event.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Register for event
async function registerForEvent(eventId) {
    if (!confirm('Do you want to register for this event?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/registrations`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ eventId })
        });
        
        if (response.ok) {
            alert('Successfully registered for the event!');
            location.reload();
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// View event details
async function viewEvent(eventId) {
    const modal = document.getElementById('eventModal');
    const modalBody = document.getElementById('modalEventBody');
    
    modal.style.display = 'block';
    modalBody.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading event details...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
            headers: authHeaders
        });
        
        if (!response.ok) {
            throw new Error('Failed to load event details');
        }
        
        const event = await response.json();
        displayEventDetails(event);
    } catch (error) {
        modalBody.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Event</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Display event details in modal
function displayEventDetails(event) {
    const modalBody = document.getElementById('modalEventBody');
    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);
    
    const formatDateTime = (date) => {
        return date.toLocaleString('en-US', { 
            year: 'numeric',
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const isFull = event.currentParticipants >= event.maximumCapacity;
    const canRegister = user.role === 'STUDENT' && !isFull && event.approvalStatus === 'APPROVED';
    
    modalBody.innerHTML = `
        <div class="detail-section">
            <h3><i class="fas fa-info-circle"></i> Event Information</h3>
            <p><strong>Title:</strong> ${event.title}</p>
            <p><strong>Description:</strong> ${event.description}</p>
            <p><strong>Category:</strong> ${event.category?.categoryName || 'N/A'}</p>
            <p><strong>Organized by:</strong> ${event.club?.clubName || event.organizer?.firstName + ' ' + event.organizer?.lastName}</p>
        </div>
        
        <div class="detail-section">
            <h3><i class="fas fa-calendar-alt"></i> Schedule</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <i class="fas fa-play-circle"></i>
                    <div class="detail-item-content">
                        <div class="detail-item-label">Start Time</div>
                        <div class="detail-item-value">${formatDateTime(startDate)}</div>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fas fa-stop-circle"></i>
                    <div class="detail-item-content">
                        <div class="detail-item-label">End Time</div>
                        <div class="detail-item-value">${formatDateTime(endDate)}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3><i class="fas fa-map-marker-alt"></i> Location & Capacity</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <i class="fas fa-building"></i>
                    <div class="detail-item-content">
                        <div class="detail-item-label">Venue</div>
                        <div class="detail-item-value">${event.venue?.venueName || 'TBA'}</div>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fas fa-map"></i>
                    <div class="detail-item-content">
                        <div class="detail-item-label">Location</div>
                        <div class="detail-item-value">${event.venue?.location || 'TBA'}</div>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fas fa-users"></i>
                    <div class="detail-item-content">
                        <div class="detail-item-label">Capacity</div>
                        <div class="detail-item-value">${event.currentParticipants}/${event.maximumCapacity}</div>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fas fa-check-circle"></i>
                    <div class="detail-item-content">
                        <div class="detail-item-label">Status</div>
                        <div class="detail-item-value">${event.approvalStatus}</div>
                    </div>
                </div>
            </div>
        </div>
        
        ${event.requirements ? `
        <div class="detail-section">
            <h3><i class="fas fa-list-check"></i> Requirements</h3>
            <p>${event.requirements}</p>
        </div>
        ` : ''}
        
        <div class="modal-actions">
            ${canRegister ? `
                <button class="btn-register" onclick="registerForEventFromModal(${event.id})" style="flex: 1;">
                    <i class="fas fa-user-plus"></i> Register for Event
                </button>
            ` : ''}
            <button class="btn-view" onclick="closeEventModal()" style="flex: 1;">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;
}

// Close event modal
function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
}

// Register from modal
async function registerForEventFromModal(eventId) {
    await registerForEvent(eventId);
    closeEventModal();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('eventModal');
    if (event.target === modal) {
        closeEventModal();
    }
}

// View notifications
async function viewNotifications() {
    const panel = document.getElementById('notificationsPanel');
    const body = document.getElementById('notificationsBody');
    
    panel.classList.add('active');
    body.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading notifications...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_BASE_URL}/notifications?page=0&size=20&sort=createdAt,desc`, {
            headers: authHeaders
        });
        
        if (!response.ok) {
            throw new Error('Failed to load notifications');
        }
        
        const data = await response.json();
        displayNotifications(data.content);
        
        // Mark as read
        await markNotificationsAsRead();
    } catch (error) {
        body.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Notifications</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Display notifications
function displayNotifications(notifications) {
    const body = document.getElementById('notificationsBody');
    
    if (!notifications || notifications.length === 0) {
        body.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <h3>No Notifications</h3>
                <p>You're all caught up!</p>
            </div>
        `;
        return;
    }
    
    body.innerHTML = notifications.map(notification => {
        const time = new Date(notification.createdAt);
        const timeAgo = getTimeAgo(time);
        const readClass = notification.read ? '' : 'unread';
        
        return `
            <div class="notification-item ${readClass}">
                <div class="notification-header">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
                <div class="notification-message">${notification.message}</div>
                <span class="notification-type ${notification.type.toLowerCase()}">${notification.type}</span>
            </div>
        `;
    }).join('');
}

// Get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    return date.toLocaleDateString();
}

// Mark notifications as read
async function markNotificationsAsRead() {
    try {
        await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
            method: 'PUT',
            headers: authHeaders
        });
        
        // Update badge count
        document.getElementById('notificationCount').style.display = 'none';
        document.getElementById('notificationCount').textContent = '0';
    } catch (error) {
        console.error('Error marking notifications as read:', error);
    }
}

// Close notifications panel
function closeNotifications() {
    document.getElementById('notificationsPanel').classList.remove('active');
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}
