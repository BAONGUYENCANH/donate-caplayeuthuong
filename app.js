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
    // Kiểm tra thư viện QRCode ngay khi trang load
    checkQRCodeLibrary();
    initializeEventListeners();
    updateChildInfoVisibility();
    updateGenerateButtonState();
});

// Kiểm tra thư viện QRCode có sẵn không
function checkQRCodeLibrary() {
    if (typeof QRCode === 'undefined') {
        console.warn('QRCode library chưa được tải. Sẽ thử load lại...');
        // Thử load backup CDN
        loadBackupQRLibrary();
    } else {
        console.log('QRCode library đã sẵn sàng');
    }
}

// Load backup QRCode library nếu CDN chính thất bại
function loadBackupQ
