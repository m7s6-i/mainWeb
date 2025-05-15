/**
 * London Ice Cream - Modern Website
 * Main JavaScript file
 */

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing website');
    
    // Initialize custom cursor
    initCustomCursor();
    
    // Initialize navigation menu
    initNavigation();
    
    // Initialize scroll effects
    initScrollEffects();
    
    // Use demo data instead of API calls
    displayDemoContent();
    
    // Initialize form validation
    initFormValidation();
    
    // Direct event listeners
    setupButtons();
});

/**
 * Custom cursor
 */
function initCustomCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    if (!cursor || !cursorFollower) return;
    
    document.addEventListener('mousemove', function(e) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        setTimeout(function() {
            cursorFollower.style.left = e.clientX + 'px';
            cursorFollower.style.top = e.clientY + 'px';
        }, 100);
    });
    
    // Add hover effect to links and buttons
    const links = document.querySelectorAll('a, button, .nav-toggle, .flavor-card, .event-card, .feature, .contact-card');
    
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursorFollower.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursorFollower.style.backgroundColor = 'rgba(255, 133, 162, 0.2)';
        });
        
        link.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorFollower.style.backgroundColor = 'transparent';
        });
    });
    
    // Hide cursor on mobile devices
    if (window.innerWidth <= 768) {
        cursor.style.display = 'none';
        cursorFollower.style.display = 'none';
    }
}

/**
 * Navigation functionality
 */
function initNavigation() {
    const header = document.getElementById('header');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Toggle mobile menu
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
            navToggle.classList.toggle('active');
            
            if (navToggle.classList.contains('active')) {
                navToggle.querySelector('span:nth-child(1)').style.transform = 'rotate(45deg) translate(5px, 5px)';
                navToggle.querySelector('span:nth-child(2)').style.opacity = '0';
                navToggle.querySelector('span:nth-child(3)').style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                navToggle.querySelector('span:nth-child(1)').style.transform = 'none';
                navToggle.querySelector('span:nth-child(2)').style.opacity = '1';
                navToggle.querySelector('span:nth-child(3)').style.transform = 'none';
            }
        });
    }
    
    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('show');
            if (navToggle) {
                navToggle.classList.remove('active');
                navToggle.querySelector('span:nth-child(1)').style.transform = 'none';
                navToggle.querySelector('span:nth-child(2)').style.opacity = '1';
                navToggle.querySelector('span:nth-child(3)').style.transform = 'none';
            }
        });
    });
    
    // Active link on scroll
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/**
 * Scroll effects
 */
function initScrollEffects() {
    const header = document.getElementById('header');
    const backToTop = document.querySelector('.back-to-top');
    
    // Header scroll effect
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Back to top button
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });
        
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Fetch and display menu items
 */
function fetchMenuItems() {
    const flavorsGrid = document.getElementById('flavorsGrid');
    const flavorFilters = document.querySelectorAll('.flavor-filter');
    
    if (!flavorsGrid) return;
    
    // Fetch menu items from API with cache-busting
    const timestamp = new Date().getTime();
    const random = Math.random();
    fetch(`/api/menu-items?_=${timestamp}&r=${random}`, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Accept': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch menu items');
            }
            return response.json();
        })
        .then(data => {
            // Clear loading spinner
            flavorsGrid.innerHTML = '';
            
            // Check if data is available
            if (!data || data.length === 0) {
                flavorsGrid.innerHTML = '<p class="no-items">No ice cream flavors available at the moment.</p>';
                return;
            }
            
            // Process and display menu items
            data.forEach(item => {
                // Determine category
                let category = 'ice-cream';
                if (item.name.toLowerCase().includes('sorbet')) {
                    category = 'sorbet';
                } else if (item.name.toLowerCase().includes('gelato')) {
                    category = 'gelato';
                }
                
                // Create flavor card
                const flavorCard = document.createElement('div');
                flavorCard.className = `flavor-card ${category}`;
                flavorCard.innerHTML = `
                    <div class="flavor-image">
                        <img src="${item.image || 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'}" alt="${item.name}">
                        <span class="flavor-category">${capitalizeFirstLetter(category)}</span>
                    </div>
                    <div class="flavor-content">
                        <div class="flavor-info">
                            <h3 class="flavor-title">${item.name}</h3>
                            <span class="flavor-price">$${Number(item.price).toFixed(2)}</span>
                        </div>
                        <p class="flavor-description">${item.description || 'A delicious handcrafted ice cream made with the finest ingredients.'}</p>
                        <div class="flavor-footer">
                            <span class="flavor-ingredients">${item.ingredients || 'Natural ingredients'}</span>
                            <button class="flavor-btn">
                                Order Now <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                flavorsGrid.appendChild(flavorCard);
            });
            
            // Initialize flavor filters
            if (flavorFilters.length > 0) {
                flavorFilters.forEach(filter => {
                    filter.addEventListener('click', () => {
                        // Set active class
                        flavorFilters.forEach(f => f.classList.remove('active'));
                        filter.classList.add('active');
                        
                        // Filter flavors
                        const filterValue = filter.getAttribute('data-filter');
                        const flavorCards = document.querySelectorAll('.flavor-card');
                        
                        flavorCards.forEach(card => {
                            if (filterValue === 'all') {
                                card.style.display = 'block';
                            } else if (card.classList.contains(filterValue)) {
                                card.style.display = 'block';
                            } else {
                                card.style.display = 'none';
                            }
                        });
                    });
                });
            }
        })
        .catch(error => {
            console.error('Error fetching menu items:', error);
            flavorsGrid.innerHTML = `<p class="error">Failed to load ice cream flavors. Please try again later.</p>`;
        });
}

/**
 * Fetch and display events
 */
function fetchEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    
    if (!eventsGrid) return;
    
    // Show loading state
    eventsGrid.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading events...</p>
        </div>
    `;
    
    // Fetch events from API
    fetch('/api/events')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                eventsGrid.innerHTML = `<p class="no-items">No upcoming events at the moment. Check back soon!</p>`;
                return;
            }
            
            // Create event cards
            let eventsHTML = '';
            data.forEach(event => {
                const eventDate = new Date(event.date);
                const formattedDate = eventDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                eventsHTML += `
                    <div class="event-card" data-event-id="${event.id}" data-location="${event.location}" data-lat="${event.lat}" data-lng="${event.lng}">
                        <div class="event-image">
                            <img src="${event.image || 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'}" alt="${event.name}">
                            <div class="event-date">
                                <span class="day">${eventDate.getDate()}</span>
                                <span class="month">${eventDate.toLocaleString('en-US', { month: 'short' })}</span>
                            </div>
                        </div>
                        <div class="event-content">
                            <h3 class="event-title">${event.name}</h3>
                            <div class="event-meta">
                                <div class="event-time"><i class="far fa-clock"></i> ${event.time}</div>
                                <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
                            </div>
                            <p class="event-desc">${event.description}</p>
                            <button class="map-btn" title="Show on map" onclick="showEventLocation(${event.lat}, ${event.lng}, '${event.name}', '${event.location}')">
                                <i class="fas fa-map-marked-alt"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            eventsGrid.innerHTML = eventsHTML;
            
            // Add event listeners for map buttons
            document.querySelectorAll('.map-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const card = this.closest('.event-card');
                    const lat = parseFloat(card.dataset.lat);
                    const lng = parseFloat(card.dataset.lng);
                    const name = card.querySelector('.event-title').textContent;
                    const location = card.dataset.location;
                    
                    showEventLocation(lat, lng, name, location);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            eventsGrid.innerHTML = `<p class="error">Failed to load events. Please try again later.</p>`;
            
            // For demo purposes, show sample events if API fails
            // In production, you would handle this differently
            setTimeout(loadSampleEvents, 500);
        });
}

/**
 * Show event location on map
 */
function showEventLocation(lat, lng, name, address) {
    const mapContainer = document.getElementById('eventMapContainer');
    const mapElement = document.getElementById('eventMap');
    
    if (!mapContainer || !mapElement) return;
    
    // Show map container
    mapContainer.style.display = 'block';
    
    // Scroll to map
    mapContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Update map title
    const mapTitle = mapContainer.querySelector('.map-title');
    if (mapTitle) {
        mapTitle.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${name} - ${address}`;
    }
    
    // Initialize Google Maps
    if (window.google && window.google.maps) {
        initEventMap(lat, lng, name, address);
    } else {
        // Load Google Maps API if not already loaded
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initEventMap';
        script.defer = true;
        script.async = true;
        script.onload = function() {
            initEventMap(lat, lng, name, address);
        };
        document.head.appendChild(script);
    }
}

/**
 * Initialize event map
 */
function initEventMap(lat, lng, name, address) {
    const mapElement = document.getElementById('eventMap');
    if (!mapElement) return;
    
    // Default to London if coordinates not provided
    lat = lat || 51.507351;
    lng = lng || -0.127758;
    
    const location = { lat, lng };
    
    // Create map
    const map = new google.maps.Map(mapElement, {
        zoom: 15,
        center: location,
        styles: [
            {
                "featureType": "administrative",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#444444"}]
            },
            {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [{"color": "#f2f2f2"}]
            },
            {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [{"visibility": "off"}]
            },
            {
                "featureType": "road",
                "elementType": "all",
                "stylers": [{"saturation": -100},{"lightness": 45}]
            },
            {
                "featureType": "road.highway",
                "elementType": "all",
                "stylers": [{"visibility": "simplified"}]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.icon",
                "stylers": [{"visibility": "off"}]
            },
            {
                "featureType": "transit",
                "elementType": "all",
                "stylers": [{"visibility": "off"}]
            },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": [{"color": "#c4e8ff"},{"visibility": "on"}]
            }
        ]
    });
    
    // Add marker
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: name,
        animation: google.maps.Animation.DROP
    });
    
    // Add info window
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 10px; max-width: 200px;">
                <h3 style="margin-top: 0; color: #ff85a2;">${name}</h3>
                <p>${address}</p>
                <a href="https://maps.google.com/?q=${lat},${lng}" target="_blank" style="color: #ff85a2;">Get Directions</a>
            </div>
        `
    });
    
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
    
    // Open info window by default
    infoWindow.open(map, marker);
}

/**
 * Load sample events (for demo purposes)
 */
function loadSampleEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;
    
    const sampleEvents = [
        {
            id: 1,
            name: "Summer Ice Cream Festival",
            date: "2025-06-15T14:00:00",
            time: "2:00 PM - 6:00 PM",
            location: "Hyde Park",
            description: "Join us for a day of unlimited ice cream tastings, games, and summer fun!",
            image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
            lat: 51.507268,
            lng: -0.165730
        },
        {
            id: 2,
            name: "Charity Fundraiser",
            date: "2025-05-22T18:30:00",
            time: "6:30 PM - 9:00 PM",
            location: "Covent Garden",
            description: "Ice cream social to raise funds for local children's hospital. Special flavors available only at this event!",
            image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
            lat: 51.5117,
            lng: -0.1240
        },
        {
            id: 3,
            name: "New Flavor Launch Party",
            date: "2025-05-10T19:00:00",
            time: "7:00 PM - 10:00 PM",
            location: "Camden Market",
            description: "Be the first to taste our new summer flavors! Live music and special discounts all evening.",
            image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
            lat: 51.5415,
            lng: -0.1466
        }
    ];
    
    let eventsHTML = '';
    sampleEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        eventsHTML += `
            <div class="event-card" data-event-id="${event.id}" data-location="${event.location}" data-lat="${event.lat}" data-lng="${event.lng}">
                <div class="event-image">
                    <img src="${event.image}" alt="${event.name}">
                    <div class="event-date">
                        <span class="day">${eventDate.getDate()}</span>
                        <span class="month">${eventDate.toLocaleString('en-US', { month: 'short' })}</span>
                    </div>
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.name}</h3>
                    <div class="event-meta">
                        <div class="event-time"><i class="far fa-clock"></i> ${event.time}</div>
                        <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
                    </div>
                    <p class="event-desc">${event.description}</p>
                    <button class="map-btn" title="Show on map" onclick="showEventLocation(${event.lat}, ${event.lng}, '${event.name}', '${event.location}')">
                        <i class="fas fa-map-marked-alt"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    eventsGrid.innerHTML = eventsHTML;
    
    // Add event listeners for map buttons
    document.querySelectorAll('.map-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.event-card');
            const lat = parseFloat(card.dataset.lat);
            const lng = parseFloat(card.dataset.lng);
            const name = card.querySelector('.event-title').textContent;
            const location = card.dataset.location;
            
            showEventLocation(lat, lng, name, location);
        });
    });
}

/**
 * Initialize form validation
 */
function initFormValidation() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Gather form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            // Simple validation
            if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                alert('Please fill in all fields');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Show submitting state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Submit to backend API
            fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': getCsrfToken()
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to send message');
                }
                return response.json();
            })
            .then(data => {
                alert(data.message || 'Thank you for your message! We will get back to you soon.');
                contactForm.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error sending your message. Please try again later.');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            });
        });
    }
    
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            
            // Simple validation
            if (!emailInput.value) {
                alert('Please enter your email address');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Show submitting state
            const submitButton = newsletterForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Subscribing...';
            submitButton.disabled = true;
            
            // Submit to backend API
            fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': getCsrfToken()
                },
                body: JSON.stringify({ email: emailInput.value })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to subscribe');
                }
                return response.json();
            })
            .then(data => {
                alert(data.message || 'Thank you for subscribing to our newsletter!');
                newsletterForm.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error subscribing to the newsletter. Please try again later.');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            });
        });
    }
    
    // Admin form validation
    const adminForm = document.getElementById('adminLoginForm');
    
    if (adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const usernameInput = adminForm.querySelector('input[name="username"]');
            const passwordInput = adminForm.querySelector('input[name="password"]');
            
            // Simple validation
            if (!usernameInput.value || !passwordInput.value) {
                alert('Please enter both username and password');
                return;
            }
            
            // Show submitting state
            const submitButton = adminForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Logging in...';
            submitButton.disabled = true;
            
            // Submit to backend API
            fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': getCsrfToken()
                },
                body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to login');
                }
                return response.json();
            })
            .then(data => {
                alert(data.message || 'Logged in successfully!');
                adminForm.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error logging in. Please try again later.');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            });
        });
    }
    
    // Validation rules
    const menuItemSchema = {
        name: { min: 3, max: 50 },
        price: { min: 0, max: 100 },
        description: { max: 255 }
    };
}

/**
 * Helper function to capitalize first letter
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// CSRF token handling
function getCsrfToken() {
    return document.getElementById('csrf-token').getAttribute('content');
}

// Update CSRF token when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Fetch a new CSRF token
    fetch('/api/csrf-token')
        .then(response => response.json())
        .then(data => {
            if (data.csrfToken) {
                document.getElementById('csrf-token').setAttribute('content', data.csrfToken);
            }
        })
        .catch(error => {
            console.error('CSRF token fetch error:', error);
        });
});

/**
 * Set up button event listeners
 */
function setupButtons() {
    console.log('Setting up button event listeners');
    
    // Set up dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.onclick = function() {
            console.log('Dark mode toggle clicked');
            toggleDarkMode();
        };
    }
    
    // Set up admin login button
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    if (adminLoginBtn) {
        adminLoginBtn.onclick = function() {
            console.log('Admin login button clicked');
            showAdminModal();
        };
    }
    
    // Initialize dark mode based on saved preference
    initDarkMode();
}

/**
 * Toggle dark mode function
 */
function toggleDarkMode() {
    console.log('Toggling dark mode');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) toggle.innerHTML = '<i class="fas fa-moon"></i>';
        toggle.setAttribute('aria-label', 'Switch to dark mode');
        toggle.title = 'Switch to dark mode';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) toggle.innerHTML = '<i class="fas fa-sun"></i>';
        toggle.setAttribute('aria-label', 'Switch to light mode');
        toggle.title = 'Switch to light mode';
    }
}

/**
 * Initialize dark mode
 */
function initDarkMode() {
    console.log('Initializing dark mode');
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;
    
    // Check user preference
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    // Apply theme based on saved preference or system preference
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkMode)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

/**
 * Initialize admin functionality
 */
function initAdmin() {
    // Add event listener for admin login button
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', function() {
            showAdminLoginModal();
        });
        console.log('Admin login button listener added');
    } else {
        console.log('Admin login button not found');
    }
    
    // Check admin login status
    checkAdminStatus();
    
    // Add event listener for logout
    const logoutBtn = document.querySelector('.nav-link[href$="logout"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleAdminLogout);
    }
}

/**
 * Show admin modal
 */
function showAdminModal() {
    console.log('Showing admin modal');
    const modal = document.getElementById('adminLoginModal');
    
    if (!modal) {
        console.error('Admin modal not found - creating fallback');
        createAdminModal();
        return;
    }
    
    // Make sure the modal is visible
    modal.style.display = 'flex';
    modal.classList.add('active');
    
    // Focus the username field
    setTimeout(() => {
        const usernameField = document.getElementById('adminUsername');
        if (usernameField) usernameField.focus();
    }, 100);
}

/**
 * Create admin modal if not found
 */
function createAdminModal() {
    const modal = document.createElement('div');
    modal.id = 'adminLoginModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Admin Login</h2>
            <form id="adminLoginForm">
                <div class="form-group">
                    <label for="adminUsername">Username</label>
                    <input type="text" id="adminUsername" required>
                </div>
                <div class="form-group">
                    <label for="adminPassword">Password</label>
                    <input type="password" id="adminPassword" required>
                </div>
                <button type="submit" class="btn">Login</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    modal.classList.add('active');
    
    // Add close handler
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
            modal.classList.remove('active');
        };
    }
    
    // Close when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
    });
    
    // Add form handler
    const form = modal.querySelector('#adminLoginForm');
    if (form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            alert('Login successful (demo)');
            modal.style.display = 'none';
            modal.classList.remove('active');
        };
    }
}

// Close Modal Handler
function closeAdminModal() {
    console.log('Closing admin modal');
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        // Reset form when closing
        const loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            loginForm.reset();
        }
    }
}

/**
 * Set up all modals and buttons
 */
function setupAllModals() {
    // Close buttons for all modals
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
            
            // If this is the admin modal, use the specific close function
            if (modal && modal.id === 'adminLoginModal') {
                closeAdminModal();
            }
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            e.target.classList.remove('active');
            
            // If this is the admin modal, use the specific close function
            if (e.target.id === 'adminLoginModal') {
                closeAdminModal();
            }
        }
    });
    
    // Set up admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
}

/**
 * Handle admin login form submission
 */
function handleAdminLogin(e) {
    e.preventDefault();
    console.log('Admin login form submitted');
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // Get the submit button
    const submitBtn = this.querySelector('button[type="submit"]');
    
    // Disable form to prevent multiple submissions
    if (submitBtn) submitBtn.disabled = true;
    
    // For demo purposes, accept any login
    // In a real app, you would validate credentials with the server
    setTimeout(() => {
        console.log('Login successful');
        closeAdminModal();
        showAdminControls();
        
        // Store admin session in localStorage
        localStorage.setItem('adminLoggedIn', 'true');
    }, 1000);
    
    // Actual server implementation would be:
    /*
    fetch('/api/admin/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    })
    .then(data => {
        closeAdminModal();
        showAdminControls();
    })
    .catch(error => {
        alert('Login failed: ' + error.message);
        // Re-enable form after error
        if (submitBtn) submitBtn.disabled = false;
    });
    */
}

/**
 * Handle admin logout
 */
function handleAdminLogout(e) {
    if (e) e.preventDefault();
    console.log('Admin logout');
    
    // For demo purposes, just perform the logout actions
    hideAdminControls();
    // Remove admin session from localStorage
    localStorage.removeItem('adminLoggedIn');
    
    // Show admin login button again
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    if (adminLoginBtn) {
        adminLoginBtn.style.display = 'block';
    }
    
    // Actual server implementation would be:
    /*
    fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': getCsrfToken()
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Logout failed');
        return response.json();
    })
    .then(data => {
        hideAdminControls();
        // Remove any admin session data
        document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        localStorage.removeItem('adminLoggedIn');
}

// Show admin controls
function showAdminControls() {
console.log('Showing admin controls');
// Remove any existing admin controls to prevent duplicates
const existingAdminControls = document.querySelectorAll('.admin-controls');
existingAdminControls.forEach(controls => controls.remove());

// Hide admin login button when already logged in
const adminLoginBtn = document.getElementById('adminLoginBtn');
if (adminLoginBtn) {
adminLoginBtn.style.display = 'none';
}

// Update navigation
const nav = document.querySelector('.nav-menu');
if (nav) {
// Remove any existing logout button
const existingLogout = nav.querySelector('.nav-link[href$="logout"]');
if (existingLogout) {
existingLogout.remove();
}

// Create list item for the logout link
const logoutItem = document.createElement('li');

// Add logout button
const logoutLink = document.createElement('a');
logoutLink.className = 'nav-link';
logoutLink.href = '#';
logoutLink.textContent = 'Logout (Admin)';

// Add to DOM
logoutItem.appendChild(logoutLink);
nav.appendChild(logoutItem);

// Add click handler
logoutLink.addEventListener('click', handleAdminLogout);
}
}

// Hide admin controls
function hideAdminControls() {
    removeMenuAdminControls();
    removeEventAdminControls();
    
    // Remove logout button from navigation
    const nav = document.querySelector('.nav-menu');
    if (nav) {
        const logoutLink = nav.querySelector('.nav-link[href$="logout"]');
        if (logoutLink) {
            logoutLink.remove();
        }
    }
}

/**
 * Load demo data for menu and events
 */
/**
 * Display demo content for menu and events
 */
function displayDemoContent() {
    console.log('Loading demo content');
    
    // Demo menu items
    const menuItems = [
        {
            name: 'Vanilla Bean',
            description: 'Classic vanilla ice cream with real vanilla bean specks',
            price: 3.99,
            category: 'ice-cream',
            image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
            featured: true
        },
        {
            name: 'Chocolate Fudge',
            description: 'Rich chocolate ice cream with fudge swirls',
            price: 4.50,
            category: 'ice-cream',
            image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80'
        },
        {
            name: 'Strawberry Sorbet',
            description: 'Refreshing strawberry sorbet made with fresh berries',
            price: 3.50,
            category: 'sorbet',
            image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80'
        }
    ];
    
    // Demo events
    const events = [
        {
            name: 'Summer Ice Cream Festival',
            date: '2025-07-15',
            time: '12:00 PM - 6:00 PM',
            location: 'Central Park, London',
            description: 'Join us for a day of ice cream tasting, games, and fun!',
            image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'
        },
        {
            name: 'Ice Cream Making Workshop',
            date: '2025-08-20',
            time: '2:00 PM - 4:00 PM',
            location: 'London Ice Cream Shop',
            description: 'Learn how to make your own ice cream with our master chef!',
            image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'
        }
    ];
    
    // Display menu items
    const menuGrid = document.getElementById('menuGrid');
    if (menuGrid) {
        menuGrid.innerHTML = '';
        
        menuItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'flavor-card';
            card.dataset.category = item.category;
            card.innerHTML = `
                <div class="flavor-image">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="flavor-category">${item.category}</div>
                    ${item.featured ? '<div class="flavor-featured">Featured</div>' : ''}
                </div>
                <div class="flavor-content">
                    <h3 class="flavor-title">${item.name}</h3>
                    <p class="flavor-desc">${item.description}</p>
                    <div class="flavor-price">$${item.price.toFixed(2)}</div>
                </div>
            `;
            menuGrid.appendChild(card);
        });
    }
    
    // Display events
    const eventsGrid = document.getElementById('eventsGrid');
    if (eventsGrid) {
        eventsGrid.innerHTML = '';
        
        events.forEach(event => {
            const eventDate = new Date(event.date);
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div class="event-image">
                    <img src="${event.image}" alt="${event.name}">
                    <div class="event-date">
                        <span class="day">${eventDate.getDate()}</span>
                        <span class="month">${eventDate.toLocaleString('en-US', { month: 'short' })}</span>
                    </div>
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.name}</h3>
                    <div class="event-meta">
                        <div class="event-time"><i class="far fa-clock"></i> ${event.time}</div>
                        <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
                    </div>
                    <p class="event-desc">${event.description}</p>
                    <button class="btn btn-outline">View Details</button>
                </div>
            `;
            eventsGrid.appendChild(card);
        });
    }
}

/**
 * Initialize dark mode
 */
function initDarkMode() {
    console.log('Initializing dark mode');
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;
    
    // Check user preference
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    // Apply theme based on saved preference or system preference
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkMode)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}
}