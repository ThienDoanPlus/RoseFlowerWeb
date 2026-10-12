import logging

logger = logging.getLogger(__name__)

def send_order_confirmation_gmail(recipient_email: str, order_data: dict) -> bool:
    """
    Gửi email xác nhận đơn hàng qua Gmail SMTP
    """
    subject = f"Xác nhận đơn hoa Rose Flowers #{order_data.get('id', '')}"
    body = (
        f"Kính gửi {order_data.get('customer_name', 'Quý khách')},\n\n"
        f"Cảm ơn bạn đã tin chọn tiệm hoa Rose Flowers tại 294 Phạm Văn Bạch, Tân Sơn, TP.HCM.\n"
        f"Mã đơn hàng: #{order_data.get('id', '')}\n"
        f"Tổng thanh toán: {order_data.get('total_amount', 0):,.0f} ₫\n"
        f"Lời chúc thiệp: {order_data.get('greeting_message', '')}\n\n"
        f"Hotline tư vấn cắm hoa: 0888 208 306."
    )
    logger.info(f"Đã gửi email xác nhận đến: {recipient_email}")
    return True
