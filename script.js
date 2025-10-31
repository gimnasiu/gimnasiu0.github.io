document.addEventListener('DOMContentLoaded', () => {
    
    const feedbackForm = document.getElementById('feedbackForm');
    const responseMessage = document.getElementById('responseMessage');
    const languageLinks = document.querySelectorAll('.language-switcher a');
    let currentTranslations = {};
    let currentLang = 'en'; // Added for completeness

    /**
     * NOU: Funcție pentru a genera efectul de litere zburătoare.
     */
    const createFlyingChars = () => {
        const container = document.querySelector('.flying-chars');
        if (!container) return;
        
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890*+@#&{}[]";
        const charCount = 50; // Numărul de caractere

        for (let i = 0; i < charCount; i++) {
            const li = document.createElement('li');
            
            li.style.left = `${Math.random() * 100}%`;
            li.style.fontSize = `${Math.random() * 1.5 + 0.5}em`;
            li.style.animationDuration = `${Math.random() * 20 + 15}s`; // între 15s și 35s
            li.style.animationDelay = `${Math.random() * 15}s`;
            
            li.textContent = chars.charAt(Math.floor(Math.random() * chars.length));
            container.appendChild(li);
        }
    };

    const changeLanguage = async (lang) => {
        try {
            const response = await fetch(`lang/${lang}.json`);
            if (!response.ok) throw new Error(`Fișierul de traducere lang/${lang}.json nu a fost găsit.`);
            const translations = await response.json();
            currentTranslations = translations;
            currentLang = lang; // Set current language
            document.querySelectorAll('[data-lang-key]').forEach(element => {
                const key = element.getAttribute('data-lang-key');
                if (translations[key]) element.textContent = translations[key];
            });
            document.documentElement.lang = lang;
            
            // Clear general error message on language change
            responseMessage.textContent = '';
            responseMessage.className = '';
        } catch (error) { console.error('Eroare la schimbarea limbii:', error); }
    };

    languageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const langCode = link.getAttribute('data-lang-code');
            changeLanguage(langCode);
            localStorage.setItem('siteLang', langCode); // Save language
        });
    });

    const validateForm = () => {
        let isValid = true;
        // Clear all errors
        document.querySelectorAll('.error-message').forEach(msg => {
             msg.textContent = '';
             msg.classList.remove('visible');
        });
        document.querySelectorAll('.form-group .error').forEach(input => input.classList.remove('error'));
        
        const fieldsToValidate = { 'name': 'errorRequired', 'message': 'errorRequired', 'email': 'errorEmail' };

        for (const id in fieldsToValidate) {
            const input = document.getElementById(id);
            const errorContainer = input.nextElementSibling;
            let hasError = false, errorKey = '';
            if (input.value.trim() === '') { hasError = true; errorKey = 'errorRequired'; }
            else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) { hasError = true; errorKey = 'errorEmail'; }
            if (hasError) {
                isValid = false; input.classList.add('error');
                errorContainer.textContent = currentTranslations[errorKey] || 'Field required/Invalid email'; 
                errorContainer.classList.add('visible');
            }
        }
        
        // reCAPTCHA Validation
        const recaptchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
        if (recaptchaResponse.length === 0) {
            isValid = false;
            const recaptchaErrorContainer = document.querySelector('#recaptcha-container .error-message');
            if(recaptchaErrorContainer) {
                recaptchaErrorContainer.textContent = currentTranslations.errorCaptcha || 'Please complete the reCAPTCHA verification.'; 
                recaptchaErrorContainer.classList.add('visible');
            }
        }
        return isValid;
    };

    feedbackForm.addEventListener('submit', (e) => {
        // Step 1: Prevent default submission temporarily to run validation
        e.preventDefault(); 
        
        if (!validateForm()) {
            // Step 2a: Validation FAILED
            responseMessage.textContent = currentTranslations.errorForm || 'Please correct the errors in the form.';
            responseMessage.className = 'error visible'; // Add 'visible' class
            
            // Reset reCAPTCHA so the user can try again
            if (typeof grecaptcha !== 'undefined') {
                 grecaptcha.reset();
            }
            
            // Focus on first error field
            const firstErrorField = document.querySelector('.form-group .error');
            if (firstErrorField) {
                firstErrorField.focus();
            }
            
        } else {
            // Step 2b: Validation PASSED
            responseMessage.textContent = 'Sending...';
            responseMessage.className = 'success visible'; // Show sending message
            
            // CRITICAL: Manually trigger the native form submission to Formspree
            // This is the missing step that ensures data is sent.
            // Using a short timeout ensures the browser finishes DOM updates before navigating.
            setTimeout(() => {
                e.target.submit(); 
            }, 100); 
        }
    });

    // --- Initialization ---
    createFlyingChars(); 
    const savedLang = localStorage.getItem('siteLang') || 'en';
    changeLanguage(savedLang);
});
