from decimal import Decimal
import urllib.parse

BANK_ID = "970422" # MB Bank (Napas)
BANK_NAME = "MB Bank (Ngân hàng Quân Đội)"
ACCOUNT_NO = "0888208306"
ACCOUNT_NAME = "TIEM HOA SAP ROSE"

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
        'bank_id': BANK_ID,
        'bank_name': BANK_NAME,
        'account_number': ACCOUNT_NO,
        'account_name': ACCOUNT_NAME,
        'amount': amount_int,
        'transfer_content': memo,
    }
