// DOM Elements
const donationTypeRadios = document.querySelectorAll('input[name="donationType"]');
const childInfoSection = document.getElementById('childInfo');
const childNameInput = document.getElementById('childName');
const childCodeInput = document.getElementById('childCode');
const generateQRBtn = document.getElementById('generateQR');
const qrSection = document.getElementById('qrSection');
const qrCanvas = document.getElementById('qrCanvas');
const modalOverlay = document.getElementById('modalOverlay');
const modalMessage = document.getElementById('modalMessage');
const modalClose = document.getElementById('modalClose');
const modalOK = document.getElementById('modalOK');

// Account information
const ACCOUNT_INFO = {
    holder: 'Cặp lá yêu thương',
    number: '1000001001242424',
    bank: 'VBSP'
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateChildInfoVisibility();
});

// Event listeners
function initializeEventListeners() {
    // Radio button change event
    donationTypeRadios.forEach(radio => {
        radio.addEventListener('change', handleDonationTypeChange);
    });

    // Generate QR button click
    generateQRBtn.addEventListener('click', handleGenerateQR);

    // Modal close events
    modalClose.addEventListener('click', hideModal);
    modalOK.addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            hideModal();
        }
    });

    // ESC key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.style.display !== 'none') {
            hideModal();
        }
    });

    // Input validation for child info
    childNameInput.addEventListener('input', validateChildInfo);
    childCodeInput.addEventListener('input', validateChildInfo);
}

// Handle donation type change
function handleDonationTypeChange() {
    updateChildInfoVisibility();
    hideQRSection();
    updateGenerateButton();
}

// Update child info section visibility
function updateChildInfoVisibility() {
    const selectedType = document.querySelector('input[name="donationType"]:checked').value;
    
    if (selectedType === 'specific') {
        childInfoSection.style.display = 'block';
        childInfoSection.classList.add('show');
    } else {
        childInfoSection.style.display = 'none';
        childInfoSection.classList.remove('show');
        // Clear child info when hiding
        childNameInput.value = '';
        childCodeInput.value = '';
    }
}

// Validate child info inputs
function validateChildInfo() {
    const name = childNameInput.value.trim();
    const code = childCodeInput.value.trim();
    const selectedType = document.querySelector('input[name="donationType"]:checked').value;
    
    if (selectedType === 'specific') {
        const isValid = name !== '' && code !== '';
        updateGenerateButton(isValid);
        
        // Visual feedback for inputs
        toggleInputValidation(childNameInput, name !== '');
        toggleInputValidation(childCodeInput, code !== '');
    }
}

// Toggle input validation styling
function toggleInputValidation(input, isValid) {
    if (isValid) {
        input.style.borderColor = '#22c55e';
        input.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
    } else {
        input.style.borderColor = '#ef4444';
        input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    }
}

// Update generate button state
function updateGenerateButton(isValid = true) {
    const selectedType = document.querySelector('input[name="donationType"]:checked').value;
    
    if (selectedType === 'specific') {
        const name = childNameInput.value.trim();
        const code = childCodeInput.value.trim();
        isValid = name !== '' && code !== '';
    }
    
    generateQRBtn.disabled = !isValid;
    generateQRBtn.style.opacity = isValid ? '1' : '0.6';
    generateQRBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
}

// Handle generate QR code
function handleGenerateQR() {
    const selectedType = document.querySelector('input[name="donationType"]:checked').value;
    
    if (selectedType === 'specific') {
        const name = childNameInput.value.trim();
        const code = childCodeInput.value.trim();
        
        if (!name || !code) {
            showModal('Vui lòng nhập đầy đủ thông tin tên bé và mã số LCL để tiếp tục.');
            return;
        }
    }
    
    generateQRCode();
}

// Generate QR code
function generateQRCode() {
    const selectedType = document.querySelector('input[name="donationType"]:checked').value;
    let transferContent = '';
    
    if (selectedType === 'general') {
        transferContent = 'Ung ho CLYT';
    } else {
        const name = childNameInput.value.trim();
        const code = childCodeInput.value.trim();
        transferContent = `${name} - ${code}`;
    }
    
    // Banking QR format for Vietnam
    const bankingInfo = {
        bank: ACCOUNT_INFO.bank,
        account: ACCOUNT_INFO.number,
        holder: ACCOUNT_INFO.holder,
        content: transferContent
    };
    
    // Create QR content (simplified format for Vietnamese banking)
    const qrContent = `Bank: ${bankingInfo.bank}\nAccount: ${bankingInfo.account}\nHolder: ${bankingInfo.holder}\nContent: ${bankingInfo.content}`;
    
    try {
        // Clear previous QR code
        const ctx = qrCanvas.getContext('2d');
        ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
        
        // Generate QR code
        QRCode.toCanvas(qrCanvas, qrContent, {
            width: 200,
            height: 200,
            margin: 2,
            color: {
                dark: '#15803d',
                light: '#ffffff'
            },
            errorCorrectionLevel: 'M'
        }, function(error) {
            if (error) {
                console.error('QR Code generation error:', error);
                showModal('Có lỗi xảy ra khi tạo mã QR. Vui lòng thử lại.');
            } else {
                showQRSection();
                scrollToQR();
            }
        });
        
    } catch (error) {
        console.error('QR Code generation error:', error);
        showModal('Có lỗi xảy ra khi tạo mã QR. Vui lòng thử lại.');
    }
}

// Show QR section
function showQRSection() {
    qrSection.style.display = 'block';
    qrSection.classList.add('show');
    
    // Add animation
    setTimeout(() => {
        qrSection.style.opacity = '1';
        qrSection.style.transform = 'translateY(0)';
    }, 100);
}

// Hide QR section
function hideQRSection() {
    qrSection.style.display = 'none';
    qrSection.classList.remove('show');
    qrSection.style.opacity = '0';
    qrSection.style.transform = 'translateY(20px)';
}

// Scroll to QR section
function scrollToQR() {
    setTimeout(() => {
        qrSection.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }, 200);
}

// Show modal
function showModal(message) {
    modalMessage.textContent = message;
    modalOverlay.style.display = 'flex';
    
    // Add animation
    setTimeout(() => {
        modalOverlay.style.opacity = '1';
        const modal = modalOverlay.querySelector('.modal');
        modal.style.transform = 'scale(1)';
        modal.style.opacity = '1';
    }, 10);
    
    // Focus on OK button
    setTimeout(() => {
        modalOK.focus();
    }, 100);
}

// Hide modal
function hideModal() {
    const modal = modalOverlay.querySelector('.modal');
    modal.style.transform = 'scale(0.9)';
    modal.style.opacity = '0';
    modalOverlay.style.opacity = '0';
    
    setTimeout(() => {
        modalOverlay.style.display = 'none';
    }, 200);
}

// Add smooth animations to QR section
const style = document.createElement('style');
style.textContent = `
    .qr-section {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .qr-section.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .child-info {
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .child-info.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .modal {
        transform: scale(0.9);
        opacity: 0;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .modal-overlay {
        opacity: 0;
        transition: opacity 0.2s ease;
    }
    
    .btn:disabled {
        pointer-events: none;
    }
    
    .form-control:focus {
        transform: translateY(-1px);
    }
    
    .radio-option:hover .radio-custom {
        transform: scale(1.1);
    }
    
    .btn--primary:hover {
        transform: translateY(-2px);
    }
    
    .btn--primary:active {
        transform: translateY(0);
    }
    
    @keyframes leafFloat {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(5deg); }
    }
    
    .leaf-small {
        animation: leafFloat 3s ease-in-out infinite;
    }
    
    .leaf-1 { animation-delay: 0s; }
    .leaf-2 { animation-delay: 1s; }
    .leaf-3 { animation-delay: 2s; }
`;
document.head.appendChild(style);

// Add loading animation for QR generation
function showLoadingState() {
    generateQRBtn.innerHTML = `
        <svg class="btn-icon animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.49 8.49l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.49-8.49l2.83-2.83"/>
        </svg>
        <span>Đang tạo mã QR...</span>
    `;
    generateQRBtn.disabled = true;
}

function hideLoadingState() {
    generateQRBtn.innerHTML = `
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <rect x="7" y="7" width="3" height="3"/>
            <rect x="14" y="7" width="3" height="3"/>
            <rect x="7" y="14" width="3" height="3"/>
            <rect x="14" y="14" width="3" height="3"/>
        </svg>
        <span>Tạo mã QR chuyển khoản</span>
    `;
    generateQRBtn.disabled = false;
}

// Override generateQRCode to include loading state
const originalGenerateQRCode = generateQRCode;
generateQRCode = function() {
    showLoadingState();
    
    setTimeout(() => {
        originalGenerateQRCode();
        hideLoadingState();
    }, 500); // Small delay for better UX
};

// Add spin animation for loading
const spinStyle = document.createElement('style');
spinStyle.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .animate-spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(spinStyle);