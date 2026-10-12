from decimal import Decimal
import unittest
from apps.promotions.models import Voucher, DiscountType
from apps.promotions.services import calculate_bulk_discount, validate_voucher_logic

class VoucherLogicTestCase(unittest.TestCase):
    def test_bulk_discount_quantity_tier(self):
        """Mua >= 3 bó giảm 10%"""
        result = calculate_bulk_discount(total_quantity=3, subtotal=Decimal('1500000'))
        self.assertTrue(result['is_eligible'])
        self.assertEqual(result['rate'], 10)
        self.assertEqual(result['discount_amount'], Decimal('150000'))

    def test_bulk_discount_vip_tier(self):
        """Đơn >= 2.000.000đ giảm 15% VIP"""
        result = calculate_bulk_discount(total_quantity=2, subtotal=Decimal('2400000'))
        self.assertTrue(result['is_eligible'])
        self.assertEqual(result['rate'], 15)
        self.assertEqual(result['discount_amount'], Decimal('360000'))

    def test_bulk_discount_not_eligible(self):
        """Đơn dưới 3 bó và dưới 2.000.000đ không được giảm"""
        result = calculate_bulk_discount(total_quantity=1, subtotal=Decimal('850000'))
        self.assertFalse(result['is_eligible'])
        self.assertEqual(result['discount_amount'], Decimal('0'))

    def test_holiday_special_voucher(self):
        """Kiểm tra hợp lệ của mã giảm giá dịp lễ 8/3 (WOMENSDAY) có giới hạn mức trần"""
        voucher = Voucher(
            id='v-83',
            code='WOMENSDAY',
            title='Quốc Tế Phụ Nữ 8/3',
            discount_type=DiscountType.PERCENT,
            discount_value=Decimal('20'),
            min_order_value=Decimal('500000'),
            max_discount_amount=Decimal('200000'),
            is_holiday_special=True,
        )
        # Subtotal 1.500.000đ, 20% = 300.000đ -> trần 200.000đ
        res = validate_voucher_logic(voucher, Decimal('1500000'), total_quantity=2)
        self.assertTrue(res['is_valid'])
        self.assertEqual(res['discount_amount'], Decimal('200000'))

    def test_voucher_min_order_fail(self):
        """Từ chối áp dụng voucher khi chưa đủ giá trị đơn tối thiểu"""
        voucher = Voucher(
            id='v-vip',
            code='VIP500',
            discount_type=DiscountType.FIXED_AMOUNT,
            discount_value=Decimal('500000'),
            min_order_value=Decimal('2000000'),
        )
        res = validate_voucher_logic(voucher, Decimal('1200000'), total_quantity=1)
        self.assertFalse(res['is_valid'])
        self.assertEqual(res['discount_amount'], Decimal('0'))

if __name__ == '__main__':
    unittest.main()
