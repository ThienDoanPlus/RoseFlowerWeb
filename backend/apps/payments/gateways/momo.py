import hmac
import hashlib
from decimal import Decimal

def generate_momo_intent(order_id: str, amount: Decimal) -> dict:
    amount_int = int(amount)
    raw_signature = f"accessKey=ROSE_MOMO_KEY&amount={amount_int}&orderId={order_id}"
    signature = hmac.new(b"secret_key_momo", raw_signature.encode('utf-8'), hashlib.sha256).hexdigest()

    return {
        'order_id': order_id,
        'amount': amount_int,
        'pay_url': f"https://payment.momo.vn/v2/gateway/pay?orderId={order_id}&signature={signature}",
        'qr_code_url': f"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=2|99|0888208306|ROSE|{amount_int}|0|0|HOA_{order_id}",
        'signature': signature,
    }
