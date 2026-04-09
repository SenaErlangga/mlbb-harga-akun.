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
    const GOOGLE_APPS_SCRIPT_URL = feedbackForm.action; 

    // --- Elemen Tampilan Komentar ---
    const commentsList = document.getElementById('commentsList');
    const refreshCommentsBtn = document.getElementById('refreshCommentsBtn');

    // --- Elemen Counter Pengunjung ---
    const visitorCountSpan = document.getElementById('visitorCount');

    // --- Konfigurasi Input Skin (Termasuk Kasta Skin Ghoib/Unobtainable) ---
    const itemInputIds = [
        'skinRareLim', 'skinLegendLim', 'skinLegend', 'skinGrand', 'skinExquisite', 
        'skinDeluxe', 'recallEffect', 'borderLimited'
    ];

    // ==========================================
    // SUPER SECURITY V2.0: Anti-XSS, Blokir Link & Sensor Kata Kasar
    // ==========================================
    function sanitizeComment(str) {
        if (typeof str !== 'string') return '';
        
        // 1. Blokir Link / URL
        let safeText = str.replace(/(?:https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9.-]+\.(?:com|net|org|info|xyz|biz|id|co|me|vip|slot|88|fun|top)[^\s]*/ig, '[🛡️ Link Blocked]');
        
        // 2. Blokir Script XSS
        safeText = safeText.replace(/[&<>'"]/g, function(tag) {
            const charsToReplace = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
            return charsToReplace[tag] || tag;
        });

        // 3. Sensor Kata Kasar (Pake Word Boundary biar kaga salah sensor)
        const badWords = [
            'anjing', 'babi', 'monyet', 'asu', 'kontol', 'memek', 'jembut', 'bangsat', 
            'tolol', 'goblok', 'goblog', 'ngentot', 'peler', 'bajingan', 'pantek', 
            'bngst', 'anj', 'njing', 'bgst', 'kntl', 'mmk', 'pepek', 'kimak', 'kampret'
        ];
        
        const badWordsRegex = new RegExp('\\b(' + badWords.join('|') + ')\\b', 'gi');
        safeText = safeText.replace(badWordsRegex, '***');

        return safeText;
    }

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

    // --- Validasi Input Form ---
    function validateInputs() {
        let isValid = true;

        const winRate = parseFloat(winRateInput.value);
        if (isNaN(winRate) || winRate < 0 || winRate > 100) {
            showError('winRate', 'Win Rate harus antara 0-100%.');
            isValid = false;
        } else { clearError('winRate'); }

        const totalRankMatches = parseInt(totalRankMatchesInput.value);
        if (isNaN(totalRankMatches) || totalRankMatches < 0) {
            showError('totalRankMatches', 'Total Ranked Matches harus angka positif.');
            isValid = false;
        } else { clearError('totalRankMatches'); }

        const emblemLevel60 = parseInt(emblemLevel60Input.value);
        if (isNaN(emblemLevel60) || emblemLevel60 < 0 || emblemLevel60 > 7) {
            showError('emblemLevel60', 'Jumlah Emblem Level 60 harus antara 0-7.');
            isValid = false;
        } else { clearError('emblemLevel60'); }

        itemInputIds.forEach(id => {
            const inputElement = document.getElementById(id);
            if(inputElement) {
                const value = parseInt(inputElement.value);
                if (isNaN(value) && inputElement.value !== '') {
                     showError(id, 'Masukkan angka yang valid.');
                     isValid = false;
                } else if (value < 0) {
                    showError(id, 'Angka tidak boleh negatif.');
                    isValid = false;
                } else { clearError(id); }
            }
        });

        return isValid;
    }

    // --- Fungsi Perhitungan Harga Akun V2.0 FINAL ---
    calculateBtn.addEventListener('click', function() {
        if (!validateInputs()) {
            resultPrice.textContent = 'Rp 0';
            priceBreakdown.innerHTML = '';
            return;
        }

        let totalPrice = 0;
        let breakdown = {};

        // 1. Harga Dasar Akun (Polosan 0 Rupiah)
        const basePrice = 0; 
        totalPrice += basePrice;

        // 2. Ambil Input Data Dasar
        const tier = document.getElementById('tier').value;
        const highestTier = document.getElementById('highestTier') ? document.getElementById('highestTier').value : 'Dibawah Glory';
        const winRate = parseFloat(winRateInput.value) || 0;
        const totalRankMatches = parseInt(totalRankMatchesInput.value) || 0;
        const emblemLevel60 = parseInt(emblemLevel60Input.value) || 0;

        // 3. Ambil Input Kasta Skin (Termasuk Unobtainable)
        const skinRareLim = parseInt(document.getElementById('skinRareLim') ? document.getElementById('skinRareLim').value : 0) || 0;
        const skinLegendLim = parseInt(document.getElementById('skinLegendLim') ? document.getElementById('skinLegendLim').value : 0) || 0;
        const skinLegend = parseInt(document.getElementById('skinLegend') ? document.getElementById('skinLegend').value : 0) || 0;
        const skinGrand = parseInt(document.getElementById('skinGrand') ? document.getElementById('skinGrand').value : 0) || 0;
        const skinExquisite = parseInt(document.getElementById('skinExquisite') ? document.getElementById('skinExquisite').value : 0) || 0;
        const skinDeluxe = parseInt(document.getElementById('skinDeluxe') ? document.getElementById('skinDeluxe').value : 0) || 0;
        const recallEffect = parseInt(document.getElementById('recallEffect') ? document.getElementById('recallEffect').value : 0) || 0;
        const borderLimited = parseInt(document.getElementById('borderLimited') ? document.getElementById('borderLimited').value : 0) || 0;

        // 4. Perhitungan Emblem (Rp 5.000 per emblem max)
        const emblemContribution = emblemLevel60 * 5000;
        if (emblemContribution > 0) {
            totalPrice += emblemContribution;
            breakdown['Emblem Maksimal (Level 60)'] = emblemContribution;
        }

        // 5. Perhitungan Tier Saat Ini
        const tierValues = {
            'Warrior': 0, 'Mythic': 10000, 'Mythical Honor': 20000, 
            'Mythical Glory': 30000, 'Mythical Immortal': 50000
        };
        const tierContribution = tierValues[tier] || 0;
        if (tierContribution > 0) {
            totalPrice += tierContribution;
            breakdown['Rank Saat Ini (' + tier + ')'] = tierContribution;
        }

        // 6. Perhitungan Highest Rank
        const highestTierValues = {
            'Dibawah Glory': 0, 'Glory Biasa': 30000, 
            'Immortal Biasa': 100000, 'Immortal Dewa': 200000
        };
        const highestTierContribution = highestTierValues[highestTier] || 0;
        if (highestTierContribution > 0) {
            totalPrice += highestTierContribution;
            
            let highestTierName = highestTier;
            if (highestTier === 'Glory Biasa') highestTierName = 'Mythical Glory';
            else if (highestTier === 'Immortal Biasa') highestTierName = 'Mythical Immortal (< 100 Bintang)';
            else if (highestTier === 'Immortal Dewa') highestTierName = 'Mythical Immortal (> 100 Bintang)';
            
            breakdown['Rank Tertinggi (' + highestTierName + ')'] = highestTierContribution;
        }

        // 7. Perhitungan Skin & Item
        const rareLimPrice = skinRareLim * 1500000;
        if (rareLimPrice > 0) breakdown['Kasta Kolektor Eksklusif (Unobtainable)'] = rareLimPrice;

        const legendLimPrice = skinLegendLim * 350000; // REVISI: Turun jadi 350k
        if (legendLimPrice > 0) breakdown['Kasta Supreme Limit (Event)'] = legendLimPrice;

        const legendPrice = skinLegend * 200000;
        if (legendPrice > 0) breakdown['Kasta Supreme Biasa (Magic Wheel)'] = legendPrice;

        const grandPrice = skinGrand * 80000; // REVISI: Turun
        if (grandPrice > 0) breakdown['Kasta Grand (3000 Poin)'] = grandPrice;

        const exqPrice = skinExquisite * 30000; // REVISI: Turun
        if (exqPrice > 0) breakdown['Kasta Exquisite (2000 Poin)'] = exqPrice;

        const deluxePrice = skinDeluxe * 5000; // REVISI: Turun 
        if (deluxePrice > 0) breakdown['Kasta Deluxe (400 Poin)'] = deluxePrice;

        const recallPrice = recallEffect * 20000;
        if (recallPrice > 0) breakdown['Efek Recall Limited'] = recallPrice;

        const borderPrice = borderLimited * 20000;
        if (borderPrice > 0) breakdown['Avatar Border Limited'] = borderPrice;

        const skinTotal = (rareLimPrice + legendLimPrice + legendPrice + grandPrice + exqPrice + deluxePrice + recallPrice + borderPrice);
        totalPrice += skinTotal;

        // 8. Auto-Detect Bonus Akun WR Dewa
        if (winRate >= 70 && totalRankMatches >= 5000) {
            const wrDewaBonus = 150000; 
            totalPrice += wrDewaBonus;
            breakdown['Bonus Valuasi: Akun Pro (>70% WR)'] = wrDewaBonus;
        }

        if (totalPrice < 0) totalPrice = 0;

        // Tampilkan Hasil
        resultPrice.textContent = formatToIDR(totalPrice);
        resultPrice.classList.remove('fade-in-result');
        void resultPrice.offsetWidth; 
        resultPrice.classList.add('fade-in-result');

        // Render Breakdown
        let breakdownHTML = '';
        for (let key in breakdown) {
            if (breakdown[key] > 0) {
                breakdownHTML += `<p><span>${key}:</span> <span>${formatToIDR(breakdown[key])}</span></p>`;
            }
        }
        priceBreakdown.innerHTML = breakdownHTML;

        if (resultSection) resultSection.scrollIntoView({ behavior: 'smooth' });
    });

    // --- Reset Button ---
    resetBtn.addEventListener('click', function() {
        document.getElementById('tier').value = 'Warrior';
        if(document.getElementById('highestTier')) {
            document.getElementById('highestTier').value = 'Dibawah Glory';
        }
        winRateInput.value = '';
        totalRankMatchesInput.value = '';
        emblemLevel60Input.value = '';
        
        itemInputIds.forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.value = '';
                el.placeholder = '0';
            }
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

        // --- VARIABEL GLOBAL BUAT PAGINATION ---
    let allComments = [];
    let currentPage = 1;
    const commentsPerPage = 5; // Lu bisa ganti jadi 10 kalo mau nampilin 10 komen per halaman

    // --- Load & Fetch Comments ---
    async function loadComments() {
        commentsList.innerHTML = '<p class="loading-comments">Memuat komentar...</p>';
        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL + '?action=getComments');
            const data = await response.json();
            if (data.status === 'success') {
                // BALIK URUTAN: Biar komentar terbaru (paling bawah di Google Sheet) naik ke atas
                allComments = data.comments.reverse(); 
                currentPage = 1; // Reset selalu ke halaman 1
                displayComments();
            }
        } catch (e) { commentsList.innerHTML = 'Gagal memuat!'; }
    }

    // --- Render Comments per Page ---
    function displayComments() {
        commentsList.innerHTML = '';
        if (allComments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">Belum ada komentar.</p>';
            return;
        }

        // Rumus Matematika Halaman
        const startIndex = (currentPage - 1) * commentsPerPage;
        const endIndex = startIndex + commentsPerPage;
        const paginatedComments = allComments.slice(startIndex, endIndex);

        // Nampilin cuma komentar di halaman saat ini
        paginatedComments.forEach(comment => {
            const commentItem = document.createElement('div');
            commentItem.classList.add('comment-item');
            
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

        // Panggil fungsi render tombol Next/Prev
        renderPaginationControls();
    }

    // --- Tombol Navigasi Halaman (Next / Prev) ---
    function renderPaginationControls() {
        const totalPages = Math.ceil(allComments.length / commentsPerPage);

        // Bersihin tombol lama kalau udah ada
        const oldControls = document.getElementById('paginationControls');
        if (oldControls) oldControls.remove();

        if (totalPages <= 1) return; // Kaga usah ada tombol kalau komen dikit

        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'paginationControls';
        controlsDiv.style.display = 'flex';
        controlsDiv.style.justifyContent = 'center';
        controlsDiv.style.alignItems = 'center';
        controlsDiv.style.gap = '15px';
        controlsDiv.style.marginTop = '20px';

        // Tombol Sebelumnya
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '« Prev';
        prevBtn.style.padding = '8px 15px';
        prevBtn.style.background = currentPage === 1 ? '#334155' : '#38bdf8';
        prevBtn.style.color = currentPage === 1 ? '#94a3b8' : '#0f172a';
        prevBtn.style.border = 'none';
        prevBtn.style.borderRadius = '5px';
        prevBtn.style.fontWeight = 'bold';
        prevBtn.style.cursor = currentPage === 1 ? 'not-allowed' : 'pointer';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; displayComments(); } };

        // Tulisan Halaman
        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Hal ${currentPage} / ${totalPages}`;
        pageInfo.style.color = '#cbd5e1';
        pageInfo.style.fontSize = '0.9em';
        pageInfo.style.fontWeight = 'bold';

        // Tombol Selanjutnya
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = 'Next »';
        nextBtn.style.padding = '8px 15px';
        nextBtn.style.background = currentPage === totalPages ? '#334155' : '#38bdf8';
        nextBtn.style.color = currentPage === totalPages ? '#94a3b8' : '#0f172a';
        nextBtn.style.border = 'none';
        nextBtn.style.borderRadius = '5px';
        nextBtn.style.fontWeight = 'bold';
        nextBtn.style.cursor = currentPage === totalPages ? 'not-allowed' : 'pointer';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; displayComments(); } };

        controlsDiv.appendChild(prevBtn);
        controlsDiv.appendChild(pageInfo);
        controlsDiv.appendChild(nextBtn);

        // Taruh tombol-tombol ini pas di bawah daftar komentar
        commentsList.parentNode.insertBefore(controlsDiv, commentsList.nextSibling);
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