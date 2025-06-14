// Logika JavaScript akan kita tulis di sini nanti
document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultPrice = document.getElementById('resultPrice');
    const priceBreakdown = document.getElementById('priceBreakdown');
    const winRateInput = document.getElementById('winRate');
    const winRateProgressBar = document.getElementById('winRateProgressBar');
    const emblemLevel60Input = document.getElementById('emblemLevel60');
    const emblemCountSpan = document.getElementById('emblemCount');

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
        if (isNaN(emblemLevel60) || emblemLevel60 < 0 || emblemLevel60 > 9) {
            showError('emblemLevel60', 'Jumlah Emblem Level 60 harus antara 0-9.');
            isValid = false;
        } else {
            clearError('emblemLevel60');
        }

        // Validate all skin inputs (ensure non-negative or empty)
        skinInputIds.forEach(id => {
            const inputElement = document.getElementById(id);
            const value = parseInt(inputElement.value);
            if (isNaN(value) && inputElement.value !== '') { // If not a number AND not empty string
                 // This case should ideally be prevented by input type="number" but for robustness
                 showError(id, 'Masukkan angka yang valid.'); // Add error specific to skin inputs
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
            priceBreakdown.innerHTML = ''; // Clear breakdown
            return; // Stop calculation if inputs are invalid
        }

        let totalPrice = 0;
        let breakdown = {}; // Object to store breakdown values

        // --- 1. Harga Dasar Akun ---
        const basePrice = 50000;
        totalPrice += basePrice;
        breakdown['Harga Dasar Akun'] = basePrice;

        // --- 2. Ambil Input dari Formulir ---
        const tier = document.getElementById('tier').value;
        const winRate = parseFloat(winRateInput.value) || 0;
        const totalHeroes = parseInt(document.getElementById('totalHeroes').value) || 0;
        const emblemLevel60 = parseInt(emblemLevel60Input.value) || 0;

        // Skin Quantities (use || 0 to treat empty string/NaN as 0 for calculation)
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
        const pricePerSkinPoint = 25;

        let skinContribution = 0;
        skinContribution += skinSupreme * skinPoinValues.Supreme * pricePerSkinPoint;
        skinContribution += skinGrand * skinPoinValues.Grand * pricePerSkinPoint;
        skinContribution += skinExquisite * skinPoinValues.Exquisite * pricePerSkinPoint;
        skinContribution += skinDeluxe * skinPoinValues.Deluxe * pricePerSkinPoint;
        skinContribution += skinExceptional * skinPoinValues.Exceptional * pricePerSkinPoint;
        skinContribution += skinCommon * skinPoinValues.Common * pricePerSkinPoint;
        skinContribution += skinPainted * skinPoinValues.Painted * pricePerSkinPoint;
        totalPrice += skinContribution;
        breakdown['Koleksi Skin'] = skinContribution;

        // B. Emblem Level 60
        const emblemContribution = emblemLevel60 * 100000;
        totalPrice += emblemContribution;
        breakdown['Emblem Level 60'] = emblemContribution;

        // C. Jumlah Hero
        const heroContribution = totalHeroes * 8000;
        totalPrice += heroContribution;
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

        // E. Win Rate Global
        let winRateContribution = 0;
        if (winRate >= 75) {
            winRateContribution = 900000;
        } else if (winRate >= 70) {
            winRateContribution = 500000;
        } else if (winRate >= 65) {
            winRateContribution = 300000;
        } else if (winRate >= 60) {
            winRateContribution = 180000;
        } else if (winRate >= 55) {
            winRateContribution = 90000;
        } else if (winRate >= 50) {
            winRateContribution = 40000;
        }
        totalPrice += winRateContribution;
        breakdown['Win Rate Global'] = winRateContribution;


        // Pastikan harga tidak minus
        if (totalPrice < 0) {
            totalPrice = 0;
        }

        // --- 4. Tampilkan Hasil ---
        resultPrice.textContent = formatToIDR(totalPrice);
        resultPrice.classList.remove('fade-in-result'); // Reset animation
        void resultPrice.offsetWidth; // Trigger reflow
        resultPrice.classList.add('fade-in-result'); // Apply animation

        // Display Breakdown
        let breakdownHTML = '';
        const orderedBreakdownKeys = [
            'Harga Dasar Akun', 'Koleksi Skin', 'Emblem Level 60',
            'Jumlah Hero', 'Tier Saat Ini', 'Win Rate Global'
        ];

        orderedBreakdownKeys.forEach(key => {
            if (breakdown[key] !== undefined && (breakdown[key] > 0 || key === 'Harga Dasar Akun')) {
                breakdownHTML += `<p><span>${key}:</span> <span>${formatToIDR(breakdown[key])}</span></p>`;
            }
        });
        priceBreakdown.innerHTML = breakdownHTML;
    });

    // Reset Button Functionality
    resetBtn.addEventListener('click', function() {
        // Reset basic info inputs
        document.getElementById('tier').value = 'Warrior';
        winRateInput.value = ''; // Set to empty string
        document.getElementById('totalHeroes').value = ''; // Set to empty string
        emblemLevel60Input.value = ''; // Set to empty string

        // Reset skin inputs to empty string and set placeholder
        skinInputIds.forEach(id => {
            const inputElement = document.getElementById(id);
            inputElement.value = ''; // Set to empty string
            inputElement.placeholder = '0'; // Add placeholder
        });

        // Clear errors
        clearError('winRate');
        clearError('totalHeroes');
        clearError('emblemLevel60');
        skinInputIds.forEach(id => clearError(id)); // Clear errors for skin inputs

        // Reset progress bar and emblem count text
        winRateProgressBar.style.width = '0%';
        emblemCountSpan.textContent = '0';

        // Reset result display
        resultPrice.textContent = 'Rp 0';
        priceBreakdown.innerHTML = '';
    });

    // Event listener for Win Rate input to update progress bar and clear error
    winRateInput.addEventListener('input', function() {
        const value = parseFloat(winRateInput.value);
        if (!isNaN(value) && value >= 0 && value <= 100) {
            winRateProgressBar.style.width = value + '%';
            clearError('winRate');
        } else {
            winRateProgressBar.style.width = '0%';
            // showError('winRate', 'Win Rate harus antara 0-100%.'); // Re-add error if typing invalid
        }
    });

    // Event listener for Emblem Level 60 input to update text and clear error
    emblemLevel60Input.addEventListener('input', function() {
        const value = parseInt(emblemLevel60Input.value);
        if (!isNaN(value) && value >= 0 && value <= 9) {
            emblemCountSpan.textContent = value;
            clearError('emblemLevel60');
        } else {
            emblemCountSpan.textContent = '0';
            // showError('emblemLevel60', 'Jumlah Emblem Level 60 harus antara 0-9.'); // Re-add error if typing invalid
        }
    });

    // Clear error messages when input changes for other fields
    document.getElementById('totalHeroes').addEventListener('input', () => clearError('totalHeroes'));

    // Initialize skin inputs to empty and set placeholder on load
    skinInputIds.forEach(id => {
        const inputElement = document.getElementById(id);
        inputElement.value = ''; // Ensure it's empty
        inputElement.placeholder = '0'; // Set placeholder
        
        // Add blur listener to handle empty/negative inputs
        inputElement.addEventListener('blur', () => {
            if (inputElement.value === '' || isNaN(parseInt(inputElement.value))) {
                // If left empty or invalid, keep it empty visually but set placeholder
                inputElement.value = '';
                inputElement.placeholder = '0';
                clearError(id); // Clear error on blur if it's now empty/valid
            } else if (parseInt(inputElement.value) < 0) {
                 inputElement.value = 0; // Still prevent negative values visually
                 inputElement.placeholder = ''; // Clear placeholder if 0 is set
                 clearError(id);
            }
        });
        // Clear placeholder on focus
        inputElement.addEventListener('focus', () => {
            inputElement.placeholder = '';
        });
        // Clear error on input for skin fields
        inputElement.addEventListener('input', () => clearError(id));
    });

    // Trigger initial input events to set progress bar and emblem count text on load
    winRateInput.dispatchEvent(new Event('input'));
    emblemLevel60Input.dispatchEvent(new Event('input'));
});