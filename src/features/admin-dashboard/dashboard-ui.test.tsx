import { Bike, PackageCheck } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AdminDashboardLoading from "@/app/admin/(dashboard)/loading";

import { DashboardEmptyState } from "./empty-state";
import { KpiCard } from "./kpi-card";

describe("admin dashboard UI", () => {
  it("renders KPI semantics without requiring client JavaScript", () => {
    const html = renderToStaticMarkup(
      <KpiCard
        description="Public katalog"
        icon={PackageCheck}
        label="Active products"
        value="12"
      />,
    );

    expect(html).toContain("<article");
    expect(html).toContain("Active products");
    expect(html).toContain("12");
  });

  it("renders a meaningful empty state", () => {
    const html = renderToStaticMarkup(
      <DashboardEmptyState
        description="Hali yozuv mavjud emas."
        icon={Bike}
        title="Ma’lumot yo‘q"
      />,
    );

    expect(html).toContain("Ma’lumot yo‘q");
    expect(html).toContain("Hali yozuv mavjud emas.");
  });

  it("keeps loading grids responsive across mobile and wide screens", () => {
    const html = renderToStaticMarkup(<AdminDashboardLoading />);

    expect(html).toContain("sm:grid-cols-2");
    expect(html).toContain("xl:grid-cols-4");
    expect(html).toContain('aria-busy="true"');
  });
});
