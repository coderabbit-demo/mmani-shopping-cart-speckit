import test from 'node:test';
import assert from 'node:assert/strict';
import { SHIPPING_FIELDS, validateShipping } from '../lib/checkout-validation.ts';

const valid = { fullName: 'Alex Smith', email: 'alex@example.com', address: '123 Main St', city: 'Portland', postalCode: 'A1B 2C3' };
const messages = { fullName: 'Enter your full name.', email: 'Enter a valid email address.', address: 'Enter your street address.', city: 'Enter your city.', postalCode: 'Enter a valid postal code.' };

test('fields have a predictable focus order and valid inputs are trimmed', () => {
  assert.deepEqual(SHIPPING_FIELDS, ['fullName', 'email', 'address', 'city', 'postalCode']);
  const input = Object.fromEntries(Object.entries(valid).map(([key, value]) => [key, `  ${value}  `]));
  assert.deepEqual(validateShipping(input), { values: valid, errors: {} });
});

for (const field of Object.keys(valid)) {
  test(`${field} rejects empty, whitespace and non-string input`, () => {
    for (const value of ['', '  ', null, undefined, 42, {}, []]) {
      const result = validateShipping({ ...valid, [field]: value });
      assert.equal(result.errors[field], messages[field]);
      assert.equal(result.values[field], '');
    }
  });
}

test('name, address and city enforce their maximum lengths', () => {
  for (const [field, max] of [['fullName', 80], ['address', 120], ['city', 60]]) {
    assert.equal(validateShipping({ ...valid, [field]: 'a'.repeat(max) }).errors[field], undefined);
    assert.equal(validateShipping({ ...valid, [field]: 'a'.repeat(max + 1) }).errors[field], messages[field]);
  }
});

test('email requires a complete address without spaces', () => {
  for (const email of ['alex@', '@example.com', 'alex@example', 'a b@example.com', 'a@@example.com']) assert.equal(validateShipping({ ...valid, email }).errors.email, messages.email);
  assert.equal(validateShipping({ ...valid, email: 'a+b@example.co' }).errors.email, undefined);
});

test('postal code requires 3 to 10 letters, digits, spaces or hyphens with alphanumeric ends', () => {
  for (const postalCode of ['!!', 'AB', '12345678901', '-123', '123-', '12!3', '12_3']) assert.equal(validateShipping({ ...valid, postalCode }).errors.postalCode, messages.postalCode);
  for (const postalCode of ['ABC', 'A1 2-Z', '1234567890']) assert.equal(validateShipping({ ...valid, postalCode }).errors.postalCode, undefined);
});
