document.addEventListener('DOMContentLoaded', () => {
    
    // English: Get form and language elements.
    // Romana: Obțineți elementele formularului și ale limbii.
    const feedbackForm = document.getElementById('feedbackForm');
    const languageLinks = document.querySelectorAll('.language-switcher a');
    // English: responseMessage and error logic are removed.
    // Romana: Logica responseMessage și de eroare este eliminată.
    let currentTranslations = {};
    let currentLang = 'en'; 

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
        } catch (error) { console.error('Error changing language:', error); } // English comment
    };

    // English: Event listeners for language switching and saving preference to localStorage.
    // Romana: Ascultători de evenimente pentru schimbarea limbii și salvarea preferinței în localStorage.
    languageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const langCode = link.getAttribute('data-lang-code');
            changeLanguage(langCode);
            localStorage.setItem('siteLang', langCode); 
        });
    });

    /**
     * English: Form submission logic. 
     * Client-side validation is COMPLETELY DISABLED. 
     * The form is submitted natively, relying only on Formspree/reCAPTCHA for checks.
     * * Romana: Logica de trimitere a formularului.
     * Validarea pe partea clientului este COMPLET DEZACTIVATĂ. 
     * Formularul este trimis nativ, bazându-se doar pe Formspree/reCAPTCHA pentru verificări.
     */
    feedbackForm.addEventListener('submit', (e) => {
        // English: The form submits natively to Formspree without client-side interception (no e.preventDefault()).
        // Romana: Formularul se trimite nativ către Formspree fără interceptare pe partea clientului (fără e.preventDefault()).
        
        // English: If Formspree detects an error (like incomplete fields or failed reCAPTCHA), 
        // it will display its own error page or message.
        // Romana: Dacă Formspree detectează o eroare (cum ar fi câmpuri incomplete sau reCAPTCHA eșuată), 
        // va afișa propria pagină sau mesaj de eroare.
    });

    // --- Initialization / Inițializare ---
    createFlyingChars(); 
    // English: Load saved language or default to 'en'.
    // Romana: Încărcați limba salvată sau implicit 'en'.
    const savedLang = localStorage.getItem('siteLang') ||
