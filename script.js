document.addEventListener('DOMContentLoaded', () => {

    const feedbackForm = document.getElementById('feedbackForm');
    // responseMessage не потрібен для нативної відправки, Formspree перенаправить користувача
    // const responseMessage = document.getElementById('responseMessage'); 
    const languageLinks = document.querySelectorAll('.language-switcher a');
    let currentTranslations = {};
    let currentLang = 'en'; // Додаємо змінну для поточної мови

    /**
     * Функція для створення ефекту літаючих літер.
     */
    const createFlyingChars = () => {
        const container = document.querySelector('.flying-chars');
        if (!container) return;

        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890*+@#&{}[]";
        const charCount = 50;

        for (let i = 0; i < charCount; i++) {
            const li = document.createElement('li');

            li.style.left = `${Math.random() * 100}%`;
            li.style.fontSize = `${Math.random() * 1.5 + 0.5}em`;
            li.style.animationDuration = `${Math.random() * 20 + 15}s`;
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
            currentLang = lang; // Оновлюємо поточну мову
            document.querySelectorAll('[data-lang-key]').forEach(element => {
                const key = element.getAttribute('data-lang-key');
                if (translations[key]) element.textContent = translations[key];
            });
            document.documentElement.lang = lang;
            
            // Оновлюємо текст повідомлення про помилку reCAPTCHA, якщо воно було видимим
            const recaptchaErrorContainer = document.querySelector('#recaptcha-container .error-message');
            if (recaptchaErrorContainer && recaptchaErrorContainer.classList.contains('visible')) {
                 recaptchaErrorContainer.textContent = translations.errorCaptcha;
            }

        } catch (error) { console.error('Eroare la schimbarea limbii:', error); }
    };

    languageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            changeLanguage(link.getAttribute('data-lang-code'));
        });
    });
    
    // Функція, що очищає всі повідомлення про помилки
    const clearErrors = () => {
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.textContent = '';
            msg.classList.remove('visible');
        });
        document.querySelectorAll('.form-group .error').forEach(input => input.classList.remove('error'));
    };


    const validateForm = () => {
        let isValid = true;
        clearErrors(); // Очищаємо всі помилки перед початком валідації

        const fieldsToValidate = { 'name': 'errorRequired', 'message': 'errorRequired', 'email': 'errorEmail' };

        for (const id in fieldsToValidate) {
            const input = document.getElementById(id);
            const errorContainer = input.nextElementSibling;
            let hasError = false, errorKey = '';
            
            if (!input) continue; // Захист, якщо елемент не знайдено

            if (input.value.trim() === '') {
                hasError = true;
                errorKey = 'errorRequired';
            } else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                hasError = true;
                errorKey = 'errorEmail';
            }

            if (hasError) {
                isValid = false;
                input.classList.add('error');
                errorContainer.textContent = currentTranslations[errorKey] || `Missing translation for ${errorKey}`;
                errorContainer.classList.add('visible');
            }
        }
        
        // --- Валідація reCAPTCHA ---
        const recaptchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
        if (recaptchaResponse.length === 0) {
            isValid = false;
            const recaptchaErrorContainer = document.querySelector('#recaptcha-container .error-message');
            if(recaptchaErrorContainer) {
                // Виводимо помилку reCAPTCHA, якщо її не пройдено
                recaptchaErrorContainer.textContent = currentTranslations.errorCaptcha || 'Please verify that you are not a robot.'; 
                recaptchaErrorContainer.classList.add('visible');
            }
        }

        return isValid;
    };

    // --- ГОЛОВНА ЛОГІКА ВІДПРАВКИ ФОРМИ ---
    feedbackForm.addEventListener('submit', (e) => {
        // Якщо форма НЕ проходить клієнтську валідацію, ми зупиняємо її відправку.
        if (!validateForm()) {
            e.preventDefault();
            
            // Якщо потрібне загальне повідомлення про помилку форми, використовуйте його тут
            const responseMessage = document.getElementById('responseMessage');
            if (responseMessage) {
                 responseMessage.textContent = currentTranslations.errorForm || 'Please correct the errors above.';
                 responseMessage.className = 'error visible';
            }
            
            // Обов'язково зробіть фокус на першому полі з помилкою для зручності
            const firstErrorField = document.querySelector('.form-group .error');
            if (firstErrorField) {
                firstErrorField.focus();
            }
        } 
        
        // ВАЖЛИВО: Якщо validateForm() повертає true, e.preventDefault() НЕ викликається.
        // Це дозволяє формі відправитися НАТИВНО на Formspree, забезпечуючи коректну роботу reCAPTCHA.
    });

    // --- Ініціалізація ---
    createFlyingChars();
    // Ініціалізуємо англійську, але перевіряємо, чи є збережена мова в LocalStorage
    const savedLang = localStorage.getItem('siteLang') || 'en';
    changeLanguage(savedLang);
    // Додаємо збереження мови
    languageLinks.forEach(link => {
        link.addEventListener('click', () => {
            const langCode = link.getAttribute('data-lang-code');
            localStorage.setItem('siteLang', langCode);
        });
    });

});
