// Проверка загрузки скрипта
console.log('Script.js загружен успешно!');

// Попытка автоматически запустить фоновое видео (особенно на мобилках)
const bgVideo = document.getElementById('bgVideo');
if (bgVideo) {
    bgVideo.muted = true;
    const playPromise = bgVideo.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // Если браузер блочит автозапуск, запускаем при первом клике по странице
            const startOnUserAction = () => {
                bgVideo.play().catch(() => {});
                document.removeEventListener('click', startOnUserAction);
                document.removeEventListener('touchstart', startOnUserAction);
            };
            document.addEventListener('click', startOnUserAction, { once: true });
            document.addEventListener('touchstart', startOnUserAction, { once: true });
        });
    }
}

// Кастомные сообщения для обязательных полей
const requiredFields = [
    { id: 'fullName', message: 'Будь ласка, введіть ПІБ (повністю).' },
    { id: 'position', message: 'Будь ласка, введіть вашу посаду.' },
    { id: 'organization', message: 'Будь ласка, введіть організацію / установу / федерацію / клуб.' },
    { id: 'location', message: 'Будь ласка, вкажіть область / місто.' },
    { id: 'email', message: 'Будь ласка, введіть коректну електронну адресу.' },
    { id: 'phone', message: 'Будь ласка, введіть контактний телефон.' }
];

requiredFields.forEach(field => {
    const el = document.getElementById(field.id);
    if (!el) return;

    el.addEventListener('invalid', function () {
        if (!this.validity.valid) {
            this.setCustomValidity(field.message);
        }
    });

    el.addEventListener('input', function () {
        this.setCustomValidity('');
    });
});

// Показ/скрытие поля для вопроса спикеру
const questionYes = document.getElementById('questionYes');
const questionNo = document.getElementById('questionNo');

if (questionYes) {
    questionYes.addEventListener('change', function() {
        if (this.checked) {
            document.getElementById('questionField').style.display = 'block';
            document.getElementById('question').setAttribute('required', 'required');
        }
    });
}

if (questionNo) {
    questionNo.addEventListener('change', function() {
        if (this.checked) {
            document.getElementById('questionField').style.display = 'none';
            document.getElementById('question').removeAttribute('required');
            document.getElementById('question').value = '';
        }
    });
}

// Показ/скрытие поля "Інше" для доступности
const accessibilityOther = document.getElementById('accessibilityOther');
if (accessibilityOther) {
    accessibilityOther.addEventListener('change', function() {
        const otherField = document.getElementById('accessibilityOtherField');
        if (this.checked) {
            otherField.style.display = 'block';
        } else {
            otherField.style.display = 'none';
            document.getElementById('accessibilityOtherText').value = '';
        }
    });
}

// URL вашего Google Apps Script Web App
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby24IMPnEz_wo3SgCTi-1A56Rd6Upf2hd6NT31yaMW90BrVT4BEvHAv_F78LoKwDg1b/exec';

console.log('Google Script URL:', GOOGLE_SCRIPT_URL);

// Обработка отправки формы
const registrationForm = document.getElementById('registrationForm');
const submitButton = document.querySelector('.submit-btn');
console.log('Форма найдена:', registrationForm ? 'ДА' : 'НЕТ');

// Явная обработка клика по кнопке, чтобы форма всегда реагировала
if (registrationForm && submitButton) {
    submitButton.addEventListener('click', function (event) {
        event.preventDefault();

        // Проверяем встроенную валидацию браузера
        if (!registrationForm.reportValidity()) {
            return;
        }

        // Явно запускаем событие submit, чтобы сработал основной обработчик
        if (typeof registrationForm.requestSubmit === 'function') {
            registrationForm.requestSubmit();
        } else {
            registrationForm.dispatchEvent(new Event('submit', { cancelable: true }));
        }
    });
}

if (registrationForm) {
    registrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log('=== ФОРМА ОТПРАВЛЯЕТСЯ ===');
        const formData = new FormData(this);

        // Обязательная згода на обробку персональних даних
        const consentValue = formData.get('consent');
        if (consentValue !== 'yes') {
            alert('Для участі у форумі необхідно дати згоду на обробку персональних даних.');
            return;
        }
        
        // Собираем потреби доступності з чекбоксів name="accessibility"
        const accessibilityNeeds = [];
        const accessibilityCheckboxes = document.querySelectorAll('input[name="accessibility"]:checked');

        accessibilityCheckboxes.forEach(cb => {
            switch (cb.value) {
                case 'support':
                    accessibilityNeeds.push('Потрібен супровід для людей з інвалідністю');
                    break;
                case 'frontRow':
                    accessibilityNeeds.push('Потрібне місце у першому ряду');
                    break;
                case 'signLanguage':
                    accessibilityNeeds.push('Потрібен сурдоперекладач');
                    break;
                case 'other':
                    accessibilityNeeds.push('Інше');
                    break;
            }
        });
        
        // Формируем данные для отправки
        const data = {
            timestamp: new Date().toLocaleString('uk-UA'),
            fullName: formData.get('fullName') || '',
            position: formData.get('position') || '',
            organization: formData.get('organization') || '',
            location: formData.get('location') || '',
            email: formData.get('email') || '',
            phone: formData.get('phone') || '',
            hasQuestion: formData.get('hasQuestion') === 'yes' ? 'Так' : 'Ні',
            question: formData.get('hasQuestion') === 'yes' ? (formData.get('question') || '-') : '-',
            accessibility: accessibilityNeeds.length > 0 ? accessibilityNeeds.join(', ') : 'Немає',
            accessibilityOther: document.getElementById('accessibilityOther') && document.getElementById('accessibilityOther').checked ? (formData.get('accessibilityOtherText') || '-') : '-',
            consent: formData.get('consent') === 'yes' ? 'Даю згоду' : 'Не даю згоду',
            comments: formData.get('comments') || '-'
        };

        console.log('Данные для отправки:', data);

        // Показываем индикатор загрузки
        const submitBtn = document.querySelector('.submit-btn');
        if (!submitBtn) {
            console.error('ОШИБКА: Кнопка отправки не найдена!');
            alert('Помилка: кнопка не знайдена');
            return;
        }
        
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="btn-text">Відправка...</span>';
        submitBtn.disabled = true;

        console.log('Отправка данных на Google Apps Script...');

        try {
            // Создаем скрытый iframe для обхода CORS
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.name = 'hidden_iframe';
            document.body.appendChild(iframe);

            // Создаем форму для отправки
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = GOOGLE_SCRIPT_URL;
            form.target = 'hidden_iframe';
            
            // Добавляем данные как hidden inputs
            for (const key in data) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = data[key];
                form.appendChild(input);
            }
            
            document.body.appendChild(form);
            
            // Отправляем форму
            form.submit();
            
            console.log('Данные отправлены!');
            
            // Удаляем временные элементы через 2 секунды
            setTimeout(() => {
                document.body.removeChild(form);
                document.body.removeChild(iframe);
            }, 2000);
            
            // Показываем сообщение об успехе сразу
            // (при iframe методе мы не можем проверить ответ, но отправка происходит)
            document.getElementById('registrationForm').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
            
            // Прокрутить к сообщению об успехе
            document.getElementById('successMessage').scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
            
        } catch (error) {
            console.error('ОШИБКА при отправке:', error);
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            alert('Виникла помилка: ' + error.message);
        }
    });
} else {
    console.error('КРИТИЧЕСКАЯ ОШИБКА: Форма registrationForm не найдена в DOM!');
}

function resetForm() {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.querySelector('.submit-btn');
    
    // Сбросить форму
    form.reset();
    
    // Сбросить кнопку
    if (submitBtn) {
        submitBtn.innerHTML = '<span class="btn-text">Зареєструватися</span>';
        submitBtn.disabled = false;
    }
    
    // Скрыть условные поля
    document.getElementById('questionField').style.display = 'none';
    document.getElementById('accessibilityOtherField').style.display = 'none';
    
    // Показать форму, скрыть сообщение
    form.style.display = 'block';
    document.getElementById('successMessage').style.display = 'none';
    
    // Прокрутить к началу формы
    document.querySelector('.header').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Анимация при прокрутке
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Применить анимацию к секциям формы
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.form-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});
