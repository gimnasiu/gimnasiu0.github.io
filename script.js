document.addEventListener('DOMContentLoaded', () => {
    
    const feedbackForm = document.getElementById('feedbackForm');
    const responseMessage = document.getElementById('responseMessage');
    const languageLinks = document.querySelectorAll('.language-switcher a');
    let currentTranslations = {};
    let currentLang = 'en'; // English: Variable for current language / Romana: Variabila pentru limba curentă

    /**
     * English: Function to create the flying characters background effect.
     * Romana: Funcție pentru a crea efectul de fundal cu caractere zburătoare.
     */
    const createFlyingChars = () => {
        const container = document.querySelector('.flying-chars');
        if (!container) return;
        
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890*+@#&{}[]";
        const charCount = 50; // Romana: Numărul de caractere

        for (let i = 0; i < charCount; i++) {
            const li = document.createElement('li');
            
            li.style.left = `${Math.random() * 100}%`;
            li.style.fontSize = `${Math.random() * 1.5 + 0.5}em`;
            li.style.animationDuration = `${Math.random() * 20 + 15}s`; // English: between 15s and 35s
            li.style.animationDelay = `${Math.random() * 15}s`;
            
            li.textContent = chars.charAt(Math.floor(Math.random() * chars.length));
            container.appendChild(li);
        }
    };

    /**
     * English: Function to change the interface language by loading the corresponding JSON file.
     * Romana: Funcție pentru a schimba limba interfeței prin încărcarea fișierului JSON corespunzător.
     */
    const changeLanguage = async (lang) => {
        try {
            const response = await fetch(`lang/${lang}.json`);
            // Romana: Verifică dacă fișierul de traducere a fost găsit.
            if (!response.ok) throw new Error(`Fișierul de traducere lang/${lang}.json nu a fost găsit.`); 
            const translations = await response.json();
            currentTranslations = translations;
            currentLang = lang;
            document.querySelectorAll('[data-lang-key]').forEach(element => {
                const key = element.getAttribute('data-lang-key');
                // English: Update element content based on translation key.
                if (translations[key]) element.textContent = translations[key];
            });
            document.documentElement.lang = lang;

            // English: Clear general error message on language change.
            responseMessage.textContent = '';
            responseMessage.className = '';
        } catch (error) { console.error('Error changing language:', error); } // English comment
    };

    languageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const langCode = link.getAttribute('data-lang-code');
            changeLanguage(langCode);
            localStorage.setItem('siteLang', langCode); // English: Save language
        });
    });

    /**
     * English: Function for client-side field validation (Name, Email, Message).
     * Romana: Funcție pentru validarea câmpurilor pe partea clientului (Nume, Email, Mesaj).
     */
    const validateForm = () => {
        let isValid = true;
        
        // English: Clear previous errors.
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
            
            if (input.value.trim() === '') { 
                hasError = true; errorKey = 'errorRequired'; 
            } else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) { 
                hasError = true; errorKey = 'errorEmail'; 
            }

            if (hasError) {
                isValid = false; input.classList.add('error');
                errorContainer.textContent = currentTranslations[errorKey] || 'Field required/Invalid email'; 
                errorContainer.classList.add('visible');
            }
        }
        
        // English: reCAPTCHA validation is completely removed as it's disabled on Formspree.
        // Romana: Validarea reCAPTCHA este complet eliminată, deoarece este dezactivată pe Formspree.
        
        return isValid;
    };

    /**
     * English: Form submission logic.
     * Romana: Logica de trimitere a formularului.
     */
    feedbackForm.addEventListener('submit', (e) => {
        // English: Prevent default submission temporarily to run validation.
        e.preventDefault(); 
        
        if (!validateForm()) {
            // English: Validation FAILED. Show error message.
            responseMessage.textContent = currentTranslations.errorForm || 'Please correct the errors in the form.';
            responseMessage.className = 'error visible'; 

            // English: Focus on first error field for accessibility.
            const firstErrorField = document.querySelector('.form-group .error');
            if (firstErrorField) {
                firstErrorField.focus();
            }
            
        } else {
            // English: Validation PASSED. Manually trigger native submission.
            responseMessage.textContent = currentTranslations.sendingMessage || 'Sending...';
            responseMessage.className = 'success visible'; 
            
            // CRITICAL FIX: Manually trigger the native form submission to Formspree.
            // Romana: Remediere critică: Declanșează manual trimiterea nativă a formularului către Formspree.
            setTimeout(() => {
                e.target.submit(); 
            }, 100); 
        }
    });

    // --- Initialization / Inițializare ---
    createFlyingChars(); 
    // English: Load saved language or default to 'en'.
    const savedLang = localStorage.getItem('siteLang') || 'en';
    changeLanguage(savedLang);
});
