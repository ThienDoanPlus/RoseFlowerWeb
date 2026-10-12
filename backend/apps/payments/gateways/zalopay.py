from decimal import Decimal

def generate_zalopay_intent(order_id: str, amount: Decimal) -> dict:
    return {
        'order_id': order_id,
        'amount': int(amount),
        'order_url': f"https://gateway.zalopay.vn/pay?apptransid={order_id}",
        'qr_code_url': f"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=zalopay://pay?amount={int(amount)}&orderId={order_id}",
    }
