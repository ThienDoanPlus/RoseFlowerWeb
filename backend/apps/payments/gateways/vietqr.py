from decimal import Decimal
import urllib.parse

BANK_ID = "970436" # Vietcombank (Napas)
BANK_NAME = "Vietcombank (Ngân hàng TMCP Ngoại Thương Việt Nam - PGD Sông Vệ)"
ACCOUNT_NO = "1027210627"
ACCOUNT_NAME = "NGUYEN THIEN DOAN"

def generate_vietqr_url(amount: Decimal, order_id: str) -> dict:
    """
    Sinh link ảnh mã QR chuẩn Napas 24/7 theo định dạng VietQR QuickLink
    """
    memo = f"HOA {order_id}"
    encoded_memo = urllib.parse.quote(memo)
    amount_int = int(amount)
    
    qr_url = f"https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NO}-compact2.png?amount={amount_int}&addInfo={encoded_memo}&accountName={urllib.parse.quote(ACCOUNT_NAME)}"

    return {
        'qr_image_url': qr_url,
        'static_qr_url': '/vietqr-payment.png',
        'bank_id': BANK_ID,
        'bank_name': BANK_NAME,
        'branch': 'PGD Sông Vệ',
        'account_number': ACCOUNT_NO,
        'account_name': ACCOUNT_NAME,
        'amount': amount_int,
        'transfer_content': memo,
    }
