document.addEventListener('DOMContentLoaded', function() {
    
    // Biến trạng thái đăng nhập
    let isLoggedIn = false;

    // 1. Xử lý Form Request a Quote
    const quoteForm = document.querySelector('.form-banner form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = this.querySelector('input[placeholder="Name"]').value;
            const email = this.querySelector('input[placeholder="Email"]').value;
            const phone = this.querySelector('input[placeholder="Phone"]').value;
            const menu = this.querySelector('input[placeholder="Menu"]').value;
            const date = this.querySelector('input[placeholder="Select date"]').value;

            if (!name || !email || !phone || !menu || !date) {
                alert('Vui lòng điền đầy đủ thông tin!');
                return;
            }

            console.log('Đơn hàng:', { name, email, phone, menu, date });
            alert('Đơn hàng của bạn đã được gửi thành công!');
            this.reset();
        });
    }

    // 2. Xử lý các nút trong navbar
    const navButtons = document.querySelectorAll('.nav-btn a');
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const buttonId = this.id;
            if (buttonId === 'cart-link') {
                document.getElementById('cart-modal').style.display = 'flex';
                updateCart();
            } else if (buttonId === 'signup-link') {
                document.getElementById('signup-modal').style.display = 'flex';
            } else if (buttonId === 'login-link') {
                document.getElementById('login-modal').style.display = 'flex';
            } else if (buttonId === 'profile-link') {
                if (isLoggedIn) {
                    document.getElementById('profile-modal').style.display = 'flex';
                    updateProfile();
                } else {
                    alert('Please log in to view your profile.');
                }
            } else if (buttonId === 'order-link') {
                if (isLoggedIn) {
                    alert('Đặt hàng đang được xử lý. Vui lòng điền form để hoàn tất!');
                    document.getElementById('order-section').scrollIntoView({ behavior: 'smooth' });
                } else {
                    alert('Please log in to place an order.');
                    document.getElementById('login-modal').style.display = 'flex';
                }
            }
        });
    });

    // 3. Xử lý nút "View full item" và thêm vào giỏ hàng
    const viewFullItemButtons = document.querySelectorAll('.service-box .ser-arr a');
    viewFullItemButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const itemName = this.closest('.ser-text').querySelector('h4').textContent;
            const itemDescription = this.closest('.ser-text').querySelector('p').textContent;
            let itemPrice = this.closest('.service-box').getAttribute('data-price');

            if (!itemPrice || isNaN(itemPrice)) {
                itemPrice = "N/A";
            } else {
                itemPrice = parseFloat(itemPrice).toFixed(2);
            }

            const modal = document.createElement('div');
            modal.classList.add('custom-modal');
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>${itemName}</h3>
                    <p>${itemDescription}</p>
                    <p><strong>Price:</strong> ${itemPrice === "N/A" ? "Price not available" : "$" + itemPrice}</p>
                    <button class="order-from-modal">Order This Item</button>
                    <button class="close-modal">Close</button>
                </div>
            `;
            document.body.appendChild(modal);

            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.remove();
            });

            modal.querySelector('.order-from-modal').addEventListener('click', () => {
                if (itemPrice !== "N/A") {
                    addToCart({ name: itemName, price: parseFloat(itemPrice) });
                    alert(`Đã thêm "${itemName}" vào giỏ hàng!`);
                }
                modal.remove();
            });
        });
    });

    // 4. Xử lý nút "Menu"
    document.getElementById('menu-link').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('menu-modal').style.display = 'flex';
    });

    document.querySelector('.close-menu-modal').addEventListener('click', function() {
        document.getElementById('menu-modal').style.display = 'none';
    });

    document.getElementById('menu-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });

    // 5. Xử lý modal đăng ký
    document.getElementById('signup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name) {
            alert('Please enter your full name.');
            return;
        }
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        localStorage.setItem('user', JSON.stringify({ name, email, password }));
        alert(`Sign Up Successful!\nName: ${name}\nEmail: ${email}`);
        document.getElementById('signup-modal').style.display = 'none';
        this.reset();
    });

    // 6. Xử lý modal đăng nhập
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (email === user.email && password === user.password) {
            isLoggedIn = true;
            document.getElementById('login-link').style.display = 'none';
            document.getElementById('profile-link').style.display = 'inline-flex';
            alert(`Login Successful!\nEmail: ${email}`);
            document.getElementById('login-modal').style.display = 'none';
            this.reset();
        } else {
            alert('Invalid email or password.');
        }
    });

    // 7. Đóng modal khi nhấp nút close hoặc bên ngoài
    document.querySelectorAll('.close-auth-modal, .close-cart-modal, .close-profile-modal').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.auth-modal, .cart-modal, .profile-modal').style.display = 'none';
        });
    });

    document.querySelectorAll('.auth-modal, .cart-modal, .profile-modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });

    // 8. Hàm xử lý giỏ hàng
    function addToCart(item) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart.push(item);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    }

    function updateCart() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');

        cartItems.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <div>
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)}</p>
                </div>
                <button class="remove-item" data-index="${index}">Remove</button>
            `;
            cartItems.appendChild(cartItem);
            total += item.price;
        });

        cartTotal.textContent = total.toFixed(2);

        // Xử lý nút xóa
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCart();
            });
        });

        // Xử lý Checkout
        document.querySelector('.checkout-btn').addEventListener('click', function() {
            if (cart.length > 0) {
                alert('Proceeding to checkout!');
                document.getElementById('cart-modal').style.display = 'none';
                document.querySelector('.request-sec').scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Your cart is empty!');
            }
        });
    }

    // 9. Hàm xử lý profile
    function updateProfile() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        document.getElementById('profile-name').textContent = user.name || 'N/A';
        document.getElementById('profile-email').textContent = user.email || 'N/A';

        const orderHistory = document.getElementById('order-history');
        orderHistory.innerHTML = '';
        cart.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.name} - $${item.price.toFixed(2)} (${new Date().toLocaleDateString()})`;
            orderHistory.appendChild(li);
        });
    }

    // 10. Xử lý lọc tab
    const tabButtons = document.querySelectorAll('.nav-tabs .nav-link');
    const allItems = document.querySelectorAll('#home-tab-pane .service-tab');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-bs-target');
            const targetPane = document.querySelector(tabId);
            const targetRow = targetPane.querySelector('.row');
            targetRow.innerHTML = '';

            let category;
            if (tabId === '#home-tab-pane') category = 'all';
            else if (tabId === '#profile-tab-pane') category = 'Burger';
            else if (tabId === '#contact-tab-pane') category = 'Chicken';
            else if (tabId === '#tacos-tab-pane') category = 'Tacos';

            allItems.forEach(item => {
                const itemCategory = item.querySelector('.ser-text p').textContent.trim();
                const itemClone = item.cloneNode(true);
                if (category === 'all' || itemCategory === category) {
                    const col = document.createElement('div');
                    col.classList.add('col-lg-3');
                    col.appendChild(itemClone);
                    targetRow.appendChild(col);
                }
            });

            if (targetRow.children.length === 0) {
                targetRow.innerHTML = '<p class="text-center">No items available in this category.</p>';
            }
        });
    });

    document.querySelector('#home-tab').click();
});

// Xử lý nút "About Us"
document.getElementById('about-link').addEventListener('click', function(e) {
    e.preventDefault();
    const aboutSection = document.getElementById('about-section');
    aboutSection.scrollIntoView({ behavior: 'smooth' });
});

// Theo dõi trạng thái active cho nút "About Us"
const aboutSection = document.getElementById('about-section');
const aboutLink = document.getElementById('about-link');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            aboutLink.classList.add('active');
        } else {
            aboutLink.classList.remove('active');
        }
    });
}, {
    threshold: 0.5
});

observer.observe(aboutSection);

// Theo dõi trạng thái active cho nút "Services" và "Menu"
const servicesSection = document.getElementById('services-section');
const servicesLink = document.getElementById('services-link');
const menuLink = document.getElementById('menu-link');

const servicesObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            servicesLink.classList.add('active');
            menuLink.classList.add('active'); // Thêm active cho nút "Menu"
        } else {
            servicesLink.classList.remove('active');
            menuLink.classList.remove('active'); // Xóa active cho nút "Menu"
        }
    });
}, {
    threshold: 0.5
});

servicesObserver.observe(servicesSection);


// Theo dõi trạng thái active cho nút "Order"
const orderSection = document.getElementById('order-section');
const orderLink = document.getElementById('order-link');

const orderObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            orderLink.classList.add('active');
        } else {
            orderLink.classList.remove('active');
        }
    });
}, {
    threshold: 0.5 // Kích hoạt khi 50% section xuất hiện trong viewport
});

orderObserver.observe(orderSection);


// Xử lý nút "Contact Us"
document.getElementById('contact-link').addEventListener('click', function(e) {
    e.preventDefault();
    const contactSection = document.getElementById('contact-section');
    contactSection.scrollIntoView({ behavior: 'smooth' });
});

// Theo dõi trạng thái active cho nút "Contact Us"
const contactSection = document.getElementById('contact-section');
const contactLink = document.getElementById('contact-link');

const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            contactLink.classList.add('active');
        } else {
            contactLink.classList.remove('active');
        }
    });
}, {
    threshold: 0.5 // Kích hoạt khi 50% section xuất hiện trong viewport
});

contactObserver.observe(contactSection);
