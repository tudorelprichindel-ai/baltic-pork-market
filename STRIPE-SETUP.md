# Stripe setup for Gaļas grozs

Stripe is available for businesses registered in Latvia.

## Recommended order flow

1. The customer sends the cart through WhatsApp.
2. Gaļas grozs confirms availability, exact weight and the final amount.
3. The customer chooses cash, bank transfer or card.
4. For card payments, Gaļas grozs sends a Stripe-hosted payment link for the confirmed amount.
5. The order is marked as paid only after Stripe confirms the payment.

This avoids charging the indicative cart total before the products are weighed.

## Initial Stripe configuration

1. Create the company account at `https://dashboard.stripe.com/register`.
2. Select Latvia as the business country and complete business verification.
3. Keep the account in Test mode during development.
4. Enable card payments and EUR as the settlement currency.
5. Create payment links only for confirmed order totals.
6. Do not commit secret or restricted Stripe keys to Git.

## Security

- Publishable keys may be used in browser code only when a full Stripe Checkout integration is added.
- Secret keys and webhook signing secrets must exist only on a secure server or hosting platform.
- Never place `sk_live_`, `sk_test_` or `whsec_` values in HTML or client-side JavaScript.
- Local `.env` files are excluded through `.gitignore`.

## Future automatic integration

Automatic per-order Stripe Checkout requires a small backend or serverless function that:

- receives the confirmed order ID and amount;
- creates a Stripe Checkout Session server-side;
- returns the Stripe-hosted checkout URL;
- verifies the payment through a signed Stripe webhook.

Until that backend exists, Stripe Payment Links created after manual order confirmation are the safe production workflow.
