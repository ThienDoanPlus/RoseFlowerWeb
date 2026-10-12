from decimal import Decimal
import unittest
from apps.payments.gateways.vietqr import generate_vietqr_url
from apps.payments.gateways.momo import generate_momo_intent
from apps.payments.gateways.vnpay import generate_vnpay_intent

class PaymentGatewaysTestCase(unittest.TestCase):
    def test_vietqr_payload_generation(self):
        """Sinh mã VietQR chuẩn Napas MB Bank 970422"""
        res = generate_vietqr_url(Decimal('1050000'), 'LAMOUR-9821')
        self.assertEqual(res['bank_id'], '970422')
        self.assertEqual(res['account_number'], '0888208306')
        self.assertEqual(res['amount'], 1050000)
        self.assertEqual(res['transfer_content'], 'HOA LAMOUR-9821')
        self.assertIn('img.vietqr.io', res['qr_image_url'])

    def test_momo_payload_generation(self):
        """Sinh payload và chữ ký bảo mật HMAC-SHA256 của MoMo"""
        res = generate_momo_intent('LAMOUR-9822', Decimal('889000'))
        self.assertEqual(res['order_id'], 'LAMOUR-9822')
        self.assertEqual(res['amount'], 889000)
        self.assertTrue(len(res['signature']) > 0)
        self.assertIn('payment.momo.vn', res['pay_url'])

    def test_vnpay_payload_generation(self):
        """Sinh payload và chữ ký bảo mật HMAC-SHA512 của VNPay"""
        res = generate_vnpay_intent('LAMOUR-9823', Decimal('415000'))
        self.assertEqual(res['order_id'], 'LAMOUR-9823')
        self.assertEqual(res['amount'], 415000)
        self.assertTrue(len(res['secure_hash']) > 0)
        self.assertIn('vnpayment.vn', res['payment_url'])

if __name__ == '__main__':
    unittest.main()
