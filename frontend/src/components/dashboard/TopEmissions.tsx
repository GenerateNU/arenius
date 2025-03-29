"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useDateRange } from "@/context/DateRangeContext";
import apiClient from "@/services/apiClient";
import { useState, useEffect } from "react";

// The component will use this data structure for emissions factors
interface EmissionFactor {
  rank: number;
  emission_factor: string;
  total_co2: number;
}

export default function TopEmissionsFactors() {
  const { dateRange } = useDateRange();
  const [emissions, setEmissions] = useState<EmissionFactor[]>([]);
  const { jwt } = useAuth();

  // Get the start and end date from the DateRange context
  const formattedStartMonth =
    new Date(dateRange?.from ?? "").toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    }) || "";
  const formattedStartYear =
    new Date(dateRange?.from ?? "").getFullYear() || "";
  const formattedEndMonth =
    new Date(dateRange?.to ?? "").toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    }) || "";
  const formattedEndYear = dateRange?.to
    ? new Date(dateRange.to).getFullYear()
    : "";

  useEffect(() => {
    // Fetch the top emissions factors based on the current date range
    const fetchTopEmissions = async () => {
      try {
        const response = await apiClient.get("/summary/top-emissions", {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          params: {
            companyId: "your-company-id", // Replace with actual company ID
            startDate: dateRange?.from,
            endDate: dateRange?.to,
          },
        });
        setEmissions(response.data);
      } catch (error) {
        console.error("Error fetching emissions factors:", error);
      }
    };

    fetchTopEmissions();
  }, [dateRange]); // Re-fetch when date range changes

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: "1.5rem" }}>Top Emission Factors</CardTitle>
        <br />
        <CardDescription>
          {formattedStartMonth} {formattedStartYear} - {formattedEndMonth}{" "}
          {formattedEndYear}
        </CardDescription>
      </CardHeader>
      <CardContent style={{ padding: "1rem" }}>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Emission Factor</th>
              <th>Total CO2 (kg)</th>
            </tr>
          </thead>
          <tbody>
            {emissions.map((factor) => (
              <tr key={factor.rank}>
                <td>{factor.rank}</td>
                <td>{factor.emission_factor}</td>
                <td>{factor.total_co2.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
