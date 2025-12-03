// Показ/скрытие поля для вопроса спикеру
document.getElementById('questionYes').addEventListener('change', function() {
    if (this.checked) {
        document.getElementById('questionField').style.display = 'block';
        document.getElementById('question').setAttribute('required', 'required');
    }
});

document.getElementById('questionNo').addEventListener('change', function() {
    if (this.checked) {
        document.getElementById('questionField').style.display = 'none';
        document.getElementById('question').removeAttribute('required');
        document.getElementById('question').value = '';
    }
});

// Показ/скрытие поля "Інше" для доступности
document.getElementById('accessibilityOther').addEventListener('change', function() {
    if (this.checked) {
        document.getElementById('accessibilityOtherField').style.display = 'block';
    } else {
        document.getElementById('accessibilityOtherField').style.display = 'none';
        document.getElementById('accessibilityOtherText').value = '';
    }
});

// Обработка отправки формы
document.getElementById('registrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = {
        timestamp: new Date().toLocaleString('uk-UA'),
        fullName: formData.get('fullName'),
        position: formData.get('position'),
        organization: formData.get('organization'),
        location: formData.get('location'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        hasQuestion: formData.get('hasQuestion') === 'yes' ? 'Так' : 'Ні',
        question: formData.get('question') || '-',
        accessibility: getAccessibilityNeeds(formData),
        accessibilityOther: formData.get('accessibilityOtherText') || '-',
        consent: formData.get('consent') === 'yes' ? 'Даю згоду' : 'Не даю згоду',
        comments: formData.get('comments') || '-'
    };

    // Отправка данных на сервер
    try {
        const response = await fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            // Показать сообщение об успехе
            document.getElementById('registrationForm').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
            
            // Прокрутить к сообщению об успехе
            document.getElementById('successMessage').scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
        } else {
            alert('Виникла помилка при відправці форми. Будь ласка, спробуйте ще раз.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Виникла помилка при відправці форми. Будь ласка, спробуйте ще раз.');
    }
});

function getAccessibilityNeeds(formData) {
    const needs = [];
    const accessibilityValues = formData.getAll('accessibility');
    
    const labels = {
        'support': 'Потрібен супровід для людей з інвалідністю',
        'frontRow': 'Потрібне місце у першому ряду',
        'signLanguage': 'Потрібен сурдоперекладач',
        'other': 'Інше'
    };

    accessibilityValues.forEach(value => {
        if (labels[value]) {
            needs.push(labels[value]);
        }
    });

    return needs.length > 0 ? needs.join('; ') : 'Немає особливих потреб';
}

function resetForm() {
    document.getElementById('registrationForm').reset();
    document.getElementById('questionField').style.display = 'none';
    document.getElementById('accessibilityOtherField').style.display = 'none';
    document.getElementById('registrationForm').style.display = 'block';
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