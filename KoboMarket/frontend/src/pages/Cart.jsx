
import { useState } from "react";
import { api } from "../api/client";
import {
  Button,
  Card,
  Empty,
  Loading,
  PageHead,
  naira,
  act,
  useFetch,
} from "../components/ui";

export default function Cart() {
  const { data, loading, reload } = useFetch("/cart");
  const [busy, setBusy] = useState({});

  if (loading) return <Loading />;

  const items = data?.items || [];
  const total = data?.totalAmountKobo || 0;

  const upd = async (item, quantity) => {
    const productId = item.product._id;

    setBusy((prev) => ({ ...prev, [productId]: true }));

    await act(() =>
      api(`/cart/${productId}`, {
        method: "PATCH",
        body: { quantity },
      }),
    );

    setBusy((prev) => ({ ...prev, [productId]: false }));

    reload();
  };

  const del = async (item) => {
    const productId = item.product._id;

    setBusy((prev) => ({ ...prev, [productId]: true }));

    await act(() =>
      api(`/cart/${productId}`, {
        method: "DELETE",
      }),
    );

    setBusy((prev) => ({ ...prev, [productId]: false }));

    reload();
  };

  return (
    <>
      <PageHead
        title="Your cart"
        sub="Prices and availability are checked against current stock."
      />

      {!items.length ? (
        <Empty
          title="Your cart is empty"
          hint="Add something from the shop."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {items.map((item) => {
              const product = item.product;
              const productId = product._id;

              return (
                <Card
                  key={productId}
                  className="flex flex-wrap items-center gap-4"
                >
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {product.name}
                    </p>

                    <p className="text-sm text-ink/60">
                      {naira(product.priceKobo)} each
                    </p>

                    {!item.available && (
                      <p className="mt-1 text-sm text-red-600">
                        {item.availabilityMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className="!px-3"
                      disabled={
                        busy[productId] ||
                        !item.available
                      }
                      onClick={() =>
                        item.quantity > 1
                          ? upd(item, item.quantity - 1)
                          : del(item)
                      }
                    >
                      −
                    </Button>

                    <span className="w-6 text-center">
                      {item.quantity}
                    </span>

                    <Button
                      variant="ghost"
                      className="!px-3"
                      disabled={
                        busy[productId] ||
                        !item.available ||
                        item.quantity >= product.stockQuantity
                      }
                      onClick={() =>
                        upd(item, item.quantity + 1)
                      }
                    >
                      +
                    </Button>
                  </div>

                  <p className="w-28 text-right font-display font-bold">
                    {naira(item.subtotalKobo)}
                  </p>

                  <button
                    onClick={() => del(item)}
                    disabled={busy[productId]}
                    className="text-ink/40 hover:text-red-600"
                    aria-label={`Remove ${product.name}`}
                  >
                    ✕
                  </button>
                </Card>
              );
            })}
          </div>

          <Card className="h-fit">
            <p className="text-ink/60">Total</p>

            <p className="font-display text-3xl font-extrabold">
              {naira(total)}
            </p>

            <p className="mb-4 mt-2 text-xs text-ink/60">
              Your total includes only products currently available
              for purchase.
            </p>

            <Button
              disabled
              className="w-full"
            >
              Checkout coming soon
            </Button>
          </Card>
        </div>
      )}
    </>
  );
}
