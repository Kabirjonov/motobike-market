// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCartStore } from "@/stores/cart-store";

import { CheckoutForm } from "./checkout-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("checkout form errors", () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [
        {
          productId: "p1",
          name: "QA",
          sku: "QA-1",
          price: "100.00",
          quantity: 1,
          stock: 2,
        },
      ],
    });
  });

  it("announces a server validation error without clearing cart", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: { message: "Checkout rejected" } }),
      }),
    );
    const { container } = render(<CheckoutForm />);
    fireEvent.submit(container.querySelector("form")!);
    expect(await screen.findByText("Checkout rejected")).toHaveAttribute(
      "aria-live",
      "assertive",
    );
    expect(useCartStore.getState().items).toHaveLength(1);
    vi.unstubAllGlobals();
  });
});
