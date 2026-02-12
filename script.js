/**
 * ISPS SARL - Solutions Professionnelles de Sécurité
 * JavaScript pour l'interactivité du site web
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ============================================
    // 0. SCROLL ANIMATIONS (Fade-in)
    // ============================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });

    // ============================================
    // 1. LOADER ANIMATION
    // ============================================
    const loader = document.getElementById('loader');
    if (loader) {
        // Fade out loader smoothly after 1 second
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            loader.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
        }, 1000);
    }

    // ============================================
    // 2. MOBILE NAVIGATION TOGGLE
    // ============================================
    const navToggle = document.querySelector('.nav-toggle');
    const wrapper = document.querySelector('.wrapper');

    if (navToggle && wrapper) {
        navToggle.addEventListener('click', function() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            wrapper.classList.toggle('nav-active');
        });

        // Close mobile menu when clicking on nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                wrapper.classList.remove('nav-active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ============================================
    // 3. SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // ============================================
    // 4. CONTACT FORM HANDLING (Formspree)
    // ============================================
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form fields
            const nom = document.getElementById('nom');
            const telephone = document.getElementById('telephone');
            const email = document.getElementById('email');
            const message = document.getElementById('message');

            // Validate required fields
            let isValid = true;
            const requiredFields = [
                { field: nom, name: 'Nom' },
                { field: telephone, name: 'Téléphone' },
                { field: email, name: 'Email' },
                { field: message, name: 'Message' }
            ];

            // Reset previous error states
            requiredFields.forEach(item => {
                item.field.classList.remove('error');
            });

            // Check each required field
            requiredFields.forEach(item => {
                if (!item.field.value.trim()) {
                    isValid = false;
                    item.field.classList.add('error');
                }
            });

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email.value.trim())) {
                isValid = false;
                email.classList.add('error');
            }

            if (isValid) {
                // Get submit button
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
                submitBtn.disabled = true;

                // Get form action URL
                const formAction = contactForm.getAttribute('action');

                // Check if Formspree ID is configured
                if (formAction && formAction.includes('YOUR_FORMSPREE_ID')) {
                    // Show configuration message
                    showFormMessage('Veuillez configurer votre ID Formspree dans le code HTML du formulaire.', 'error');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    return;
                }

                try {
                    // Submit to Formspree using AJAX
                    const formData = new FormData(contactForm);
                    const response = await fetch(formAction, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
                        // Show success message
                        showFormSuccess();

                        // Reset form
                        contactForm.reset();
                    } else {
                        // Show error message
                        const errorData = await response.json();
                        if (errorData.errors) {
                            showFormMessage('Erreur: ' + errorData.errors.map(e => e.message).join(', '), 'error');
                        } else {
                            showFormMessage('Une erreur est survenue. Veuillez réessayer.', 'error');
                        }
                    }
                } catch (error) {
                    // Show error message
                    showFormMessage('Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.', 'error');
                }

                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Function to display success message
    function showFormSuccess() {
        showFormMessage('<i class="fas fa-check-circle"></i> Merci pour votre demande. Notre équipe vous contactera sous 24h.', 'success');
    }

    // Function to display form messages (success or error)
    function showFormMessage(message, type = 'success') {
        // Remove existing message if present
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = 'form-message form-' + type;
        messageDiv.innerHTML = message;

        // Insert after the form title
        const contactForm = document.getElementById('contact-form');
        const formTitle = contactForm.querySelector('h3');
        if (formTitle) {
            formTitle.parentNode.insertBefore(messageDiv, formTitle.nextSibling);
        } else {
            contactForm.insertBefore(messageDiv, contactForm.firstChild);
        }

        // Auto-hide after 8 seconds for success, 10 seconds for error
        const hideDelay = type === 'success' ? 8000 : 10000;
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                messageDiv.remove();
            }, 500);
        }, hideDelay);
    }

    // ============================================
    // 5. STATS COUNTER ANIMATION
    // ============================================
    const statsToAnimate = [
        { id: 'stat-years', finalValue: 15, suffix: '+' },
        { id: 'stat-clients', finalValue: 200, suffix: '+' },
        { id: 'stat-agents', finalValue: 500, suffix: '+' },
        { id: 'stat-sites', finalValue: 1000, suffix: '+' }
    ];

    const statsSection = document.querySelector('.hero-stats');
    let hasAnimated = false;

    function animateStats() {
        if (hasAnimated) return;

        const statsElements = statsToAnimate.map(stat => {
            const element = document.getElementById(stat.id);
            return element ? { element, ...stat } : null;
        }).filter(Boolean);

        if (statsElements.length === 0) return;

        // Check if section is in viewport
        const rect = statsSection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

        if (isVisible) {
            hasAnimated = true;

            statsElements.forEach(stat => {
                animateCounter(stat.element, stat.finalValue, stat.suffix);
            });
        }
    }

    function animateCounter(element, finalValue, suffix) {
        const duration = 2000; // 2 seconds
        const startTime = performance.now();
        const startValue = 0;

        // Easing function: easeOutQuad
        function easeOutQuad(t) {
            return t * (2 - t);
        }

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuad(progress);
            const currentValue = Math.floor(startValue + (finalValue - startValue) * easedProgress);

            element.textContent = currentValue + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = finalValue + suffix;
            }
        }

        requestAnimationFrame(update);
    }

    // Initialize stats animation check
    if (statsSection) {
        animateStats();
        window.addEventListener('scroll', animateStats);
    }

    // ============================================
    // 6. SCROLL PROGRESS BAR
    // ============================================
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#b8860b,#ffd700,#b8860b);width:0%;z-index:9999;transition:width 0.1s ease;';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });

    // ============================================
    // 7. STICKY HEADER ON SCROLL
    // ============================================
    const header = document.querySelector('.navigation');

    if (header) {
        function handleScroll() {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Initial check
        handleScroll();

        // Add scroll listener with passive event for performance
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // ============================================
    // 8. PARALLAX EFFECT FOR HERO
    // ============================================
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            heroBackground.style.transform = `translateY(${scrolled * 0.3}px)`;
        }, { passive: true });
    }

    // ============================================
    // Console log for debugging
    // ============================================
    console.log('ISPS SARL - Site web chargé avec succès');
});
