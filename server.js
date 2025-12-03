const express = require('express');
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Путь к файлу Excel
const EXCEL_FILE = path.join(__dirname, 'registrations.xlsx');

// Инициализация Excel файла если не существует
function initExcelFile() {
    if (!fs.existsSync(EXCEL_FILE)) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([
            [
                'Дата та час',
                'ПІБ',
                'Посада',
                'Організація',
                'Область/місто',
                'Email',
                'Телефон',
                'Питання спікеру?',
                'Текст питання',
                'Потреби доступності',
                'Інші потреби',
                'Згода на обробку даних',
                'Коментарі'
            ]
        ]);
        
        // Установка ширины колонок
        ws['!cols'] = [
            { wch: 20 }, // Дата та час
            { wch: 30 }, // ПІБ
            { wch: 25 }, // Посада
            { wch: 35 }, // Організація
            { wch: 20 }, // Область/місто
            { wch: 30 }, // Email
            { wch: 15 }, // Телефон
            { wch: 10 }, // Питання спікеру?
            { wch: 50 }, // Текст питання
            { wch: 40 }, // Потреби доступності
            { wch: 30 }, // Інші потреби
            { wch: 15 }, // Згода
            { wch: 50 }  // Коментарі
        ];
        
        XLSX.utils.book_append_sheet(wb, ws, 'Реєстрації');
        XLSX.writeFile(wb, EXCEL_FILE);
    }
}

// Обработчик отправки формы
app.post('/submit', (req, res) => {
    try {
        const data = req.body;
        
        // Читаем существующий файл
        initExcelFile();
        const wb = XLSX.readFile(EXCEL_FILE);
        const ws = wb.Sheets['Реєстрації'];
        
        // Получаем текущие данные
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        // Добавляем новую строку
        jsonData.push([
            data.timestamp,
            data.fullName,
            data.position,
            data.organization,
            data.location,
            data.email,
            data.phone,
            data.hasQuestion,
            data.question,
            data.accessibility,
            data.accessibilityOther,
            data.consent,
            data.comments
        ]);
        
        // Создаем новый worksheet
        const newWs = XLSX.utils.aoa_to_sheet(jsonData);
        
        // Установка ширины колонок
        newWs['!cols'] = [
            { wch: 20 },
            { wch: 30 },
            { wch: 25 },
            { wch: 35 },
            { wch: 20 },
            { wch: 30 },
            { wch: 15 },
            { wch: 10 },
            { wch: 50 },
            { wch: 40 },
            { wch: 30 },
            { wch: 15 },
            { wch: 50 }
        ];
        
        // Обновляем worksheet
        wb.Sheets['Реєстрації'] = newWs;
        
        // Сохраняем файл
        XLSX.writeFile(wb, EXCEL_FILE);
        
        console.log('Нова реєстрація:', data.fullName);
        res.json({ success: true, message: 'Дані успішно збережено' });
    } catch (error) {
        console.error('Помилка при збереженні:', error);
        res.status(500).json({ success: false, message: 'Помилка сервера' });
    }
});

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🎉 Сервер успішно запущено!                           ║
║                                                          ║
║   📍 Адреса: http://localhost:${PORT}                        ║
║                                                          ║
║   📊 Дані зберігаються в: registrations.xlsx            ║
║                                                          ║
║   ✅ Форма готова до використання!                      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `);
    initExcelFile();
});