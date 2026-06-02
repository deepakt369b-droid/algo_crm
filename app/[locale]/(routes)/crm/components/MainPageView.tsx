import React from "react";

import { getAccounts } from "@/actions/crm/get-accounts";
import { getContacts } from "@/actions/crm/get-contacts";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getLeads } from "@/actions/crm/get-leads";
import { getContractsWithIncludes } from "@/actions/crm/get-contracts";
import { getOpportunitiesFull } from "@/actions/crm/get-opportunities-with-includes";
import { serializeDecimalsList } from "@/lib/serialize-decimals";

import AccountsView from "./AccountsView";
import ContactsView from "./ContactsView";
import OpportunitiesView from "./OpportunitiesView";
import LeadsView from "./LeadsView";
import ContractsView from "./ContractsView";

const MainPageView = async () => {
  const [crmData, accounts, contacts, opportunities, leads, contracts] =
    await Promise.all([
      getAllCrmData(),
      getAccounts(),
      getContacts(),
      getOpportunitiesFull(),
      getLeads(),
      getContractsWithIncludes(),
    ]);
  // Serialize Decimal fields for client component compatibility
  const serializedOpportunities = serializeDecimalsList(opportunities);
  const serializedContracts = serializeDecimalsList(contracts);
  return (
    <>
      <AccountsView crmData={crmData} data={accounts} />
      <OpportunitiesView crmData={crmData} data={serializedOpportunities} />
      <ContactsView crmData={crmData} data={contacts} />
      <LeadsView crmData={crmData} data={leads} />
      <ContractsView crmData={crmData} data={serializedContracts} />
    </>
  );
};

export default MainPageView;
