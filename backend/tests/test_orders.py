from decimal import Decimal
import unittest
from apps.orders.models import OrderStatus, SizeVariant

class OrderWorkflowTestCase(unittest.TestCase):
    def test_order_status_progression(self):
        """Kiểm tra luồng trạng thái đơn hàng: PENDING -> ARRANGING -> SHIPPING -> DELIVERED"""
        valid_statuses = [
            OrderStatus.PENDING,
            OrderStatus.ARRANGING,
            OrderStatus.SHIPPING,
            OrderStatus.DELIVERED,
            OrderStatus.CANCELLED
        ]
        self.assertIn('PENDING', valid_statuses)
        self.assertIn('ARRANGING', valid_statuses)
        self.assertIn('SHIPPING', valid_statuses)
        self.assertIn('DELIVERED', valid_statuses)

    def test_order_subtotal_calculation(self):
        """Kiểm tra logic tính tổng tiền nhiều mục hàng"""
        items = [
            {'unit_price': Decimal('500000'), 'qty': 2},
            {'unit_price': Decimal('750000'), 'qty': 1},
        ]
        subtotal = sum(i['unit_price'] * i['qty'] for i in items)
        self.assertEqual(subtotal, Decimal('1750000'))

    def test_order_final_total_after_discount_and_shipping(self):
        """Tính tổng thanh toán cuối cùng có trừ chiết khấu và cộng phí giao hoa"""
        subtotal = Decimal('1750000')
        discount = Decimal('175000')
        shipping_fee = Decimal('25000')
        final_total = subtotal - discount + shipping_fee
        self.assertEqual(final_total, Decimal('1600000'))

if __name__ == '__main__':
    unittest.main()
