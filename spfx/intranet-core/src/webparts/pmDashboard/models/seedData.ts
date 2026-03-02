/**
 * PM Dashboard – Seed data for the dev harness.
 *
 * Provides a realistic set of property managers and dashboard data
 * so the dev harness has content to display on first load.
 */

import type { IPropertyManager, IDashboardData } from "../models/types";

export const SEED_PROPERTY_MANAGERS: IPropertyManager[] = [
  {
    id: "591d8c31-071b-4b49-a650-16d174d7233c",
    firstName: "Charlotte",
    lastName: "Young",
    preferredName: "",
    color: "#ffc0cb",
  },
  {
    id: "907869bf-b9d6-460c-96c4-17a69b66926b",
    firstName: "Christopher",
    lastName: "Woodford",
    preferredName: "Chris",
    color: "#ff5050",
  },
  {
    id: "2b0b3741-f632-4ccd-9362-fc15818cbd6a",
    firstName: "Ellie",
    lastName: "Sauerzapf",
    preferredName: "",
    color: "#fbbe56",
  },
  {
    id: "aa05dbfd-eaa9-43ce-9fe9-2abba4f13d3d",
    firstName: "Harry",
    lastName: "Singh",
    preferredName: "",
    color: "#00b0f0",
  },
  {
    id: "8f9bdcf1-0e39-4ccc-af2a-a91abcbaff19",
    firstName: "Kenneth",
    lastName: "Boyle",
    preferredName: "Ken",
    color: "#abfd58",
  },
];

export const SEED_DASHBOARD_DATA: IDashboardData = {
  vacates: [
    {
      id: "seed-v1",
      pm: "KB",
      columns: ["15/03", "42 Smith Street, Richmond", "KB", "Y", "Relocating"],
    },
    {
      id: "seed-v2",
      pm: "CY",
      columns: ["15/03", "7/18 Chapel Street, Windsor", "CY", "", "End of lease"],
    },
    { id: "seed-v-blank1", pm: "", columns: [], blank: true },
    {
      id: "seed-v3",
      pm: "CW",
      columns: ["20/03", "156 High Street, Prahran", "CW", "Y", "Selling"],
    },
    {
      id: "seed-v4",
      pm: "ES",
      columns: ["22/03", "3/9 Park Avenue, South Yarra", "ES", "", "Moving interstate"],
    },
    {
      id: "seed-v5",
      pm: "HS",
      columns: ["25/03", "88 Commercial Road, Toorak", "HS", "Y", ""],
    },
  ],
  entries: [
    {
      id: "seed-e1",
      pm: "KB",
      columns: ["10/03", "Tue", "Y", "Y", "", "22 Albert Road, South Melbourne", "KB", "New tenant from interstate"],
    },
    {
      id: "seed-e2",
      pm: "CW",
      columns: ["10/03", "Tue", "Y", "Y", "Y", "5/44 Barkly Street, St Kilda", "CW", ""],
    },
    { id: "seed-e-blank1", pm: "", columns: [], blank: true },
    {
      id: "seed-e3",
      pm: "ES",
      columns: ["14/03", "Sat", "", "", "", "91 Fitzroy Street, St Kilda", "ES", "Waiting on references"],
    },
    {
      id: "seed-e4",
      pm: "CY",
      columns: ["17/03", "Tue", "Y", "", "", "12 Acland Street, St Kilda", "CY", "Bond pending"],
    },
    {
      id: "seed-e5",
      pm: "HS",
      columns: ["21/03", "Sat", "", "", "", "67 Carlisle Street, Balaclava", "HS", ""],
    },
  ],
  lost: [
    {
      id: "seed-l1",
      pm: "KB",
      columns: ["01/03", "33 Punt Road, Windsor", "Owner selling - vacant possession", "KB"],
    },
    {
      id: "seed-l2",
      pm: "CW",
      columns: ["05/03", "14 Domain Road, South Yarra", "Moved to competitor agency", "CW"],
    },
  ],
};
