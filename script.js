document.addEventListener("DOMContentLoaded", () => {

// --- 1. АНИМАЦИЯ ПРИ СКРОЛЛЕ ---
const reveals = document.querySelectorAll('.reveal');
const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);
reveals.forEach(reveal => observer.observe(reveal));

// --- 2. ЛОГИКА FAQ ПАНЕЛИ ---
const faqLink = document.querySelector('a[href="#faq"]');
const faqSidebar = document.getElementById('faqSidebar');
const faqOverlay = document.getElementById('faqOverlay');
const faqClose = document.getElementById('faqClose');
function toggleFaq(e) {
    if(e) e.preventDefault();
    faqSidebar.classList.toggle('open');
    faqOverlay.classList.toggle('open');
    document.body.style.overflow = faqSidebar.classList.contains('open') ? 'hidden' : '';
}
if(faqLink) faqLink.addEventListener('click', toggleFaq);
faqClose.addEventListener('click', toggleFaq);
faqOverlay.addEventListener('click', toggleFaq);

// --- 3. ИНТЕРАКТИВНЫЙ ЧАТ-БОТ (ВОРОНКА С КОНТАКТАМИ) ---
const chatToggle = document.getElementById('chatToggle');
const chatWindow = document.getElementById('chatWindow');
const chatMessages = document.getElementById('chatMessages');
const chatOptions = document.getElementById('chatOptions');
const chatInputArea = document.getElementById('chatInputArea');
const chatTextInput = document.getElementById('chatTextInput');
const chatTextSubmit = document.getElementById('chatTextSubmit');

// Состояние: name (ввод имени) или contact (ввод телефона/TG)
let inputState = 'name'; 
let bookingData = { day: '', name: '', contact: '' };

function getUpcomingDate(targetDay) {
    const date = new Date();
    const today = date.getDay();
    let daysAhead = targetDay - today;
    if (daysAhead <= 0) daysAhead += 7; 
    date.setDate(date.getDate() + daysAhead);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

chatToggle.addEventListener('click', () => {
    chatWindow.classList.toggle('open');
    if(chatMessages.innerHTML.trim() === '') showMainMenu(true);
});

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${sender}-msg`;
    msgDiv.innerHTML = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showMainMenu(isFirstTime = false) {
    chatOptions.innerHTML = '';
    chatOptions.style.display = 'flex';
    chatInputArea.style.display = 'none';

    if (isFirstTime) {
        addMessage("Привет! Я виртуальный помощник. Что хочешь узнать перед первой тренировкой?", "bot");
    }

    const botScripts = {
        "Расписание?": "Тренировки проходят:<br>— Вт, Чт: 20:00<br>— Сб: 13:00",
        "Что взять?": "На первую тренировку нужно:<br>1. Спортивная форма (шорты, футболка)<br>2. Кроссовки (обязательно чистые!)<br>3. Вода и полотенце.<br><br>Перчатки и шлем мы выдадим бесплатно!",
        "Где зал?": "Мы тут:<br>г. Сургут, ул. Энергетиков 47, 2-й блок.<br>Вход со двора."
    };

    for (let question in botScripts) {
        const btn = document.createElement('button');
        btn.className = 'chat-btn';
        btn.textContent = question;
        btn.onclick = () => {
            addMessage(question, 'user');
            chatOptions.style.display = 'none';
            setTimeout(() => {
                addMessage(botScripts[question], 'bot');
                setTimeout(() => showMainMenu(), 500);
            }, 500);
        };
        chatOptions.appendChild(btn);
    }

    const bookBtn = document.createElement('button');
    bookBtn.className = 'chat-btn primary-btn';
    bookBtn.textContent = '🔥 Хочу записаться!';
    bookBtn.onclick = startBooking;
    chatOptions.appendChild(bookBtn);
}

// Шаг 1: Выбор дня
function startBooking() {
    addMessage('🔥 Хочу записаться!', 'user');
    chatOptions.style.display = 'none';
    
    setTimeout(() => {
        addMessage('Отличный настрой! Выбери удобный день для пробной тренировки:', 'bot');
        
        setTimeout(() => {
            chatOptions.innerHTML = '';
            
            const days = [
                { text: `Вторник (${getUpcomingDate(2)}) — 20:00`, val: `Вторник, ${getUpcomingDate(2)} в 20:00` },
                { text: `Четверг (${getUpcomingDate(4)}) — 20:00`, val: `Четверг, ${getUpcomingDate(4)} в 20:00` },
                { text: `Суббота (${getUpcomingDate(6)}) — 13:00`, val: `Суббота, ${getUpcomingDate(6)} в 13:00` }
            ];

            days.forEach(d => {
                const btn = document.createElement('button');
                btn.className = 'chat-btn';
                btn.textContent = d.text;
                btn.onclick = () => askForName(d.val, d.text);
                chatOptions.appendChild(btn);
            });

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'chat-btn';
            cancelBtn.textContent = '🔙 Назад';
            cancelBtn.onclick = () => showMainMenu();
            chatOptions.appendChild(cancelBtn);

            chatOptions.style.display = 'flex';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 500);
    }, 500);
}

// Шаг 2: Ввод Имени
function askForName(dayValue, displayBtnText) {
    bookingData.day = dayValue;
    addMessage(displayBtnText, 'user');
    chatOptions.style.display = 'none';

    setTimeout(() => {
        addMessage('Отлично. Напиши свое Имя и Фамилию, чтобы мы внесли тебя в список:', 'bot');
        setTimeout(() => {
            inputState = 'name';
            chatTextInput.placeholder = "Введи Имя и Фамилию...";
            chatTextInput.type = "text";
            chatInputArea.style.display = 'flex';
            chatTextInput.focus();
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 500);
    }, 500);
}

// Шаг 3: Ввод Контактов и Финал (Универсальная функция ввода)
function handleInputSubmit() {
    const text = chatTextInput.value.trim();
    if (!text) return; 

    // Если бот ждал имя
    if (inputState === 'name') {
        bookingData.name = text;
        chatTextInput.value = '';
        chatInputArea.style.display = 'none';
        
        addMessage(text, 'user');

        setTimeout(() => {
            addMessage(`Супер, ${text}! И последний шаг: оставь свой номер телефона или ник в Telegram, чтобы тренер мог подтвердить твою запись.`, 'bot');
            
            setTimeout(() => {
                inputState = 'contact';
                chatTextInput.placeholder = "Телефон или @telegram...";
                chatTextInput.type = "text";
                chatInputArea.style.display = 'flex';
                chatTextInput.focus();
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 500);
        }, 500);

    // Если бот ждал телефон/телеграм
    } else if (inputState === 'contact') {
        bookingData.contact = text;
        chatTextInput.value = '';
        chatInputArea.style.display = 'none';
        
        addMessage(text, 'user');

        setTimeout(() => {
            addMessage(`Всё готово! Ты записан(а) на пробную тренировку: <b>${bookingData.day}</b>.<br><br>Ждем тебя в зале на Энергетиков 47. Не забудь форму и чистые кроссовки! 🥊`, 'bot');
            
            // --- ОТПРАВКА В TELEGRAM ---
            const BOT_TOKEN = '8629438777:AAGrssy6lYntqi_YjGmApuX_O11uCZ3V3V8'; // Вставь токен бота
            const CHAT_ID = '8182564494'; // Вставь свой ID (или ID тренера)
            
            // Формируем красивое сообщение для тренера
            const message = `🥊 <b>Новая заявка на пробную тренировку!</b>\n\n` +
                            `👤 <b>Имя:</b> ${bookingData.name}\n` +
                            `📅 <b>День:</b> ${bookingData.day}\n` +
                            `📞 <b>Контакт:</b> ${bookingData.contact}`;

            // Ссылка для запроса к Telegram API
            const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

            // Отправляем данные
            fetch(tgUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'HTML' // Позволяет использовать жирный шрифт <b>
                })
            })
            .then(response => {
                if (response.ok) {
                    console.log('Успешно отправлено тренеру!');
                }
            })
            .catch(error => {
                console.error('Ошибка отправки в Telegram:', error);
            });

            setTimeout(() => {
                showMainMenu();
            }, 3000);
        }, 500);
    }
}

// Отправка по клику или Enter
chatTextSubmit.addEventListener('click', handleInputSubmit);
chatTextInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleInputSubmit();
});

        });
