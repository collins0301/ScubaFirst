# Scuba First website

Static GitHub Pages website for **goscubafirst.com**.

## What is included

- Conversion-focused single-page website
- PADI + SDI Open Water, Advanced, Rescue, and Master Diver pathway
- Utah County / Payson local SEO copy
- Facebook and Instagram links
- Existing Scuba First social graphics
- Inquiry modal and course signup modal
- Payment-link-ready checkout buttons
- Future Travel and Equipment sections already planned into the design
- Responsive mobile navigation
- SEO metadata and local-business structured data

## Before launch: edit `config.js`

Add the business contact details and external services:

1. `inquiryFormEndpoint`
   - Recommended: a Formspree form endpoint or similar static-site form service.
2. `paymentLinks`
   - Add a Stripe Payment Link, Square checkout link, PayPal link, or other hosted checkout URL for each course.
3. `phoneDisplay`, `phoneLink`, and `email` if you want those shown later.
4. Confirm Open Water pricing in `pricing`.

The site currently shows PADI **$500** and SDI **$425**, based on Scuba First's recent promotional pricing.

## GitHub Pages setup

1. Create a separate GitHub repository named `scubafirst-site`.
2. Upload all files in this folder to the root of the repository.
3. Go to **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select **main** and **/(root)**.
6. Keep the included `CNAME` file if `goscubafirst.com` will be the custom domain.
7. Update the DNS at the domain registrar to point the web records to GitHub Pages. Do **not** change or delete email/MX records.

## Social video embeds

This version links directly to Scuba First social profiles because Facebook/Instagram do not provide a reliable public profile feed for a static site without an external widget. Individual Instagram/Facebook post or Reel URLs can be added later as native embeds.

## Future expansion

Because this is static and modular, we can later add:

- `/travel/` trip listings, deposits, forms, itineraries
- `/shop/` equipment catalog and checkout
- course calendar integration
- reviews/testimonials
- individual course landing pages for Google search/ads
