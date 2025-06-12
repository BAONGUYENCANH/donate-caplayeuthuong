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

// THÔNG TIN QUAN TRỌNG: Vui lòng xác minh thông tin ngân hàng dưới đây.
// Ngân hàng Chính sách xã hội (VBSP) hiện không được hỗ trợ bởi VietQR.
// Bạn cần sử dụng tài khoản tại một ngân hàng được Napas hỗ trợ (ví dụ: BIDV, Vietcombank,...).
// Mã BIN '970418' của BIDV và số tài khoản '1000001001242424' được dùng làm VÍ DỤ.
// BẠN PHẢI THAY THẾ BẰNG THÔNG TIN NGÂN HÀNG TRUNG GIAN CHÍNH XÁC.
const ACCOUNT_INFO = {
    holder: 'Cặp lá yêu thương',
    number: '1000001001242424', // Số tài khoản bạn cung cấp
    bank: 'VBSP',
    bin: '970418' // VÍ DỤ: Mã BIN của BIDV. BẠN PHẢI THAY THẾ!
};


// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateChildInfoVisibility();
    updateGenerateButtonState();
});

// Event listeners
function initializeEventListeners() {
    donationTypeRadios.forEach(radio => {
        radio.addEventListener('change', handleDonationTypeChange);
    });

    generateQRBtn.addEventListener('click', handleGenerateQR);

    modalClose.addEventListener('click', hideModal);
    modalOK.addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            hideModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.style.display !== 'none') {
            hideModal();
        }
    });

    childNameInput.addEventListener('input', updateGenerateButtonState);
    childCodeInput.addEventListener('input', updateGenerateButtonState);
}


function handleDonationTypeChange() {
    updateChildInfoVisibility();
    hideQRSection();
    updateGenerateButtonState();
}

function updateChildInfoVisibility() {
    const selectedType = document.querySelector('input[name="donationType"]:checked').value;
    const shouldShow = selectedType === 'specific';
    
    if (shouldShow) {
        childInfoSection.style.display = 'block';
        setTimeout(() => childInfoSection.classList.add('show'), 10);
    } else {
        childInfoSection.classList.remove('show');
        childInfoSection.style.display = 'none';
        childNameInput.value = '';
        childCodeInput.value = '';
    }
}

function updateGenerateButtonState() {
    const selectedType = document.querySelector('input[name="donationType"]:checked').value;
    let isValid = true;
    if (selectedType === 'specific') {
        const name = childNameInput.value.trim();
        const code = childCodeInput.value.trim();
        isValid = name !== '' && code !== '';
    }
    generateQRBtn.disabled = !isValid;
}


function handleGenerateQR() {
    // Thêm bước kiểm tra xem thư viện QRCode đã được tải chưa
    if (typeof QRCode === 'undefined') {
        showModal('Thư viện tạo mã QR chưa được tải. Vui lòng kiểm tra kết nối mạng và làm mới trang.');
        return;
    }

    const selectedType = document.querySelector('input[name="donationType"]:checked').value;
    if (selectedType === 'specific') {
        const name = childNameInput.value.trim();
        const code = childCodeInput.value.trim();
        if (!name || !code) {
            showModal('Vui lòng nhập đầy đủ thông tin tên bé và mã số để tiếp tục.');
            return;
        }
    }
    generateAndDisplayQRCode();
}

// --- Logic tạo mã VietQR ---

/**
 * Tính toán mã CRC16/CCITT-FALSE cho chuỗi VietQR.
 * @param {string} data Dữ liệu cần tính checksum.
 * @returns {string} Chuỗi checksum 4 ký tự hex.
 */
function crc16(data) {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
        }
    }
    return ('0000' + (crc & 0xFFFF).toString(16).toUpperCase()).slice(-4);
}

/**
 * Định dạng một trường dữ liệu theo chuẩn TLV (Tag-Length-Value).
 * @param {string|number} tag Mã tag.
 * @param {string} value Giá trị.
 * @returns {string} Chuỗi TLV đã định dạng.
 */
function formatTLV(tag, value) {
    if (value === null || value === undefined || value === '') return '';
    const tagStr = tag.toString().padStart(2, '0');
    const valueStr = String(value);
    const lengthStr = valueStr.length.toString().padStart(2, '0');
    return `${tagStr}${lengthStr}${valueStr}`;
}

/**
 * Tạo nội dung cho mã VietQR theo chuẩn Napas247.
 * @param {object} options Các tùy chọn cho mã QR.
 * @param {string} options.bin Mã BIN của ngân hàng.
 * @param {string} options.accountNo Số tài khoản.
 * @param {string} [options.info] Nội dung chuyển khoản.
 * @param {number} [options.amount] Số tiền.
 * @returns {string} Chuỗi nội dung hoàn chỉnh cho mã QR.
 */
function generateVietQRContent(options) {
    const { bin, accountNo, info, amount } = options;
    
    const consumerInfo = formatTLV('00', bin) + formatTLV('01', accountNo);
    const merchantInfo = formatTLV('00', 'A000000727') + formatTLV('01', consumerInfo) + formatTLV('02', 'QRIBFTTA');
    
    const dataParts = [
        formatTLV('00', '01'),
        formatTLV('01', amount ? '12' : '11'),
        formatTLV('38', merchantInfo),
        formatTLV('52', '0000'), // Mã danh mục kinh doanh
        formatTLV('53', '704'),  // Mã tiền tệ (VND)
    ];

    if (amount) {
        dataParts.push(formatTLV('54', String(amount)));
    }
    dataParts.push(formatTLV('58', 'VN'));

    if (info) {
        const additionalData = formatTLV('08', info);
        dataParts.push(formatTLV('62', additionalData));
    }

    const dataToChecksum = dataParts.join('') + '6304';
    const checksum = crc16(dataToChecksum);
    return dataToChecksum + checksum;
}
// --- Kết thúc Logic tạo mã VietQR ---

/**
 * Tạo và hiển thị mã QR.
 */
function generateAndDisplayQRCode() {
    const selectedType = document.querySelector('input[name="donationType"]:checked').value;
    let transferContent = '';

    if (selectedType === 'general') {
        transferContent = 'Ung ho CLYT';
    } else {
        const name = childNameInput.value.trim();
        const code = childCodeInput.value.trim();
        const sanitizedName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, '');
        const sanitizedCode = code.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, '');
        transferContent = `${sanitizedName} ${sanitizedCode}`.trim().substring(0, 50);
    }

    const qrContent = generateVietQRContent({
        bin: ACCOUNT_INFO.bin,
        accountNo: ACCOUNT_INFO.number,
        info: transferContent,
    });

    try {
        const ctx = qrCanvas.getContext('2d');
        ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);

        QRCode.toCanvas(qrCanvas, qrContent, {
            width: 200,
            height: 200,
            margin: 2,
            color: { dark: '#15803d', light: '#ffffff' },
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


function showQRSection() {
    qrSection.style.display = 'block';
    setTimeout(() => {
        qrSection.style.opacity = '1';
        qrSection.style.transform = 'translateY(0)';
    }, 10);
}


function hideQRSection() {
    qrSection.style.opacity = '0';
    qrSection.style.transform = 'translateY(20px)';
    setTimeout(() => {
        qrSection.style.display = 'none';
    }, 300);
}


function scrollToQR() {
    setTimeout(() => {
        qrSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
}


function showModal(message) {
    modalMessage.textContent = message;
    modalOverlay.style.display = 'flex';
    setTimeout(() => {
        modalOverlay.style.opacity = '1';
        const modal = modalOverlay.querySelector('.modal');
        modal.style.transform = 'scale(1)';
        modal.style.opacity = '1';
        modalOK.focus();
    }, 10);
}


function hideModal() {
    const modal = modalOverlay.querySelector('.modal');
    modalOverlay.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    modal.style.opacity = '0';
    setTimeout(() => {
        modalOverlay.style.display = 'none';
    }, 200);
}
