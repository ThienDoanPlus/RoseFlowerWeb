import hmac
import hashlib
from decimal import Decimal

def generate_vnpay_intent(order_id: str, amount: Decimal) -> dict:
    amount_vnpay = int(amount) * 100
    params = f"vnp_Amount={amount_vnpay}&vnp_Command=pay&vnp_TxnRef={order_id}"
    secure_hash = hmac.new(b"vnpay_hash_secret", params.encode('utf-8'), hashlib.sha512).hexdigest()

    return {
        'order_id': order_id,
        'amount': int(amount),
        'payment_url': f"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?{params}&vnp_SecureHash={secure_hash}",
        'secure_hash': secure_hash,
    }
