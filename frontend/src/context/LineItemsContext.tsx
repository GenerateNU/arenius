"use client";

import { GetLineItemResponse, LineItemFilters } from "@/types";
import { createDataContext } from "./Context";

export const { DataProvider: LineItemsProvider, useData: useLineItems } =
  createDataContext<GetLineItemResponse, LineItemFilters>();