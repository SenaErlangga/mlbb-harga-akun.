document.addEventListener('DOMContentLoaded', function() {
    // --- Elemen DOM Utama ---
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultPrice = document.getElementById('resultPrice');
    const priceBreakdown = document.getElementById('priceBreakdown');
    const winRateInput = document.getElementById('winRate');
    const winRateProgressBar = document.getElementById('winRateProgressBar');
    const totalRankMatchesInput = document.getElementById('totalRankMatches');
    const emblemLevel60Input = document.getElementById('emblemLevel60');
    const emblemCountSpan = document.getElementById('emblemCount');
    const resultSection = document.querySelector('.result-section');

    // --- Elemen Form Masukan Feedback ---
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const feedbackUsernameInput = document.getElementById('feedbackUsername');
    const feedbackSuggestionInput = document.getElementById('feedbackSuggestion');

    // --- Elemen Tampilan Komentar ---
    const commentsList = document.getElementById('commentsList');
    const refreshCommentsBtn = document.getElementById('refreshCommentsBtn');
    // URL Google Apps Script Web App
    const GOOGLE_APPS_SCRIPT_URL = feedbackForm.action; 

    // --- Elemen Counter Pengunjung ---
    const visitorCountSpan = document.getElementById('visitorCount');

    // --- Konfigurasi Input Skin ---
    const skinInputIds = [
        'skinSupreme', 'skinGrand', 'skinExquisite', 'skinDeluxe', 
        'skinExceptional', 'skinCommon', 'skinPainted'
    ];

    // ==========================================
    // SUPER SECURITY: Fungsi Blokir Link & Anti-XSS
    // ==========================================
    function sanitizeComment(str) {
        if (typeof str !== 'string') return '';

        // 1. BLOKIR LINK: Sensor pola http, https, www, atau domain umum (.com, .net, .slot, dll)
        // Ini biar link judi rajakayu88 dkk langsung mampus
        let textWithoutLinks = str.replace(/(?:https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9.-]+\.(?:com|net|org|info|xyz|biz|id|co|me|vip|slot|88|fun|top)[^\s]*/ig, '[🛡️ Link Diblokir Admin]');

        // 2. ESCAPE HTML: Mencegah eksekusi script jahat (XSS)
        return textWithoutLinks.replace(/[&<>'"]/g, function(tag) {
            const charsToReplace = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            };
            return charsToReplace[tag] || tag;
        });
    }
    // ==========================================

    // --- Fungsi Helper Umum ---
    function formatToIDR(amount) {
        return 'Rp ' + amount.toLocaleString('id-ID');
    }

    function showError(elementId, message) {
        const errorDiv = document.getElementById(elementId + '-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
        }
    }

    function clearError(elementId) {
        const errorDiv = document.getElementById(elementId + '-error');
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.classList.remove('show');
        }
    }

    // --- Validasi Input Form Utama ---
    function validateInputs() {
        let isValid = true;

        const winRate = parseFloat(winRateInput.value);
        if (isNaN(winRate) || winRate < 0 || winRate > 100) {
            showError('winRate', 'Win Rate harus antara 0-100%.');
            isValid = false;
        } else {
            clearError('winRate');
        }

        const totalHeroesInput = document.getElementById('totalHeroes');
        const totalHeroes = parseInt(totalHeroesInput.value);
        if (isNaN(totalHeroes) || totalHeroes < 0) {
            showError('totalHeroes', 'Jumlah Hero harus angka positif.');
            isValid = false;
        } else {
            clearError('totalHeroes');
        }

        const totalRankMatches = parseInt(totalRankMatchesInput.value);
        if (isNaN(totalRankMatches) || totalRankMatches < 0) {
            showError('totalRankMatches', 'Total Ranked Matches harus angka positif.');
            isValid = false;
        } else {
            clearError('totalRankMatches');
        }

        const emblemLevel60 = parseInt(emblemLevel60Input.value);
        if (isNaN(emblemLevel60) || emblemLevel60 < 0 || emblemLevel60 > 7) {
            showError('emblemLevel60', 'Jumlah Emblem Level 60 harus antara 0-7.');
            isValid = false;
        } else {
            clearError('emblemLevel60');
        }

        skinInputIds.forEach(id => {
            const inputElement = document.getElementById(id);
            const value = parseInt(inputElement.value);
            if (isNaN(value) && inputElement.value !== '') {
                 showError(id, 'Masukkan angka yang valid.');
                 isValid = false;
            } else if (value < 0) {
                showError(id, 'Angka tidak boleh negatif.');
                isValid = false;
            } else {
                clearError(id);
            }
        });

        return isValid;
    }

    // --- Fungsi Perhitungan Harga Akun ---
    calculateBtn.addEventListener('click', function() {
        if (!validateInputs()) {
            resultPrice.textContent = 'Rp 0';
            priceBreakdown.innerHTML = '';
            return;
        }

        let totalPrice = 0;
        let breakdown = {};

        // 1. Harga Dasar Akun
        const basePrice = 10000;
        totalPrice += basePrice;
        breakdown['Harga Dasar Akun'] = basePrice;

        // 2. Ambil Input
        const tier = document.getElementById('tier').value;
        const winRate = parseFloat(winRateInput.value) || 0;
        const totalRankMatches = parseInt(totalRankMatchesInput.value) || 0;
        const emblemLevel60 = parseInt(emblemLevel60Input.value) || 0;

        const skinSupreme = parseInt(document.getElementById('skinSupreme').value) || 0;
        const skinGrand = parseInt(document.getElementById('skinGrand').value) || 0;
        const skinExquisite = parseInt(document.getElementById('skinExquisite').value) || 0;
        const skinDeluxe = parseInt(document.getElementById('skinDeluxe').value) || 0;
        const skinExceptional = parseInt(document.getElementById('skinExceptional').value) || 0;
        const skinCommon = parseInt(document.getElementById('skinCommon').value) || 0;
        const paintedSkin = parseInt(document.getElementById('skinPainted').value) || 0;

        // 3. Perhitungan
        const skinPoinValues = {
            'Supreme': 4000, 'Grand': 3000, 'Exquisite': 2000, 'Deluxe': 400,
            'Exceptional': 200, 'Common': 10, 'Painted': 40
        };
        const pricePerSkinPoint = 20; // Sesuai revisi terakhir: Rp 20 per poin

        let skinContributionTotal = 0;

        const supremeContribution = skinSupreme * skinPoinValues.Supreme * pricePerSkinPoint;
        if (supremeContribution > 0) breakdown['Skin Supreme'] = supremeContribution;
        skinContributionTotal += supremeContribution;

        const grandContribution = skinGrand * skinPoinValues.Grand * pricePerSkinPoint;
        if (grandContribution > 0) breakdown['Skin Grand'] = grandContribution;
        skinContributionTotal += grandContribution;

        const exquisiteContribution = skinExquisite * skinPoinValues.Exquisite * pricePerSkinPoint;
        if (exquisiteContribution > 0) breakdown['Skin Exquisite'] = exquisiteContribution;
        skinContributionTotal += exquisiteContribution;

        const deluxeContribution = skinDeluxe * skinPoinValues.Deluxe * pricePerSkinPoint;
        if (deluxeContribution > 0) breakdown['Skin Deluxe'] = deluxeContribution;
        skinContributionTotal += deluxeContribution;

        const exceptionalContribution = skinExceptional * skinPoinValues.Exceptional * pricePerSkinPoint;
        if (exceptionalContribution > 0) breakdown['Skin Exceptional'] = exceptionalContribution;
        skinContributionTotal += exceptionalContribution;

        const commonContribution = skinCommon * skinPoinValues.Common * pricePerSkinPoint;
        if (commonContribution > 0) breakdown['Skin Common'] = commonContribution;
        skinContributionTotal += commonContribution;

        const paintedContribution = paintedSkin * skinPoinValues.Painted * pricePerSkinPoint;
        if (paintedContribution > 0) breakdown['Painted Skin'] = paintedContribution;
        skinContributionTotal += paintedContribution;

        totalPrice += skinContributionTotal;

        // Emblem
        const emblemContribution = emblemLevel60 * 25000;
        totalPrice += emblemContribution;
        breakdown['Emblem Level 60'] = emblemContribution;

        // Tier
        const tierValues = {
            'Warrior': 0, 'Elite': 0, 'Master': 0, 'Grandmaster': 0,
            'Epic': 10000, 'Legend': 50000, 'Mythic': 150000,
            'Mythical Honor': 300000, 'Mythical Glory': 1000000, 'Mythical Immortal': 2000000
        };
        const tierContribution = tierValues[tier] || 0;
        totalPrice += tierContribution;
        breakdown['Tier Saat Ini'] = tierContribution;

        // Win Rate
        let winRateBaseValue = 0;
        if (winRate >= 75) winRateBaseValue = 2000000;
        else if (winRate >= 70) winRateBaseValue = 800000;
        else if (winRate >= 65) winRateBaseValue = 300000;
        else if (winRate >= 60) winRateBaseValue = 100000;

        let matchMultiplier = 0;
        if (totalRankMatches >= 2000) matchMultiplier = 1;
        else if (totalRankMatches >= 1000) matchMultiplier = 0.5;

        let winRateContribution = winRateBaseValue * matchMultiplier;
        totalPrice += winRateContribution;
        breakdown['Win Rate Rank'] = winRateContribution;

        if (totalPrice < 0) totalPrice = 0;

        // Tampilkan Hasil
        resultPrice.textContent = formatToIDR(totalPrice);
        resultPrice.classList.remove('fade-in-result');
        void resultPrice.offsetWidth;
        resultPrice.classList.add('fade-in-result');

        let breakdownHTML = '';
        const orderedKeys = ['Harga Dasar Akun','Skin Supreme','Skin Grand','Skin Exquisite','Skin Deluxe','Skin Exceptional','Skin Common','Painted Skin','Emblem Level 60','Tier Saat Ini','Win Rate Rank'];
        orderedKeys.forEach(key => {
            if (breakdown[key] !== undefined && breakdown[key] > 0) {
                breakdownHTML += `<p><span>${key}:</span> <span>${formatToIDR(breakdown[key])}</span></p>`;
            }
        });
        priceBreakdown.innerHTML = breakdownHTML;

        if (resultSection) resultSection.scrollIntoView({ behavior: 'smooth' });
    });

    // --- Reset Button ---
    resetBtn.addEventListener('click', function() {
        document.getElementById('tier').value = 'Warrior';
        winRateInput.value = '';
        totalRankMatchesInput.value = '';
        document.getElementById('totalHeroes').value = '';
        emblemLevel60Input.value = '';
        skinInputIds.forEach(id => {
            document.getElementById(id).value = '';
            document.getElementById(id).placeholder = '0';
        });
        winRateProgressBar.style.width = '0%';
        emblemCountSpan.textContent = '0';
        resultPrice.textContent = 'Rp 0';
        priceBreakdown.innerHTML = '';
    });

    // --- Visual Form Update ---
    winRateInput.addEventListener('input', function() {
        const value = parseFloat(winRateInput.value);
        if (!isNaN(value) && value >= 0 && value <= 100) winRateProgressBar.style.width = value + '%';
        else winRateProgressBar.style.width = '0%';
    });

    emblemLevel60Input.addEventListener('input', function() {
        const value = parseInt(emblemLevel60Input.value);
        if (!isNaN(value) && value >= 0 && value <= 7) emblemCountSpan.textContent = value;
        else emblemCountSpan.textContent = '0';
    });

    // --- Feedback Form ---
    feedbackForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        feedbackMessage.textContent = 'Mengirim...';
        try {
            const response = await fetch(event.target.action, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' }});
            const data = await response.json();
            if (data.status === 'success') {
                feedbackMessage.textContent = data.message;
                event.target.reset();
                loadComments();
            }
        } catch (e) { feedbackMessage.textContent = 'Gagal!'; }
    });

    // --- Load Comments ---
    async function loadComments() {
        commentsList.innerHTML = '<p class="loading-comments">Memuat komentar...</p>';
        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL + '?action=getComments');
            const data = await response.json();
            if (data.status === 'success') displayComments(data.comments);
        } catch (e) { commentsList.innerHTML = 'Gagal memuat!'; }
    }

    // --- Display Comments (ANTI-LINK & ANTI-XSS) ---
    function displayComments(comments) {
        commentsList.innerHTML = '';
        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">Belum ada komentar.</p>';
            return;
        }
        comments.forEach(comment => {
            const commentItem = document.createElement('div');
            commentItem.classList.add('comment-item');
            
            // Sanitasi SEMUA data yang masuk biar mampus tuh bot
            const safeUsername = sanitizeComment(comment.username || 'Anonim');
            const safeTimestamp = sanitizeComment(comment.timestamp || '');
            const safeSuggestion = sanitizeComment(comment.suggestion || '');
            const safeAdminReply = sanitizeComment(comment.adminreply || '');

            commentItem.innerHTML = `
                <div class="comment-header">
                    <span class="comment-username">${safeUsername}</span>
                    <span class="comment-timestamp">${safeTimestamp}</span>
                </div>
                <div class="comment-body">${safeSuggestion}</div>
                ${safeAdminReply.trim() !== '' ? `
                <div class="admin-reply">
                    <p><strong>Balasan Admin:</strong></p>
                    <p>${safeAdminReply}</p>
                </div>` : ''}
            `;
            commentsList.appendChild(commentItem);
        });
    }

    // --- Visitor Count ---
    async function loadVisitorCount() {
        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL + '?action=getCounter');
            const data = await response.json();
            if (data.status === 'success') visitorCountSpan.textContent = data.count.toLocaleString('id-ID') + " Player";
        } catch (e) { visitorCountSpan.textContent = 'N/A'; }
    }

    refreshCommentsBtn.addEventListener('click', loadComments);
    loadComments();
    loadVisitorCount();
});
