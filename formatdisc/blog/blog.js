/**
 * Format Disc - Blog Specific JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize blog-specific components
    initCategoryFilter();
    initNewsletterForm();
    initBlogSearch();
});

/**
 * Category Filter Functionality
 */
function initCategoryFilter() {
    const categoryTags = document.querySelectorAll('.category-tag');
    const blogCards = document.querySelectorAll('.blog-card');
    
    if (!categoryTags.length) return;
    
    categoryTags.forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tags
            categoryTags.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tag
            this.classList.add('active');
            
            const category = this.textContent.trim();
            
            // If "All Categories" is selected, show all blog cards
            if (category === 'Sve kategorije') {
                blogCards.forEach(card => {
                    card.style.display = 'block';
                    
                    // Add animation
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    }, 10);
                });
                return;
            }
            
            // Filter blog cards based on category
            blogCards.forEach(card => {
                const cardCategory = card.querySelector('.post-category')?.textContent.trim();
                
                if (cardCategory === category) {
                    card.style.display = 'block';
                    
                    // Add animation
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    }, 10);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

/**
 * Newsletter Form Functionality
 */
function initNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (!email) {
            showFormMessage(newsletterForm, 'Molimo unesite vašu email adresu.', 'error');
            return;
        }
        
        // In a real implementation, you would send this data to a server
        // For this demo, we'll just show a success message
        
        // Clear input
        emailInput.value = '';
        
        // Show success message
        showFormMessage(newsletterForm, 'Uspješno ste se pretplatili na naš newsletter!', 'success');
        
        // Log for demo purposes
        console.log('Newsletter subscription:', email);
    });
}

/**
 * Helper function to show form messages
 */
function showFormMessage(form, message, type) {
    // Remove any existing message
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `form-message ${type}`;
    messageElement.textContent = message;
    
    // Add message after form
    form.insertAdjacentElement('afterend', messageElement);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

/**
 * Blog Search Functionality
 */
function initBlogSearch() {
    // This would be implemented in a real blog with a search form
    // For this demo, we'll just add the functionality structure
    
    // Example implementation:
    /*
    const searchForm = document.querySelector('.blog-search-form');
    
    if (!searchForm) return;
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const searchInput = this.querySelector('input[type="search"]');
        const searchTerm = searchInput.value.trim();
        
        if (!searchTerm) {
            return;
        }
        
        // In a real implementation, you would search the blog posts
        // For this demo, we'll just log the search term
        console.log('Blog search:', searchTerm);
        
        // You would typically:
        // 1. Send the search term to a server
        // 2. Get back matching blog posts
        // 3. Update the DOM to show the results
    });
    */
}

/**
 * Comment Form Functionality (for individual blog posts)
 */
function initCommentForm() {
    const commentForm = document.querySelector('.comment-form form');
    
    if (!commentForm) return;
    
    commentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const nameInput = this.querySelector('#comment-name');
        const emailInput = this.querySelector('#comment-email');
        const contentInput = this.querySelector('#comment-content');
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const content = contentInput.value.trim();
        
        if (!name || !email || !content) {
            showFormMessage(commentForm, 'Molimo ispunite sva obavezna polja.', 'error');
            return;
        }
        
        // In a real implementation, you would send this data to a server
        // For this demo, we'll just show a success message
        
        // Clear inputs
        nameInput.value = '';
        emailInput.value = '';
        contentInput.value = '';
        
        // Show success message
        showFormMessage(commentForm, 'Vaš komentar je uspješno poslan i čeka odobrenje.', 'success');
        
        // Log for demo purposes
        console.log('Comment submission:', { name, email, content });
    });
}

/**
 * Share Functionality (for individual blog posts)
 */
function initShareButtons() {
    const shareButtons = document.querySelectorAll('.share-button');
    
    if (!shareButtons.length) return;
    
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const platform = this.dataset.platform;
            const postUrl = window.location.href;
            const postTitle = document.title;
            
            let shareUrl;
            
            switch (platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postTitle)}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(postTitle)}`;
                    break;
                case 'email':
                    shareUrl = `mailto:?subject=${encodeURIComponent(postTitle)}&body=${encodeURIComponent(postUrl)}`;
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
}

/**
 * Reading Time Calculation (for individual blog posts)
 */
function calculateReadingTime() {
    const articleContent = document.querySelector('.blog-post-content');
    const readingTimeElement = document.querySelector('.reading-time');
    
    if (!articleContent || !readingTimeElement) return;
    
    // Get all text content
    const text = articleContent.textContent;
    
    // Calculate reading time (average reading speed: 200 words per minute)
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    // Update reading time element
    readingTimeElement.textContent = `${readingTime} min čitanja`;
}

/**
 * Table of Contents Generation (for individual blog posts)
 */
function generateTableOfContents() {
    const articleContent = document.querySelector('.blog-post-content');
    const tocContainer = document.querySelector('.table-of-contents');
    
    if (!articleContent || !tocContainer) return;
    
    // Get all headings
    const headings = articleContent.querySelectorAll('h2, h3');
    
    if (headings.length === 0) {
        tocContainer.style.display = 'none';
        return;
    }
    
    // Create list
    const tocList = document.createElement('ul');
    
    headings.forEach((heading, index) => {
        // Add ID to heading if it doesn't have one
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }
        
        // Create list item
        const listItem = document.createElement('li');
        
        // Create link
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent;
        
        // Add class based on heading level
        if (heading.tagName === 'H3') {
            listItem.classList.add('toc-subitem');
        }
        
        // Add link to list item
        listItem.appendChild(link);
        
        // Add list item to list
        tocList.appendChild(listItem);
    });
    
    // Add list to container
    tocContainer.appendChild(tocList);
}