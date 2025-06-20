document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultPrice = document.getElementById('resultPrice');
    const priceBreakdown = document.getElementById('priceBreakdown');
    const winRateInput = document.getElementById('winRate');
    const winRateProgressBar = document.getElementById('winRateProgressBar');
    const emblemLevel60Input = document.getElementById('emblemLevel60');
    const emblemCountSpan = document.getElementById('emblemCount');
    const resultSection = document.querySelector('.result-section');

    // Feedback Form elements
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const feedbackUsernameInput = document.getElementById('feedbackUsername');
    const feedbackSuggestionInput = document.getElementById('feedbackSuggestion');

    // Comments display elements
    const commentsList = document.getElementById('commentsList');
    const refreshCommentsBtn = document.getElementById('refreshCommentsBtn');
    // Ambil Web App URL dari form action untuk GET request
    const GOOGLE_APPS_SCRIPT_URL = feedbackForm.action; // URL yang sama untuk POST dan GET


    // Array of skin input IDs
    const skinInputIds = ['skinSupreme', 'skinGrand', 'skinExquisite', 'skinDeluxe', 'skinExceptional', 'skinCommon', 'skinPainted'];

    // Function to format number to IDR
    function formatToIDR(amount) {
        return 'Rp ' + amount.toLocaleString('id-ID');
    }

    // Function to show/hide error messages
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

    // Function to validate all inputs
    function validateInputs() {
        let isValid = true;

        // Validate Win Rate
        const winRate = parseFloat(winRateInput.value);
        if (isNaN(winRate) || winRate < 0 || winRate > 100) {
            showError('winRate', 'Win Rate harus antara 0-100%.');
            isValid = false;
        } else {
            clearError('winRate');
        }

        // Validate Total Heroes
        const totalHeroesInput = document.getElementById('totalHeroes');
        const totalHeroes = parseInt(totalHeroesInput.value);
        if (isNaN(totalHeroes) || totalHeroes < 0) {
            showError('totalHeroes', 'Jumlah Hero harus angka positif.');
            isValid = false;
        } else {
            clearError('totalHeroes');
        }

        // Validate Emblem Level 60
        const emblemLevel60 = parseInt(emblemLevel60Input.value);
        if (isNaN(emblemLevel60) || emblemLevel60 < 0 || emblemLevel60 > 7) {
            showError('emblemLevel60', 'Jumlah Emblem Level 60 harus antara 0-7.');
            isValid = false;
        } else {
            clearError('emblemLevel60');
        }

        // Validate all skin inputs (ensure non-negative or empty)
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


    calculateBtn.addEventListener('click', function() {
        if (!validateInputs()) {
            resultPrice.textContent = 'Rp 0';
            priceBreakdown.innerHTML = '';
            return;
        }

        let totalPrice = 0;
        let breakdown = {};

        // --- 1. Harga Dasar Akun ---
        const basePrice = 50000;
        totalPrice += basePrice;
        breakdown['Harga Dasar Akun'] = basePrice;

        // --- 2. Ambil Input dari Formulir ---
        const tier = document.getElementById('tier').value;
        const winRate = parseFloat(winRateInput.value) || 0;
        const emblemLevel60 = parseInt(emblemLevel60Input.value) || 0;

        // Skin Quantities
        const skinSupreme = parseInt(document.getElementById('skinSupreme').value) || 0;
        const skinGrand = parseInt(document.getElementById('skinGrand').value) || 0;
        const skinExquisite = parseInt(document.getElementById('skinExquisite').value) || 0;
        const skinDeluxe = parseInt(document.getElementById('skinDeluxe').value) || 0;
        const skinExceptional = parseInt(document.getElementById('skinExceptional').value) || 0;
        const skinCommon = parseInt(document.getElementById('skinCommon').value) || 0;
        const skinPainted = parseInt(document.getElementById('skinPainted').value) || 0;


        // --- 3. Perhitungan Berdasarkan Bobot/Nilai ---

        // A. Skin (Poin Koleksi)
        const skinPoinValues = {
            'Supreme': 4000, 'Grand': 3000, 'Exquisite': 2000, 'Deluxe': 400,
            'Exceptional': 200, 'Common': 100, 'Painted': 40
        };
        const pricePerSkinPoint = 38;

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

        const paintedContribution = skinPainted * skinPoinValues.Painted * pricePerSkinPoint;
        if (paintedContribution > 0) breakdown['Painted Skin'] = paintedContribution;
        skinContributionTotal += paintedContribution;

        totalPrice += skinContributionTotal;


        // B. Emblem Level 60
        const emblemContribution = emblemLevel60 * 25000;
        totalPrice += emblemContribution;
        breakdown['Emblem Level 60'] = emblemContribution;

        // C. Jumlah Hero (tetap 0)
        const heroContribution = 0;
        breakdown['Jumlah Hero'] = heroContribution;

        // D. Tier Saat Ini
        const tierValues = {
            'Warrior': 0, 'Elite': 0, 'Master': 0, 'Grandmaster': 20000,
            'Epic': 50000, 'Legend': 100000, 'Mythic': 200000,
            'Mythical Honor': 400000, 'Mythical Glory': 750000, 'Mythical Immortal': 1250000
        };
        const tierContribution = tierValues[tier] || 0;
        totalPrice += tierContribution;
        breakdown['Tier Saat Ini'] = tierContribution;

        // E. Win Rate Rank
        let winRateContribution = 0;
        if (winRate >= 75) {
            winRateContribution = 1800000;
        } else if (winRate >= 70) {
            winRateContribution = 1200000;
        } else if (winRate >= 65) {
            winRateContribution = 800000;
        } else if (winRate >= 60) {
            winRateContribution = 500000;
        } else if (winRate >= 55) {
            winRateContribution = 250000;
        } else if (winRate >= 50) {
            winRateContribution = 100000;
        }
        totalPrice += winRateContribution;
        breakdown['Win Rate Rank'] = winRateContribution;


        // Pastikan harga tidak minus
        if (totalPrice < 0) {
            totalPrice = 0;
        }

        // --- 4. Tampilkan Hasil ---
        resultPrice.textContent = formatToIDR(totalPrice);
        resultPrice.classList.remove('fade-in-result');
        void resultPrice.offsetWidth;
        resultPrice.classList.add('fade-in-result');

        // Display Breakdown
        let breakdownHTML = '';
        const orderedBreakdownKeys = [
            'Harga Dasar Akun',
            'Skin Supreme', 'Skin Grand', 'Skin Exquisite', 'Skin Deluxe',
            'Skin Exceptional', 'Skin Common', 'Painted Skin',
            'Emblem Level 60',
            'Jumlah Hero',
            'Tier Saat Ini',
            'Win Rate Rank'
        ];

        orderedBreakdownKeys.forEach(key => {
            if (breakdown[key] !== undefined && (breakdown[key] > 0 || (key === 'Harga Dasar Akun' && breakdown[key] > 0))) {
                breakdownHTML += `<p><span>${key}:</span> <span>${formatToIDR(breakdown[key])}</span></p>`;
            }
        });
        priceBreakdown.innerHTML = breakdownHTML;

        // --- Fitur Auto-Scroll ke Hasil ---
        if (resultSection) {
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // Reset Button Functionality
    resetBtn.addEventListener('click', function() {
        document.getElementById('tier').value = 'Warrior';
        winRateInput.value = '';
        document.getElementById('totalHeroes').value = '';
        emblemLevel60Input.value = '';

        skinInputIds.forEach(id => {
            const inputElement = document.getElementById(id);
            inputElement.value = '';
            inputElement.placeholder = '0';
        });

        clearError('winRate');
        clearError('totalHeroes');
        clearError('emblemLevel60');
        skinInputIds.forEach(id => clearError(id));

        winRateProgressBar.style.width = '0%';
        emblemCountSpan.textContent = '0';

        resultPrice.textContent = 'Rp 0';
        priceBreakdown.innerHTML = '';
    });

    // Event listeners for visual updates and error clearing on input
    winRateInput.addEventListener('input', function() {
        const value = parseFloat(winRateInput.value);
        if (!isNaN(value) && value >= 0 && value <= 100) {
            winRateProgressBar.style.width = value + '%';
            clearError('winRate');
        } else {
            winRateProgressBar.style.width = '0%';
        }
    });

    emblemLevel60Input.addEventListener('input', function() {
        const value = parseInt(emblemLevel60Input.value);
        if (!isNaN(value) && value >= 0 && value <= 7) {
            emblemCountSpan.textContent = value;
            clearError('emblemLevel60');
        } else {
            emblemCountSpan.textContent = '0';
        }
    });

    document.getElementById('totalHeroes').addEventListener('input', () => clearError('totalHeroes'));

    // Handle skin inputs: empty value, placeholder, and blur behavior
    skinInputIds.forEach(id => {
        const inputElement = document.getElementById(id);
        inputElement.value = '';
        inputElement.placeholder = '0';

        inputElement.addEventListener('blur', () => {
            if (inputElement.value === '' || isNaN(parseInt(inputElement.value))) {
                inputElement.value = '';
                inputElement.placeholder = '0';
                clearError(id);
            } else if (parseInt(inputElement.value) < 0) {
                 inputElement.value = 0;
                 inputElement.placeholder = '';
                 clearError(id);
            }
        });
        inputElement.addEventListener('focus', () => {
            inputElement.placeholder = '';
        });
        inputElement.addEventListener('input', () => clearError(id));
    });

    // Initialize progress bar and emblem count text on load
    winRateInput.dispatchEvent(new Event('input'));
    emblemLevel60Input.dispatchEvent(new Event('input'));


    // --- Feedback Form Submission Handling ---
    feedbackForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission (page reload)

        const form = event.target;
        const formData = new FormData(form);

        feedbackMessage.textContent = 'Mengirim masukan...';
        feedbackMessage.style.color = '#a0c4ff'; // Light blue for sending status

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: {
                    'Accept': 'application/json' // Crucial for Formspree/Apps Script to return JSON
                }
            });

            if (response.ok) {
                const data = await response.json(); // Apps Script returns JSON
                if (data.status === 'success') {
                    feedbackMessage.textContent = data.message; // Use message from Apps Script
                    feedbackMessage.style.color = '#4CAF50'; // Green for success
                    form.reset(); // Clear the form fields
                    loadComments(); // Refresh comments after successful submission
                } else {
                    feedbackMessage.textContent = data.message || 'Gagal mengirim masukan. Silakan coba lagi.';
                    feedbackMessage.style.color = '#ff6b6b'; // Red for error
                }
            } else {
                feedbackMessage.textContent = 'Gagal mengirim masukan. Status: ' + response.status;
                feedbackMessage.style.color = '#ff6b6b';
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            feedbackMessage.textContent = 'Terjadi kesalahan jaringan. Silakan coba lagi.';
            feedbackMessage.style.color = '#ff6b6b';
        }
    });


    // --- Function to Load and Display Comments ---
    async function loadComments() {
        commentsList.innerHTML = '<p class="loading-comments">Memuat komentar...</p>'; // Show loading state

        try {
            // Menggunakan method GET untuk mengambil data komentar
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.comments) {
                    displayComments(data.comments);
                } else {
                    commentsList.innerHTML = '<p class="no-comments">Gagal memuat komentar. ' + (data.message || '') + '</p>';
                }
            } else {
                commentsList.innerHTML = '<p class="no-comments">Gagal memuat komentar. (Status: ' + response.status + ')</p>';
            }
        } catch (error) {
            console.error('Error loading comments:', error);
            commentsList.innerHTML = '<p class="no-comments">Terjadi kesalahan jaringan saat memuat komentar. Silakan coba refresh.</p>';
        }
    }

    // Function to render comments to the DOM
    function displayComments(comments) {
        commentsList.innerHTML = ''; // Clear previous comments

        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">Belum ada komentar atau saran.</p>';
            return;
        }

        comments.forEach(comment => {
            const commentItem = document.createElement('div');
            commentItem.classList.add('comment-item');

            commentItem.innerHTML = `
                <div class="comment-header">
                    <span class="comment-username">${comment.username || 'Anonim'}</span>
                    <span class="comment-timestamp">${comment.timestamp || ''}</span>
                </div>
                <div class="comment-body">
                    ${comment.suggestion || ''}
                </div>
            `;
            commentsList.appendChild(commentItem);
        });
    }

    // --- Event Listeners for Comments Section ---
    refreshCommentsBtn.addEventListener('click', loadComments); // Refresh button calls loadComments

    // Load comments when the page first loads
    loadComments();
});