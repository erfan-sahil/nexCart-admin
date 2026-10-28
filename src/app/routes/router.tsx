import { createElement, type ComponentType } from "react"
import { createBrowserRouter, Navigate, type RouteObject } from "react-router"

import { AdminShell } from "@/components/layout"
import { RequireAdmin } from "@/features/auth/components"
import {
  groupBase,
  isNavGroup,
  NAV,
  pathSegment,
  type AdminPath,
  type NavPage,
  type PageHandle,
} from "@/app/navigation"
import { AttributesPage } from "@/pages/catalog/attributes/page"
import { CategoriesPage } from "@/pages/catalog/categories/page"
import { ProductApprovalsPage } from "@/pages/catalog/product-approvals/page"
import { DisputesPage } from "@/pages/commerce/disputes/page"
import { OrdersPage } from "@/pages/commerce/orders/page"
import { PaymentsPage } from "@/pages/commerce/payments/page"
import { ReturnsPage } from "@/pages/commerce/returns/page"
import { DashboardPage } from "@/pages/dashboard/page"
import { CommissionsPage } from "@/pages/finance/commissions/page"
import { SettlementsPage } from "@/pages/finance/settlements/page"
import { VendorEarningsPage } from "@/pages/finance/vendor-earnings/page"
import { WithdrawalsPage } from "@/pages/finance/withdrawals/page"
import { LoginPage } from "@/pages/login/page"
import { BannersPage } from "@/pages/marketing/banners/page"
import { CollectionsPage } from "@/pages/marketing/collections/page"
import { CouponsPage } from "@/pages/marketing/coupons/page"
import { FeaturedCategoriesPage } from "@/pages/marketing/featured-categories/page"
import { FeaturedProductsPage } from "@/pages/marketing/featured-products/page"
import { FlashDealsPage } from "@/pages/marketing/flash-deals/page"
import { SponsoredAdsPage } from "@/pages/monetization/sponsored-ads/page"
import { SubscriptionsPage } from "@/pages/monetization/subscriptions/page"
import { VendorPlansPage } from "@/pages/monetization/vendor-plans/page"
import { NotFoundPage } from "@/pages/not-found/page"
import { ReportsPage } from "@/pages/reports/page"
import { HeroSectionPage } from "@/pages/site-content/hero/page"
import { SettingsPage } from "@/pages/settings/page"
import { SupportPage } from "@/pages/support/page"
import { BuyersPage } from "@/pages/users/buyers/page"
import { ShopsPage } from "@/pages/users/shops/page"
import { VendorApplicationsPage } from "@/pages/users/vendor-applications/page"
import { VendorsPage } from "@/pages/users/vendors/page"

const pages: Record<AdminPath, ComponentType> = {
  "/": DashboardPage,
  "/users/buyers": BuyersPage,
  "/users/vendors": VendorsPage,
  "/users/shops": ShopsPage,
  "/users/vendor-applications": VendorApplicationsPage,
  "/catalog/categories": CategoriesPage,
  "/catalog/attributes": AttributesPage,
  "/catalog/product-approvals": ProductApprovalsPage,
  "/commerce/orders": OrdersPage,
  "/commerce/payments": PaymentsPage,
  "/commerce/returns": ReturnsPage,
  "/commerce/disputes": DisputesPage,
  "/finance/commissions": CommissionsPage,
  "/finance/vendor-earnings": VendorEarningsPage,
  "/finance/withdrawals": WithdrawalsPage,
  "/finance/settlements": SettlementsPage,
  "/marketing/banners": BannersPage,
  "/marketing/featured-products": FeaturedProductsPage,
  "/marketing/featured-categories": FeaturedCategoriesPage,
  "/marketing/collections": CollectionsPage,
  "/marketing/coupons": CouponsPage,
  "/marketing/flash-deals": FlashDealsPage,
  "/site-content/hero": HeroSectionPage,
  "/monetization/vendor-plans": VendorPlansPage,
  "/monetization/subscriptions": SubscriptionsPage,
  "/monetization/sponsored-ads": SponsoredAdsPage,
  "/reports": ReportsPage,
  "/support": SupportPage,
  "/settings": SettingsPage,
}

function handleFor(page: NavPage): PageHandle {
  return {
    title: page.label,
    description: page.description,
  }
}

function pageRoute(page: NavPage, index = false): RouteObject {
  return {
    ...(index ? { index: true } : { path: pathSegment(page.path) }),
    element: createElement(pages[page.path]),
    handle: handleFor(page),
  }
}

const childRoutes: RouteObject[] = NAV.map((entry) => {
  if (!isNavGroup(entry)) {
    return pageRoute(entry, entry.path === "/")
  }

  const [first] = entry.children

  return {
    path: groupBase(entry),
    children: [
      {
        index: true,
        element: <Navigate to={pathSegment(first.path)} replace />,
      },
      ...entry.children.map((page) => pageRoute(page)),
    ],
  }
})

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <RequireAdmin />,
    children: [
      {
        path: "/",
        element: <AdminShell />,
        children: [
          ...childRoutes,
          {
            path: "*",
            element: <NotFoundPage />,
            handle: {
              title: "Not found",
              description: "This page is not in the admin.",
            } satisfies PageHandle,
          },
        ],
      },
    ],
  },
])
