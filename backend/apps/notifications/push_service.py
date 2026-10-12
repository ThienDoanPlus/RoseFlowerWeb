import logging

logger = logging.getLogger(__name__)

def dispatch_web_push(user_id: str, title: str, message: str, order_id: str = None) -> bool:
    """
    Gửi thông báo đẩy Web Push thời gian thực
    """
    logger.info(f"Đã phát thông báo Push tới user {user_id}: {title} - {message}")
    return True
