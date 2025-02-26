"use client";

import { LineItem, LineItemFilters } from "@/types";
import { createDataContext } from "./Context";

export const { DataProvider: LineItemsProvider, useData: useLineItems } =
  createDataContext<LineItem, LineItemFilters>();