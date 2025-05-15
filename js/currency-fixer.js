/**
 * Currency Symbol Fixer
 * This script ensures all price displays on the site use the $ symbol consistently
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initial fix when page loads
    fixCurrencySymbols();
    
    // Also run the fix after a short delay to catch dynamically loaded content
    setTimeout(fixCurrencySymbols, 500);
    setTimeout(fixCurrencySymbols, 1500);
    
    // For single-page applications, you might want to run it again when page sections change
    document.addEventListener('click', function(e) {
        if (e.target.closest('a[href^="#"]')) {
            setTimeout(fixCurrencySymbols, 300);
        }
    });
    
    // Listen for DOM changes to fix any new price elements
    const observer = new MutationObserver(function() {
        fixCurrencySymbols();
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
});

/**
 * Find and fix all price displays on the page
 */
function fixCurrencySymbols() {
    // Select all elements that might contain price information
    const priceElements = document.querySelectorAll('.price, .item-price, .flavor-price, [class*="price"]');
    
    priceElements.forEach(function(element) {
        // Get the text content
        const text = element.textContent.trim();
        
        // Check if it contains a currency symbol
        if (text.match(/[£€¥₹]/)) {
            // Extract the number part
            const numericPart = parseFloat(text.replace(/[^0-9.]/g, ''));
            if (!isNaN(numericPart)) {
                // Replace with $ symbol
                element.textContent = `$${numericPart.toFixed(2)}`;
            }
        }
        // Also look for elements with formatted numbers that might need a currency symbol
        else if (text.match(/^\s*\d+\.\d{2}\s*$/)) {
            const numericPart = parseFloat(text);
            if (!isNaN(numericPart)) {
                element.textContent = `$${numericPart.toFixed(2)}`;
            }
        }
    });
    
    // Special case for elements with Vanilla Bean that might have £ symbol
    const menuCards = document.querySelectorAll('.menu-card, .menu-item');
    menuCards.forEach(function(card) {
        if (card.textContent.includes('Vanilla Bean')) {
            const priceElement = card.querySelector('.price');
            if (priceElement && priceElement.textContent.includes('£')) {
                priceElement.textContent = '$' + priceElement.textContent.replace(/[^0-9.]/g, '');
            }
        }
    });
    
    // Also directly target any price element with £4.99
    document.querySelectorAll('.price').forEach(function(el) {
        if (el.textContent.trim() === '£4.99') {
            el.textContent = '$4.99';
        }
    });
}
