# Medical-Deal Shopify Theme Rules

Project: Medical-Deal Dawn Relaunch
Base theme: Shopify Dawn
Shop: medical-deal.myshopify.com
Unpublished Theme ID: 201959539018

## Goal
Build a custom Medical-Deal B2B/B2C Shopify theme based on Dawn.

Main goals:
- custom header
- hygi-style vertical category menu
- large central search
- B2B/B2C switch
- VPE logic for Box / Umkarton
- central CSS architecture
- fast mobile performance

## Rules
- Never modify or push to the live theme.
- Always use theme ID 201958162762 for Shopify CLI push/dev.
- Do not use PageFly for core templates.
- Prefer custom files with `md-` prefix.
- Keep Dawn core changes minimal.
- Do not fake net prices in CSS or JavaScript.
- Real B2B prices must come from Shopify B2B, catalogs, app pricing, or real variant prices.
- Do not hardcode product-specific data in templates.
- Use product/variant metafields for VPE, GTIN, REF, HAN and packaging units.
- Keep CSS centralized in `assets/md-*.css`.
- Keep JavaScript minimal and vanilla where possible.
- Optimize for LCP, mobile and maintainability.

## Preferred custom files
Create or extend:
- sections/md-header.liquid
- snippets/md-b2b-switch.liquid
- snippets/md-category-menu.liquid
- snippets/md-vpe-info.liquid
- assets/md-theme.css
- assets/md-header.css
- assets/md-product.css
- assets/md-b2b.css
- assets/md-header.js

## Workflow
- First analyze.
- Then plan.
- Only then change code.
- Work in small commits.
- Run `shopify theme check` before finishing.