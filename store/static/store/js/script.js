/* ==========================================
   LUMIÈRE JEWELRY - Complete JavaScript
   ========================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    /* ==============================
       1. GLOBAL FUNCTIONS
       ============================== */
    
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Wishlist Heart Toggle
    document.querySelectorAll('.wishlist-icon').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering card click
            const heart = this.querySelector('i');
            if (heart.classList.contains('far')) {
                heart.classList.remove('far');
                heart.classList.add('fas', 'fill-current');
                this.style.color = '#ff3f6a';
                showToast('Added to wishlist ❤️');
            } else {
                heart.classList.remove('fas', 'fill-current');
                heart.classList.add('far');
                this.style.color = '';
                showToast('Removed from wishlist');
            }
        });
    });

    // Toast Notification System
    function showToast(message) {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: #282c3f;
            color: #fff;
            padding: 12px 25px;
            border-radius: 4px;
            font-size: 0.9rem;
            z-index: 10000;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Add animation keyframes dynamically
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                @keyframes slideUp {
                    from { transform: translate(-50%, 100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        // Remove after 2 seconds
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }


    /* ==============================
       2. COLLECTION PAGE FUNCTIONS
       ============================== */
    
    // Filter Expand/Collapse
    document.querySelectorAll('.filter-header').forEach(header => {
        header.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const options = this.nextElementSibling;
            
            if (options.style.maxHeight) {
                options.style.maxHeight = null;
                icon.classList.remove('fa-minus');
                icon.classList.add('fa-plus');
            } else {
                options.style.maxHeight = options.scrollHeight + 'px';
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            }
        });
    });

    // Color Swatch Selection
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', function() {
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
            const colorName = this.getAttribute('title');
            showToast(`Selected color: ${colorName}`);
        });
    });

    // Sort Functionality
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            const productsGrid = document.querySelector('.products-grid');
            const productBoxes = Array.from(document.querySelectorAll('.product-box'));
            
            // Simple sort simulation
            productBoxes.sort((a, b) => {
                const priceA = parseInt(a.querySelector('.product-price').textContent.replace(/[^0-9]/g, ''));
                const priceB = parseInt(b.querySelector('.product-price').textContent.replace(/[^0-9]/g, ''));
                
                if (sortValue === 'Price: Low to High') return priceA - priceB;
                if (sortValue === 'Price: High to Low') return priceB - priceA;
                return 0; // For "Recommended" and others, keep original order
            });
            
            productBoxes.forEach(box => productsGrid.appendChild(box));
            showToast(`Sorted by: ${sortValue}`);
        });
    }

    // Product Click -> Navigate to Product Page
    document.querySelectorAll('.product-box').forEach(box => {
        box.addEventListener('click', function(e) {
            // Don't navigate if clicking wishlist
            if (e.target.closest('.wishlist-icon')) return;
            window.location.href = 'product.html';
        });
    });


    /* ==============================
       3. PRODUCT PAGE FUNCTIONS
       ============================== */
    
    // Image Gallery Switcher
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        window.changeImage = function(element) {
            document.getElementById('mainImage').src = element.src;
            document.querySelectorAll('.thumb-img').forEach(img => img.classList.remove('active'));
            element.classList.add('active');
        };
    }

    // Color Selector
    window.selectColor = function(element, colorName) {
        document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('selected'));
        element.classList.add('selected');
        document.getElementById('selectedColor').textContent = colorName;
    };

    // Size Selector
    window.selectSize = function(element) {
        document.querySelectorAll('.size-box').forEach(s => s.classList.remove('selected'));
        element.classList.add('selected');
        showToast(`Selected size: ${element.textContent}`);
    };

    // Add to Cart Button
    const addToCartBtn = document.querySelector('.btn-amazon.btn-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const selectedColor = document.getElementById('selectedColor')?.textContent || 'Default';
            const selectedSize = document.querySelector('.size-box.selected')?.textContent || 'Default';
            
            showToast(`Added to Cart! ${selectedColor}, Size ${selectedSize}`);
            
            // Update cart badge
            updateCartBadge(1);
        });
    }

    // Buy Now Button
    const buyNowBtn = document.querySelector('.btn-amazon.btn-buy');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', function() {
            const selectedColor = document.getElementById('selectedColor')?.textContent || 'Default';
            const selectedSize = document.querySelector('.size-box.selected')?.textContent || 'Default';
            
            updateCartBadge(1);
            showToast('Proceeding to checkout...');
            
            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 1000);
        });
    }

    // Track Cart Count
    let cartCount = 2; // Starting count
    
    function updateCartBadge(increment) {
        cartCount += increment;
        const cartLink = document.querySelector('a[href="cart.html"]');
        if (cartLink) {
            const existingBadge = cartLink.querySelector('.cart-badge');
            if (existingBadge) {
                existingBadge.textContent = cartCount;
            } else {
                const badge = document.createElement('span');
                badge.className = 'cart-badge';
                badge.style.cssText = `
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: #ff3f6a;
                    color: #fff;
                    font-size: 0.7rem;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;
                badge.textContent = cartCount;
                cartLink.style.position = 'relative';
                cartLink.appendChild(badge);
            }
        }
    }


    /* ==============================
       4. CART PAGE FUNCTIONS
       ============================== */
    
    // Quantity Update (+/-)
    window.updateQty = function(inputId, change) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        let currentQty = parseInt(input.value);
        let newQty = currentQty + change;
        
        // Validation
        if (newQty < 1) {
            if (confirm('Remove this item from cart?')) {
                input.closest('.cart-item').remove();
                updateCartBadge(-1);
                updatePriceSummary();
            }
            return;
        }
        if (newQty > 10) {
            showToast('Maximum quantity allowed is 10');
            return;
        }
        
        input.value = newQty;
        
        // Update item total (simulation)
        const cartItem = input.closest('.cart-item');
        const priceElement = cartItem.querySelector('.item-price');
        // Reset base price (just for demo)
        let basePrice = 189000;
        let newTotal = basePrice * newQty;
        // Format with commas
        priceElement.textContent = '₹' + newTotal.toLocaleString('en-IN');
        
        updatePriceSummary();
    };

    // Remove Item
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Are you sure you want to remove this item?')) {
                this.closest('.cart-item').remove();
                updateCartBadge(-1);
                updatePriceSummary();
                showToast('Item removed from cart');
            }
        });
    });

    // Delete from Cart (Text Link)
    document.querySelectorAll('.item-actions span:first-child').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Remove this item from cart?')) {
                this.closest('.cart-item').remove();
                updateCartBadge(-1);
                updatePriceSummary();
                showToast('Item removed');
            }
        });
    });

    // Save for Later
    document.querySelectorAll('.saved-for-later').forEach(btn => {
        btn.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            showToast('Saved for later');
            
            // Move to saved section
            const savedSection = document.querySelector('.saved-items');
            if (savedSection && !cartItem.closest('.saved-items')) {
                savedSection.appendChild(cartItem);
                this.textContent = 'MOVE TO BAG';
            }
        });
    });

    // Apply Coupon
    const applyBtn = document.querySelector('.apply-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            const couponInput = this.previousElementSibling;
            const code = couponInput.value.trim().toUpperCase();
            
            const validCoupons = {
                'LUMIERE20': 20,
                'SAVE10': 10,
                'DIAMOND50': 50
            };
            
            if (validCoupons[code]) {
                const discount = validCoupons[code];
                showToast(`Coupon applied! ${discount}% OFF`);
                couponInput.style.borderColor = '#28a745';
                couponInput.style.color = '#28a745';
                updatePriceSummary(discount);
            } else if (code === '') {
                showToast('Please enter a coupon code');
            } else {
                showToast('Invalid coupon code');
                couponInput.style.borderColor = '#dc3545';
            }
        });
    }

    // Update Price Summary
    function updatePriceSummary(discountPercent = 0) {
        const priceRows = document.querySelectorAll('.price-row');
        if (priceRows.length === 0) return;
        
        // Calculate from cart items
        let bagTotal = 0;
        
        document.querySelectorAll('.cart-item').forEach(item => {
            if (!item.closest('.saved-items')) {
                const priceText = item.querySelector('.item-price').textContent;
                bagTotal += parseInt(priceText.replace(/[^0-9]/g, ''));
            }
        });
        
        // Update elements
        const bagTotalEl = priceRows[0];
        if (bagTotalEl) {
            bagTotalEl.querySelector('span:last-child').textContent = '₹' + bagTotal.toLocaleString('en-IN');
        }
        
        // Delivery (free above 50000)
        const deliveryEl = priceRows[1];
        if (deliveryEl) {
            deliveryEl.querySelector('span:last-child').textContent = bagTotal > 50000 ? 'FREE' : '₹500';
        }
        
        // GST (18%)
        let gst = Math.round(bagTotal * 0.18);
        if (priceRows[2]) {
            priceRows[2].querySelector('span:last-child').textContent = '₹' + gst.toLocaleString('en-IN');
        }
        
        // Discount
        let discountAmount = 0;
        if (discountPercent > 0) {
            discountAmount = Math.round(bagTotal * (discountPercent / 100));
        }
        if (priceRows[3]) {
            priceRows[3].querySelector('span:last-child').textContent = discountAmount > 0 
                ? '-₹' + discountAmount.toLocaleString('en-IN') 
                : '₹0';
        }
        
        // Final Total
        let finalTotal = bagTotal + (bagTotal > 50000 ? 0 : 500) + gst - discountAmount;
        if (priceRows[4]) {
            priceRows[4].querySelector('span:last-child').textContent = '₹' + finalTotal.toLocaleString('en-IN');
        }
    }

    // Checkout Button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            showToast('Redirecting to Secure Checkout...');
            setTimeout(() => {
                window.location.href = 'checkout.html'; // Placeholder
            }, 1500);
        });
    }


    /* ==============================
       5. CONTACT PAGE FUNCTIONS
       ============================== */
    
    // Contact Form Submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        window.submitForm = function(event) {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());
            
            // Validation simulation
            if (!data['Full Name'] || !data['Email Address'] || !data['Message']) {
                showToast('Please fill all required fields');
                return;
            }
            
            // Simulate API call
            const btn = event.target.querySelector('.submit-btn');
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;
            
            setTimeout(() => {
                showToast('Thank you! We will contact you within 24 hours.');
                event.target.reset();
                btn.textContent = originalText;
                btn.disabled = false;
            }, 1500);
        };
    }

    // FAQ Accordion Toggle
    window.toggleFaq = function(element) {
        const wasActive = element.classList.contains('active');
        
        // Close all others
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Toggle clicked one
        if (!wasActive) {
            element.classList.add('active');
        }
    };


    /* ==============================
       6. UTILITY FUNCTIONS
       ============================== */
    
    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Header Scroll Effect
    let lastScroll = 0;
    const header = document.querySelector('header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                header.classList.remove('scroll-up');
                return;
            }
            
            if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
                header.classList.remove('scroll-up');
                header.classList.add('scroll-down');
            } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
                header.classList.remove('scroll-down');
                header.classList.add('scroll-up');
            }
            
            lastScroll = currentScroll;