/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { runAllUnitTests } from './unitTests';

console.log('================================================================');
console.log("  Rose Flowers - AUTOMATED UNIT TESTING SUITE (CLI)");
console.log('================================================================\n');

const suite = runAllUnitTests();

suite.results.forEach((test, idx) => {
  const status = test.passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${idx + 1}/${suite.results.length}] ${status}: ${test.name} (${test.durationMs}ms)`);
  console.log(`     Mô tả: ${test.description}`);
  if (!test.passed) {
    console.log(`     Expected:`, test.expected);
    console.log(`     Actual:`, test.actual);
    if (test.error) console.log(`     Error:`, test.error);
  }
});

console.log('\n----------------------------------------------------------------');
console.log(`  KẾT QUẢ KIỂM THỬ:`);
console.log(`  - Đã chạy:    ${suite.results.length} bài test`);
console.log(`  - Thành công: ${suite.passedCount} bài test`);
console.log(`  - Thất bại:   ${suite.failedCount} bài test`);
console.log(`  - Thời gian:  ${suite.totalDurationMs} ms`);
console.log('----------------------------------------------------------------\n');

if (suite.failedCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 TẤT CẢ CÁC BÀI KIỂM THỬ NGHIỆP VỤ & PHÂN QUYỀN RBAC ĐỀU ĐẠT CHUẨN!\n');
  process.exit(0);
}
