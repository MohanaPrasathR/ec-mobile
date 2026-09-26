# PhoneVault 📱

**Smartphone storefront built with Next.js 16, React 19, TypeScript and MongoDB (Mongoose).**
Formerly *TechMobile / MobileSale*.

## Features

- Product catalogue with brand filter, search and sorting (price, rating, newest). The sample
  catalogue loads automatically into an empty database.
- Product detail modal with specs, a cart drawer with quantity controls, and checkout.
- **Server-side checkout:** the browser sends only product IDs and quantities. The server looks up
  prices, checks stock, and **reserves stock atomically** (`findOneAndUpdate` with
  `stock >= qty`), so two shoppers can't buy the last phone. If any line fails, reserved stock is
  returned.
- Staff actions (add, edit or delete phones, view order history with customer details) require an
  admin key (`x-admin-key` header, compared in constant time).
- Input validation: regex-escaped search (no regex injection), whitelisted product fields (no mass
  assignment), bounded quantities, and no internal error messages leaked to clients.

## Fixes in this version

| Issue | Fix |
| --- | --- |
| Checkout sent `{product, quantity}` but the server read `productId`, so every order was saved at ₹0 as "Mobile Phone" | Server prices orders from the catalogue; covered by tests |
| Client-supplied prices were used when a product ID wasn't found | Unknown products are rejected |
| Negative or huge quantities were accepted; stock wasn't checked; stock updates weren't atomic | Validated 1-5 per phone; atomic reservation with rollback |
| Search box sent `?q=`, but the API read `?search=` | API accepts both |
| Anyone could create, edit or delete products, re-seed the DB, create orders with any total, or list all customers' orders | Admin key required; order creation only via checkout |
| Checkout form collected card number, expiry and CVC for a mock payment | Removed; demo uses cash on delivery |
| User input was passed straight into `new RegExp()` | Escaped and length-capped |
| Orders modal read fields that don't exist (`receiptId`, `totalAmount`, `email`) | Uses the real model fields |

## Run it

```bash
cp .env.example .env.local     # set MONGODB_URI and ADMIN_API_KEY
npm install
npm run dev
npm test                       # validation, pricing and search-escaping tests
```
