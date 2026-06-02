import { Coins } from "lucide-react";
import { NavItem } from "../nav-main";

/**
 * CRM Module Menu Item - Task Group 2.3
 *
 * Converted from DropdownMenu pattern to collapsible sidebar group.
 * Returns a NavItem object with sub-items for all CRM routes.
 *
 * @param localizations - Localized labels for CRM module items
 * @returns NavItem object with collapsible sub-items for CRM navigation
 */

type Props = {
  localizations: {
    title: string;
    accounts: string;
    contacts: string;
    leads: string;
    opportunities: string;
    contracts: string;
    products: string;
  };
  features?: string[];
};

export const getCrmMenuItem = ({ localizations, features = [] }: Props): NavItem => {
  const items = [
    {
      title: "Dashboard",
      url: "/crm/dashboard",
    },
    {
      title: "My Dashboard",
      url: "/crm/dashboard/user",
    },
    {
      title: "Overview",
      url: "/crm",
    },
  ];

  // If features list is empty (e.g. context loading), show standard modules as fallback
  const hasFeaturesConfig = features.length > 0;

  if (!hasFeaturesConfig || features.includes("accounts")) {
    items.push({
      title: localizations.accounts,
      url: "/crm/accounts",
    });
  }
  if (!hasFeaturesConfig || features.includes("contacts")) {
    items.push({
      title: localizations.contacts,
      url: "/crm/contacts",
    });
  }
  if (!hasFeaturesConfig || features.includes("leads")) {
    items.push({
      title: localizations.leads,
      url: "/crm/leads",
    });
  }
  if (!hasFeaturesConfig || features.includes("opportunities")) {
    items.push({
      title: localizations.opportunities,
      url: "/crm/opportunities",
    });
  }
  if (!hasFeaturesConfig || features.includes("contracts")) {
    items.push({
      title: localizations.contracts,
      url: "/crm/contracts",
    });
  }
  if (!hasFeaturesConfig || features.includes("products")) {
    items.push({
      title: localizations.products,
      url: "/crm/products",
    });
  }

  return {
    title: localizations.title,
    icon: Coins,
    items,
  };
};

export default getCrmMenuItem;

