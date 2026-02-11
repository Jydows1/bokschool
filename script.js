let isChatInitiated = false;

// --- ЛОГИКА FAQ (ОСТАВИЛИ БЕЗ ИЗМЕНЕНИЙ) ---
function toggleFAQ(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('faq-modal');
    if (modal.classList.contains('open')) {
        modal.classList.remove('open');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    } else {
        modal.style.display = 'flex';
        setTimeout(() => { modal.classList.add('open'); }, 10);
    }
}

function toggleAccordion(element) {
    element.classList.toggle('active');
    const answer = element.nextElementSibling;
    if (element.classList.contains('active')) {
        answer.style.maxHeight = answer.scrollHeight + "px";
    } else {
        answer.style.maxHeight = "0";
    }
}

// --- ЛОГИКА ЧАТА ---
function toggleChat(event) {
    if(event) event.stopPropagation();
    const chatWindow = document.getElementById('chat-window');
    const overlay = document.getElementById('chat-overlay');
    const notifyDot = document.getElementById('chat-notify');
    const chatButton = document.getElementById('chatbot');
    
    if (chatWindow.classList.contains('chat-open')) {
        forceCloseChat();
    } else {
        chatWindow.classList.remove('chat-closing');
        chatWindow.classList.add('chat-open');
        overlay.style.display = 'block';
        setTimeout(() => overlay.classList.add('visible'), 10);
        if(notifyDot) notifyDot.style.display = 'none';
        if (window.matchMedia && window.matchMedia('(max-width: 480px)').matches) {
            if (chatButton) chatButton.style.display = 'none';
        }
        if (!isChatInitiated) { initBot(); }
    }
}

function forceCloseChat() {
    const chatWindow = document.getElementById('chat-window');
    const overlay = document.getElementById('chat-overlay');
    const chatButton = document.getElementById('chatbot');
    if (!chatWindow.classList.contains('chat-open')) return;
    chatWindow.classList.remove('chat-open');
    chatWindow.classList.add('chat-closing');
    overlay.classList.remove('visible');
    setTimeout(() => {
        chatWindow.classList.remove('chat-closing');
        overlay.style.display = 'none';
        if (chatButton) chatButton.style.display = '';
    }, 300);
}

function openChatWithIntent(intent) {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow.classList.contains('chat-open')) {
        toggleChat();
        setTimeout(() => processUserMessage(intent), 400);
    } else {
        processUserMessage(intent);
    }
}

// --- БАЗА ЗНАНИЙ БОТА (ОБНОВЛЕННАЯ: БЕЗ ЦЕН) ---
// Убрали кнопку "Оплата" из главного меню
const MAIN_MENU_CHIPS = ['📅 Расписание', '❓ Частые вопросы', '✍️ Записаться', '🎒 Что взять?', '📍 Где зал?'];

const botKnowledge = [
    {
        keywords: ['частые вопросы', 'faq', 'вопрос', 'ответы'],
        answer: "Открываю список частых вопросов! 🧐 Там есть подробности про тренировки и экипировку.",
        action: 'open_faq', 
        chips: ['🔙 В главное меню']
    },
    { 
        keywords: ['расписани', 'когда', 'время', 'график'], 
        answer: "🗓 Тренировки проходят:<br>— Вт, Чт: 20:00 (Взрослые)<br>— Вт, Чт: 20:00 (Дети)<br>— Сб: 13:00 (Общая)<br><br>На какое время хотите записаться?", 
        chips: ['Записаться на 20:00', 'Записаться на 13:00', '🔙 В главное меню'] 
    },
    {
        keywords: ['20:00', '20.00', '19:00', '19.00'], 
        answer: "Отлично! 👍<br>Ждем вас к <b>20:00</b> на пробную тренировку.<br>Приходите за 15 минут до начала. Не забудьте форму! 🥊",
        chips: ['📍 Где зал?', '🎒 Что взять?', '🔙 В главное меню']
    },
    {
        keywords: ['13:00', '13.00'],
        answer: "Отлично! 👍<br>Ждем вас к <b>13:00</b> на пробную тренировку.<br>Приходите за 15 минут до начала. Не забудьте форму! 🥊",
        chips: ['📍 Где зал?', '🎒 Что взять?', '🔙 В главное меню']
    },
    { 
        // Если спрашивают про цены, отправляем в FAQ или к тренеру
        keywords: ['цен', 'стоит', 'прайс', 'оплат', 'деньг', 'купить', 'абонемент'], 
        answer: "💳 Подробности о стоимости занятий и абонементах можно посмотреть в разделе «Частые вопросы» или узнать лично у тренера.<br><br>Первая тренировка — бесплатно!", 
        action: 'open_faq', 
        chips: ['✍️ Записаться', '🔙 В главное меню'] 
    },
    { 
        keywords: ['где', 'адрес', 'находитесь', 'карта', 'место', 'зал'], 
        answer: "📍 Мы тут:<br>г. Сургут, ул. Энергетиков 47, 2-й блок.<br>Вход со двора.<br><br>Парковка есть прямо у входа! 🚗", 
        action: 'map_link',
        chips: ['🔙 В главное меню', '✍️ Записаться'] 
    },
    { 
        keywords: ['записа', 'хочу', 'пробн', 'начать'], 
        answer: "Супер! 🔥 Для записи выберите время тренировки:", 
        chips: ['Записаться на 20:00', 'Записаться на 13:00']
    },
    { 
        keywords: ['экипиров', 'форма', 'брать', 'перчатк', 'одежда', 'собой', 'взять'], 
        answer: "🎒 На первую тренировку нужно:<br>1. Спортивная форма (шорты, футболка)<br>2. Кроссовки (обязательно чистые!)<br>3. Вода и полотенце.<br><br>🥊 Перчатки и шлем мы выдадим бесплатно!", 
        chips: ['📅 Расписание', '✍️ Записаться', '🔙 В главное меню'] 
    },
    {
        keywords: ['меню', 'назад', 'главн'],
        answer: "Что вас интересует?",
        chips: MAIN_MENU_CHIPS
    }
];

function initBot() {
    isChatInitiated = true;
    showTyping();
    setTimeout(() => {
        hideTyping();
        // Убрали проверку подписки, просто приветствие
        let greeting = "Привет! 👋 Я помощник тренера. Выберите вопрос ниже:";
        addBotMessage(greeting);
        showQuickButtons(MAIN_MENU_CHIPS);
    }, 600);
}

// --- ФУНКЦИИ СООБЩЕНИЙ ---
function addMessage(html, type) {
    const messages = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.innerHTML = html;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
}
function addBotMessage(text) { addMessage(text, 'bot-message'); }
function addUserMessage(text) { addMessage(text, 'user-message'); }

function showTyping() {
    const messages = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    messages.appendChild(typingDiv);
    messages.scrollTop = messages.scrollHeight;
}
function hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
}

function showQuickButtons(options) {
    const messages = document.getElementById('chat-messages');
    const btnContainer = document.createElement('div');
    btnContainer.className = 'quick-replies';
    options.forEach(text => {
        const btn = document.createElement('div');
        btn.className = 'chip';
        btn.innerText = text;
        btn.onclick = (event) => {
            event.stopPropagation();
            btnContainer.remove(); 
            addUserMessage(text);
            processUserMessage(text);
        };
        btnContainer.appendChild(btn);
    });
    messages.appendChild(btnContainer);
    messages.scrollTop = messages.scrollHeight;
}

function handleKeyPress(event) { if (event.key === 'Enter') sendMessage(); }

function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text) return;
    addUserMessage(text);
    input.value = '';
    const oldChips = document.querySelector('.quick-replies');
    if(oldChips) oldChips.remove();
    processUserMessage(text);
}

function processUserMessage(text) {
    text = text.toLowerCase();
    showTyping();
    setTimeout(() => {
        hideTyping();
        let found = false;
        for (let item of botKnowledge) {
            if (item.keywords.some(keyword => text.includes(keyword))) {
                let answerText = (typeof item.answer === 'function') ? item.answer() : item.answer;
                addBotMessage(answerText);
                
                if (item.action === 'telegram_link') { addTelegramButton(); }
                else if (item.action === 'map_link') { addMapButton(); }
                else if (item.action === 'open_faq') { toggleFAQ(); }
                
                if (item.chips) { 
                    showQuickButtons(item.chips); 
                } else {
                    showQuickButtons(MAIN_MENU_CHIPS);
                }
                
                found = true;
                break; 
            }
        }
        if (!found) {
            if (text.length < 3) { 
                addBotMessage("Пожалуйста, уточните вопрос 😊"); 
                showQuickButtons(MAIN_MENU_CHIPS);
            } 
            else {
                addBotMessage("Я пока учусь и не знаю ответа. Попробуйте выбрать из меню:");
                showQuickButtons(MAIN_MENU_CHIPS); 
            }
        }
    }, 600 + Math.random() * 500);
}

function addTelegramButton(btnText = "Написать в Telegram") {
    addBotMessage(`<a href="https://t.me/Klinsmann86rus" target="_blank" class="btn pay-link" style="background:#25D366; margin-top:5px;">${btnText}</a>`);
}

function addMapButton() {
    addBotMessage(`<a href="https://yandex.ru/maps/-/CLhSjMmp" target="_blank" class="btn pay-link" style="background:#ffcc00; color: #000; margin-top:5px;">🗺 Открыть Яндекс.Карты</a>`);
}

// --- ЛОГИКА СЛАЙДЕРА ---
let currentSlideIndex = 1; 
const slides = document.querySelectorAll('.slide-card');
const totalSlides = slides.length;

function updateSlider() {
    if (slides.length === 0) return;
    slides.forEach((slide, index) => {
        slide.className = 'slide-card'; 
        if (index === currentSlideIndex) {
            slide.classList.add('active');
            slide.onclick = null; 
        } 
        else if (index === currentSlideIndex - 1 || (currentSlideIndex === 0 && index === totalSlides - 1)) {
            slide.classList.add('prev');
            slide.onclick = () => moveSlide(-1);
        } 
        else if (index === currentSlideIndex + 1 || (currentSlideIndex === totalSlides - 1 && index === 0)) {
            slide.classList.add('next');
            slide.onclick = () => moveSlide(1);
        } 
        else {
            slide.classList.add('hidden');
            slide.onclick = null;
        }
    });
}

function moveSlide(direction) {
    currentSlideIndex += direction;
    if (currentSlideIndex < 0) currentSlideIndex = totalSlides - 1;
    else if (currentSlideIndex >= totalSlides) currentSlideIndex = 0;
    updateSlider();
}

// --- LIGHTBOX ---
function openLightbox(element) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    let imgSrc = '';

    if (element.tagName === 'IMG') {
        imgSrc = element.src;
    } 
    else {
        const img = element.querySelector('img');
        if (img) imgSrc = img.src;
    }

    if (imgSrc && lightbox && lightboxImg) {
        lightboxImg.src = imgSrc;
        lightbox.style.display = 'flex';
        setTimeout(() => {
            lightbox.classList.add('show');
        }, 10);
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('show');
        setTimeout(() => { 
            lightbox.style.display = 'none'; 
            document.body.style.overflow = '';
            const lightboxImg = document.getElementById('lightbox-img');
            if(lightboxImg) lightboxImg.src = '';
        }, 300);
    }
}

// --- ЛОГИКА ВКЛАДОК FAQ ---
function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
        tabContents[i].classList.remove("active");
    }
    const tabLinks = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove("active");
    }
    const selectedTab = document.getElementById(tabName);
    if(selectedTab) {
        selectedTab.style.display = "block";
        setTimeout(() => selectedTab.classList.add("active"), 10);
    }
    if(evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    }
}

// --- ИНИЦИАЛИЗАЦИЯ ---
window.onload = function() {
    updateSlider(); 
    
    // Показываем уведомление на чате через 5 сек
    setTimeout(() => {
        if (!isChatInitiated) {
            const dot = document.getElementById('chat-notify');
            if(dot) dot.style.display = 'block';
        }
    }, 5000);
    
    const sliderContainer = document.getElementById('coach-slider');
    if(sliderContainer){
        let startX = 0;
        let startY = 0;
        let isSwiping = false;

        sliderContainer.addEventListener('touchstart', e => {
            startX = e.changedTouches[0].screenX;
            startY = e.changedTouches[0].screenY;
            isSwiping = true;
        }, { passive: true });

        sliderContainer.addEventListener('touchend', e => {
            if (!isSwiping) return;
            const endX = e.changedTouches[0].screenX;
            const endY = e.changedTouches[0].screenY;
            const diffX = endX - startX;
            const diffY = endY - startY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > 40) { 
                    if (diffX < 0) moveSlide(1); 
                    else moveSlide(-1); 
                }
            }
            isSwiping = false;
        });
    }
};
