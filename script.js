document.addEventListener('DOMContentLoaded', () => {
    // ELEMENTI DEL DOM
    const chatWindow = document.getElementById('chat-window');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const senderSelector = document.getElementById('sender-selector');
    const imageInput = document.getElementById('image-input');
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiPicker = document.getElementById('emoji-picker');
    const savePdfBtn = document.getElementById('save-pdf-btn');

    // Elementi profilo utente principale
    const user1PicInput = document.getElementById('user1-pic-input');
    const user1Pic = document.getElementById('user1-pic');
    const user1NameInput = document.getElementById('user1-name');
    const user1UrlInput = document.getElementById('user1-url-input');

    // Elementi per aggiungere nuovi utenti
    const newUserNamenput = document.getElementById('new-user-name');
    const newUserUrlInput = document.getElementById('new-user-url');
    const addUserBtn = document.getElementById('add-user-btn');
    const contactListDiv = document.getElementById('contact-list');

    // --- DATA STORE ---
    let users = [
        { id: 1, name: 'Tu', picSrc: 'https://via.placeholder.com/40/dcf8c6/000000?text=Tu' },
        { id: 2, name: 'Contatto 1', picSrc: 'https://via.placeholder.com/40/ffffff/000000?text=C1' }
    ];

    let uploadedImage = null;
    const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '🤔', '🤫', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '❤️', '👍', '👎', '🔥', '🙏', '🎉', '💯'];

    // --- FUNZIONI ---

    /**
     * Popola il menu a tendina con tutti gli utenti disponibili.
     */
    const populateSenderSelector = () => {
        senderSelector.innerHTML = '';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            senderSelector.appendChild(option);
        });
    };

    /**
     * Mostra la lista dei contatti (escluso l'utente principale) nell'header.
     */
    const displayContacts = () => {
        contactListDiv.innerHTML = '';
        users.forEach(user => {
            if (user.id === 1) return; // Salta l'utente principale
            const contactSpan = document.createElement('span');
            contactSpan.textContent = user.name;
            contactListDiv.appendChild(contactSpan);
        });
    };

    const addDeleteButtonToMessage = (messageElement) => {
        const messageContent = messageElement.querySelector('.message-content');
        if (!messageContent) return;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-msg-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.title = 'Elimina messaggio';

        deleteBtn.addEventListener('click', () => {
            if (confirm('Sei sicuro di voler eliminare questo messaggio?')) {
                messageElement.remove();
            }
        });

        messageContent.appendChild(deleteBtn);
    };
    
    /**
     * La funzione principale per aggiungere un messaggio.
     * Ora basata sull'ID dell'utente selezionato.
     */
    const addMessage = () => {
        const text = messageInput.value.trim();
        const senderId = parseInt(senderSelector.value, 10);
        
        if (text === '' && !uploadedImage) return;

        const sender = users.find(u => u.id === senderId);
        if (!sender) {
            console.error("Mittente non trovato!");
            return;
        }

        // L'utente principale (id: 1) è 'sent', tutti gli altri sono 'received'
        const messageType = (sender.id === 1) ? 'sent' : 'received';
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', messageType);

        const profilePicDiv = document.createElement('div');
        profilePicDiv.classList.add('message-profile-pic');
        const profileImg = document.createElement('img');
        profileImg.src = sender.picSrc; // Usa l'immagine del mittente corretto
        profilePicDiv.appendChild(profileImg);
        messageDiv.appendChild(profilePicDiv);

        const messageContentDiv = document.createElement('div');
        messageContentDiv.classList.add('message-content');
        
        if (uploadedImage) {
            const img = document.createElement('img');
            img.src = uploadedImage;
            img.classList.add('message-image');
            messageContentDiv.appendChild(img);
            uploadedImage = null;
        }

        if (text) {
            const p = document.createElement('p');
            const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            p.innerHTML = text.replace(urlRegex, url => `<a href="${url}" target="_blank">${url}</a>`);
            messageContentDiv.appendChild(p);
        }
        
        const timeDiv = document.createElement('div');
        timeDiv.classList.add('message-time');
        const now = new Date();
        timeDiv.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        messageContentDiv.appendChild(timeDiv);

        messageDiv.appendChild(messageContentDiv);
        
        addDeleteButtonToMessage(messageDiv);
        chatWindow.appendChild(messageDiv);

        messageInput.value = '';
        messageInput.style.height = 'auto';
        chatWindow.scrollTop = chatWindow.scrollHeight;
        messageInput.focus();
    };

    // --- FUNZIONI DI AGGIORNAMENTO PROFILI ---

    const updateMainUserProfile = (newSrc) => {
        const mainUser = users.find(u => u.id === 1);
        if (mainUser) {