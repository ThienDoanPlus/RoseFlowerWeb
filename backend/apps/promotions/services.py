from decimal import Decimal
from .models import Voucher, DiscountType

def calculate_bulk_discount(total_quantity: int, subtotal: Decimal) -> dict:
    """
    Tính chiết khấu đơn hàng lớn:
    - Mua từ 3 bó: giảm 10%
    - Đơn từ 2.000.000đ hoặc từ 5 bó: giảm 15% VIP
    """
    subtotal = Decimal(str(subtotal))
    if subtotal >= Decimal('2000000') or total_quantity >= 5:
        rate = Decimal('0.15')
        discount = (subtotal * rate).quantize(Decimal('1'))
        return {
            'is_eligible': True,
            'rate': 15,
            'discount_amount': discount,
            'reason': 'Chiết khấu VIP cho đơn trên 2.000.000 ₫ (giảm 15%)'
        }

    if total_quantity >= 3:
        rate = Decimal('0.10')
        discount = (subtotal * rate).quantize(Decimal('1'))
        return {
            'is_eligible': True,
            'rate': 10,
            'discount_amount': discount,
            'reason': f'Mua từ {total_quantity} bó hoa trở lên (giảm 10%)'
        }

    return {
        'is_eligible': False,
        'rate': 0,
        'discount_amount': Decimal('0'),
        'reason': ''
    }

def validate_voucher_logic(voucher: Voucher, subtotal: Decimal, total_quantity: int) -> dict:
    """
    Kiểm tra tính hợp lệ và số tiền chiết khấu của voucher
    """
    subtotal = Decimal(str(subtotal))

    if subtotal < voucher.min_order_value:
        return {
            'is_valid': False,
            'discount_amount': Decimal('0'),
            'message': f"Đơn hàng tối thiểu {voucher.min_order_value:,.0f} ₫ để áp dụng mã {voucher.code}"
        }

    if voucher.min_quantity and total_quantity < voucher.min_quantity:
        return {
            'is_valid': False,
            'discount_amount': Decimal('0'),
            'message': f"Cần tối thiểu {voucher.min_quantity} sản phẩm để sử dụng mã này"
        }

    if voucher.discount_type == DiscountType.PERCENT:
        calc_discount = (subtotal * voucher.discount_value) / Decimal('100')
        if voucher.max_discount_amount and calc_discount > voucher.max_discount_amount:
            calc_discount = voucher.max_discount_amount
    else:
        calc_discount = voucher.discount_value

    calc_discount = min(calc_discount, subtotal).quantize(Decimal('1'))

    return {
        'is_valid': True,
        'discount_amount': calc_discount,
        'message': f"Đã áp dụng mã {voucher.code}: giảm {calc_discount:,.0f} ₫"
    }
