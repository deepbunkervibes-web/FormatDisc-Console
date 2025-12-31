/**
 * Format Disc - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initThemeToggle();
    initMobileMenu();
    initBackToTop();
    initGitHubRepos();
    initContactForm();
    initAnimations();
    initTestimonialsSlider();
});

/**
 * Theme Toggle Functionality
 */
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = themeToggleBtn.querySelector('i');
    
    // Check for saved theme preference or respect OS preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        document.body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
    
    // Toggle theme on button click
    themeToggleBtn.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        
        // Update icon
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });
}

/**
 * Mobile Menu Functionality
 */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuIcon = mobileMenuBtn.querySelector('i');
    
    // Create mobile menu if it doesn't exist
    let mobileMenu = document.querySelector('.mobile-menu');
    if (!mobileMenu) {
        mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        
        // Clone navigation links
        const navLinks = document.querySelector('.main-nav ul').cloneNode(true);
        mobileMenu.appendChild(navLinks);
        
        document.body.appendChild(mobileMenu);
    }
    
    // Toggle mobile menu on button click
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        
        // Update icon
        if (mobileMenu.classList.contains('active')) {
            mobileMenuIcon.classList.remove('fa-bars');
            mobileMenuIcon.classList.add('fa-times');
        } else {
            mobileMenuIcon.classList.remove('fa-times');
            mobileMenuIcon.classList.add('fa-bars');
        }
    });
    
    // Close mobile menu when clicking on a link
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            mobileMenuIcon.classList.remove('fa-times');
            mobileMenuIcon.classList.add('fa-bars');
        });
    });
    
    // Close mobile menu when resizing to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            mobileMenuIcon.classList.remove('fa-times');
            mobileMenuIcon.classList.add('fa-bars');
        }
    });
}

/**
 * Back to Top Button Functionality
 */
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top on button click
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * GitHub Repositories Functionality
 * Note: In a real implementation, this would fetch actual data from GitHub API
 * For this demo, we're using the placeholder data already in the HTML
 */
function initGitHubRepos() {
    // In a real implementation, you would fetch data from GitHub API
    // Example:
    /*
    const username = 'formatdisc';
    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=3`)
        .then(response => response.json())
        .then(data => {
            const reposContainer = document.querySelector('.github-repos');
            reposContainer.innerHTML = '';
            
            data.forEach(repo => {
                const repoCard = document.createElement('div');
                repoCard.className = 'repo-card';
                
                const languageColor = getLanguageColor(repo.language);
                
                repoCard.innerHTML = `
                    <h4>${repo.name}</h4>
                    <p>${repo.description || 'No description available'}</p>
                    <div class="repo-stats">
                        <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                        <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                    </div>
                    <div class="repo-language">
                        <span class="language-color" style="background-color: ${languageColor};"></span>
                        <span>${repo.language || 'No language detected'}</span>
                    </div>
                `;
                
                reposContainer.appendChild(repoCard);
            });
        })
        .catch(error => console.error('Error fetching GitHub repos:', error));
    */
}

/**
 * Helper function to get color for programming language
 */
function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#2b7489',
        'Python': '#3572A5',
        'Java': '#b07219',
        'C#': '#178600',
        'PHP': '#4F5D95',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Swift': '#ffac45',
        'Kotlin': '#F18E33'
    };
    
    return colors[language] || '#858585';
}

/**
 * Contact Form Functionality
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            
            // Send data to server
            fetch('contact.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                // Create success message
                const successMessage = document.createElement('div');
                successMessage.className = 'form-success-message';
                successMessage.innerHTML = `
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>Hvala na upitu!</h3>
                    <p>Vaša poruka je uspješno poslana. Odgovorit ćemo vam u najkraćem mogućem roku.</p>
                `;
                
                // Replace form with success message
                contactForm.innerHTML = '';
                contactForm.appendChild(successMessage);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Došlo je do greške prilikom slanja poruke. Molimo pokušajte ponovno.');
            });
        });
    }
}

/**
 * Animations Functionality
 */
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe section headers
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
        observer.observe(header);
    });
    
    // Observe service cards
    const serviceCards = document.querySelectorAll('.solution-card');
    serviceCards.forEach(card => {
        observer.observe(card);
    });
    
    // Observe about content
    const aboutContent = document.querySelector('.about-content');
    if (aboutContent) {
        observer.observe(aboutContent);
    }
    
    // Observe repo cards
    const repoCards = document.querySelectorAll('.repo-card');
    repoCards.forEach(card => {
        observer.observe(card);
    });
    
    // Observe blog cards
    const blogCards = document.querySelectorAll('.blog-card');
    blogCards.forEach(card => {
        observer.observe(card);
    });
    
    // Observe testimonials
    const testimonials = document.querySelectorAll('.testimonial');
    testimonials.forEach(testimonial => {
        observer.observe(testimonial);
    });
    
    // Observe contact section
    const contactSection = document.querySelector('.contact-container');
    if (contactSection) {
        observer.observe(contactSection);
    }
    
    // Observe project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        observer.observe(card);
    });
    
    // Observe tool cards
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        observer.observe(card);
    });
}

/**
 * Testimonials Slider Functionality
 */
function initTestimonialsSlider() {
    const slider = document.querySelector('.testimonials-slider');
    
    if (!slider) return;
    
    let isDown = false;
    let startX;
    let scrollLeft;
    
    // Mouse events for desktop
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    
    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active');
    });
    
    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
    });
    
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed
        slider.scrollLeft = scrollLeft - walk;
    });
    
    // Touch events for mobile
    slider.addEventListener('touchstart', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.touches[0].pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    
    slider.addEventListener('touchend', () => {
        isDown = false;
        slider.classList.remove('active');
    });
    
    slider.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed
        slider.scrollLeft = scrollLeft - walk;
    });
    
    // Auto scroll functionality
    let autoScrollInterval;
    
    function startAutoScroll() {
        autoScrollInterval = setInterval(() => {
            slider.scrollLeft += 1;
            
            // Reset scroll position when reaching the end
            if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth) {
                slider.scrollLeft = 0;
            }
        }, 30);
    }
    
    function stopAutoScroll() {
        clearInterval(autoScrollInterval);
    }
    
    // Start auto scroll
    startAutoScroll();
    
    // Stop auto scroll on interaction
    slider.addEventListener('mouseenter', stopAutoScroll);
    slider.addEventListener('touchstart', stopAutoScroll);
    
    // Resume auto scroll after interaction
    slider.addEventListener('mouseleave', startAutoScroll);
    slider.addEventListener('touchend', startAutoScroll);
}