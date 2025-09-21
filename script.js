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

    const user1PicInput = document.getElementById('user1-pic-input');
    const user1Pic = document.getElementById('user1-pic');
    const user1NameInput = document.getElementById('user1-name');
    const user1UrlInput = document.getElementById('user1-url-input');

    const newUserNameInput = document.getElementById('new-user-name');
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

    const populateSenderSelector = () => {
        senderSelector.innerHTML = '';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            senderSelector.appendChild(option);
        });
    };

    const displayContacts = () => {
        contactListDiv.innerHTML = '';
        users.forEach(user => {
            if (user.id === 1) return;
            const contactSpan = document.createElement('span');
            contactSpan.textContent = user.name;
            contactListDiv.appendChild(contactSpan);
        });
    };

    const addNewContact = () => {
        const name = newUserNameInput.value.trim();
        let url = newUserUrlInput.value.trim();

        if (!name) {
            alert("Per favore, inserisci un nome per il nuovo contatto.");
            return;
        }

        const isDuplicate = users.some(user => user.name.toLowerCase() === name.toLowerCase());
        if (isDuplicate) {
            alert("Un contatto con questo nome esiste già.");
            return;
        }

        if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
            const initials = name.substring(0, 2).toUpperCase();
            url = `https://via.placeholder.com/40/ffffff/000000?text=${initials}`;
        }
        
        const newUser = {
            id: Date.now(),
            name: name,
            picSrc: url
        };
        
        users.push(newUser);
        populateSenderSelector();
        displayContacts();

        newUserNameInput.value = '';
        newUserUrlInput.value = '';
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
    
    const addMessage = () => {
        const text = messageInput.value.trim();
        const senderId = parseInt(senderSelector.value, 10);
        
        if (text === '' && !uploadedImage) return;

        const sender = users.find(u => u.id === senderId);
        if (!sender) {
            console.error("Mittente non trovato!");
            return;
        }

        const messageType = (sender.id === 1) ? 'sent' : 'received';
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', messageType);
        messageDiv.dataset.senderId = sender.id;

        const profilePicDiv = document.createElement('div');
        profilePicDiv.classList.add('message-profile-pic');
        const profileImg = document.createElement('img');
        profileImg.src = sender.picSrc;
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
            // *** BUG CRITICO CORRETTO QUI: La regular expression era corrotta. ***
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

    const updateMainUserProfile = (newSrc) => {
        const mainUser = users.find(u => u.id === 1);
        if (mainUser) {
            mainUser.picSrc = newSrc;
        }
        user1Pic.src = newSrc;
        updateExistingMessageProfilePics();
    };
    
    const updateProfilePicFromFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => updateMainUserProfile(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    const updateProfilePicFromUrl = (urlInput) => {
        const url = urlInput.value.trim();
        if (!url) return;

        if (url.startsWith('http://') || url.startsWith('https://')) {
            const testImg = new Image();
            testImg.src = url;
            testImg.onload = () => updateMainUserProfile(url);
            testImg.onerror = () => {
                alert("URL non valido o immagine non raggiungibile.");
                urlInput.value = '';
            };
        } else {
            alert("Per favore, inserisci un URL valido.");
            urlInput.value = '';
        }
    };

    function updateExistingMessageProfilePics() {
        chatWindow.querySelectorAll('.message').forEach(message => {
            const senderId = parseInt(message.dataset.senderId, 10);
            const sender = users.find(u => u.id === senderId);
            if (sender) {
                const profileImgElement = message.querySelector('.message-profile-pic img');
                if (profileImgElement) {
                    profileImgElement.src = sender.picSrc;
                }
            }
        });
    }
    
    const populateEmojiPicker = () => {
        emojis.forEach(emoji => {
            const span = document.createElement('span');
            span.textContent = emoji;
            span.addEventListener('click', () => {
                messageInput.value += emoji;
                emojiPicker.classList.remove('active');
                messageInput.focus();
            });
            emojiPicker.appendChild(span);
        });
    };

    const saveChatAsPdf = () => {
        const { jsPDF } = window.jspdf;
        const chatToSave = document.getElementById('chat-window');
        const originalButtonIcon = savePdfBtn.innerHTML;
        const bodyStyle = window.getComputedStyle(document.body);

        savePdfBtn.disabled = true;
        savePdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        chatToSave.style.backgroundImage = bodyStyle.backgroundImage;

        html2canvas(chatToSave, {
            useCORS: true,
            scale: 2,
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const ratio = canvas.width / canvas.height;
            const imgHeight = pdfWidth / ratio;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = -heightLeft;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            
            const now = new Date();
            const filename = `chat_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.pdf`;
            pdf.save(filename);

        }).catch(err => {
            console.error("Errore durante la creazione del PDF:", err);
            alert("Si è verificato un errore durante il salvataggio del PDF.");
        }).finally(() => {
            chatToSave.style.backgroundImage = '';
            savePdfBtn.disabled = false;
            savePdfBtn.innerHTML = originalButtonIcon;
        });
    };
    
    // --- EVENT LISTENERS ---
    
    sendBtn.addEventListener('click', addMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addMessage();
        }
    });
    
    addUserBtn.addEventListener('click', addNewContact);

    user1PicInput.addEventListener('change', updateProfilePicFromFile);
    user1UrlInput.addEventListener('change', () => updateProfilePicFromUrl(user1UrlInput));
    user1NameInput.addEventListener('change', () => {
        const mainUser = users.find(u => u.id === 1);
        if(mainUser) {
            const oldName = mainUser.name;
            const newName = user1NameInput.value.trim();
            if (newName === '') {
                alert("Il nome non può essere vuoto.");
                user1NameInput.value = oldName;
                return;
            }
            mainUser.name = newName;
            populateSenderSelector();
        }
    });
    
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedImage = event.target.result;
                messageInput.placeholder = "Immagine pronta. Aggiungi una didascalia...";
            };
            reader.readAsDataURL(file);
        }
    });

    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = `${messageInput.scrollHeight}px`;
    });

    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPicker.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
            emojiPicker.classList.remove('active');
        }
    });

    savePdfBtn.addEventListener('click', saveChatAsPdf);
    
    // --- INIZIALIZZAZIONE ---
    populateSenderSelector();
    displayContacts();
    populateEmojiPicker();
    document.querySelectorAll('.message').forEach(addDeleteButtonToMessage);
});
