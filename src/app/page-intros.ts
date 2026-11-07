import type { AdminPath } from "./navigation"

export const PAGE_INTROS = {
  "/": "Key metrics, sales trends, and queues that need a decision. Choose a time range to compare recent marketplace performance.",
  "/users/buyers":
    "Customer accounts that shop on the marketplace. Search by name, email, or phone and open a row for profile details.",
  "/users/vendors":
    "Approved seller accounts and their access status. Edit vendor details or suspend accounts from the row actions menu.",
  "/users/stores":
    "Vendor storefronts on the marketplace. Open a row to inspect contact details, categories, and listing status.",
  "/users/vendor-applications":
    "Seller applications waiting for a decision. Review business details, notes, and approve or reject from the queue.",
  "/catalog/categories":
    "The category tree shoppers browse. Expand nodes to edit levels, assign attributes, and manage visibility.",
  "/catalog/attributes":
    "Shared attributes and variant options used across products. Create definitions once and reuse them in the catalog.",
  "/catalog/product-approvals":
    "Listings waiting for moderation before they go live. Open a product to review media, copy, and approval status.",
  "/moderation/reviews":
    "All buyer reviews across the marketplace. Open a row to read replies or remove inappropriate feedback.",
  "/moderation/reports":
    "Buyer complaints about product listings. Open a row to review details and mark the report as handled.",
  "/commerce/orders":
    "Find orders, check payment, and open a record to fulfill or inspect line items and delivery status.",
  "/commerce/returns":
    "Delivery returns and sellable products being shipped back to vendors. Track refund decisions and return shipments.",
  "/finance/commissions":
    "Set the platform default fee and settlement hold, then override rates for individual stores.",
  "/finance/vendor-earnings":
    "Pending settlement, withdrawable balance, and paid-out totals for every active store. Release pending funds early when needed.",
  "/finance/withdrawals":
    "Review vendor payout requests, move them through approval, and record payout references when paid.",
  "/finance/settlements":
    "Platform GMV, commission totals, COD exposure, and live vendor wallet aggregates.",
  "/marketing/featured-categories":
    "Choose up to eight root categories for the storefront homepage strip and control their display order.",
  "/marketing/sponsored-product":
    "Promote one product on Top selling and one on New arrivals. Each section can only have a single sponsored product.",
  "/marketing/coupons":
    "Create discount codes customers can apply at checkout. Usage limits and active windows are enforced on the server.",
  "/marketing/flash-deals":
    "Create a named deal with a schedule, then add products with their own discounts. Only one flash deal can be active at a time.",
  "/site-content/hero":
    "Homepage hero slides with copy and imagery. Reorder slides and control how many heroes are active at once.",
  "/site-settings/delivery-charge":
    "Configure default delivery fees and the order total that unlocks free shipment for buyers.",
  "/settings":
    "Platform-wide configuration. Additional settings panels will appear here as they are added.",
} satisfies Record<AdminPath, string>
