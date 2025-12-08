// ИНСТРУКЦИЯ ПО НАСТРОЙКЕ:
// 1. Откройте Google Sheets и создайте новую таблицу
// 2. Переименуйте лист в "Реєстрації"
// 3. В первой строке добавьте заголовки:
//    A1: Дата та час
//    B1: ПІБ
//    C1: Посада
//    D1: Організація
//    E1: Область/місто
//    F1: Email
//    G1: Телефон
//    H1: Питання спікеру?
//    I1: Текст питання
//    J1: Потреби доступності
//    K1: Інші потреби
//    L1: Згода на обробку даних
//    M1: Коментарі
// 4. Нажмите Extensions (Розширення) → Apps Script
// 5. Удалите весь код и вставьте этот скрипт
// 6. Нажмите Deploy (Розгорнути) → New deployment (Нове розгортання)
// 7. Выберите тип: Web app
// 8. Execute as: Me
// 9. Who has access: Anyone
// 10. Нажмите Deploy
// 11. Скопируйте URL и вставьте в script.js в переменную GOOGLE_SCRIPT_URL

function doPost(e) {
  try {
    Logger.log('=== НАЧАЛО ОБРАБОТКИ ===');
    Logger.log('Тип запроса: ' + (e.postData ? 'POST с данными' : 'POST без данных'));
    
    // Получаем активную таблицу и лист
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // Пытаемся найти лист по имени, если нет — берём ПЕРВЫЙ лист
    const sheet = ss.getSheetByName('Реєстрації') || ss.getSheets()[0];
    
    if (!sheet) {
      Logger.log('ОШИБКА: Лист "Реєстрації" не найден!');
      return ContentService
        .createTextOutput('ERROR: Sheet not found')
        .setMimeType(ContentService.MimeType.TEXT);
    }
    
    Logger.log('Лист найден: ' + sheet.getName());
    
    // Получаем данные из параметров формы
    const params = e.parameter;
    Logger.log('Полученные параметры: ' + JSON.stringify(params));
    
    // Добавляем новую строку с данными
    const row = [
      params.timestamp || '',
      params.fullName || '',
      params.position || '',
      params.organization || '',
      params.location || '',
      params.email || '',
      params.phone || '',
      params.hasQuestion || '',
      params.question || '',
      params.accessibility || '',
      params.accessibilityOther || '',
      params.consent || '',
      params.comments || ''
    ];
    
    Logger.log('Добавляем строку: ' + JSON.stringify(row));
    sheet.appendRow(row);
    Logger.log('Строка добавлена успешно!');
    
    return ContentService
      .createTextOutput('SUCCESS')
      .setMimeType(ContentService.MimeType.TEXT);
    
  } catch (error) {
    Logger.log('КРИТИЧЕСКАЯ ОШИБКА: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    return ContentService
      .createTextOutput('ERROR: ' + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

// Функция для GET запросов (опционально)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Форма реєстрації працює!'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
