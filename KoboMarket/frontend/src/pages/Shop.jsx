
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, qs } from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  Button,
  Card,
  Empty,
  Field,
  Loading,
  PageHead,
  naira,
  act,
  useFetch,
  list,
} from "../components/ui";

const Stars = ({ n = 0 }) => (
  <span className="text-saffron" aria-label={`${n} out of 5`}>
    {"★".repeat(Math.round(n))}
    <span className="text-ink/20">{"★".repeat(5 - Math.round(n))}</span>
  </span>
);

const Img = ({ p, className = "" }) => (
  <div className={`bg-kobo-50 ${className}`}>
    {p.images?.[0] ? (
      <img
        src={p.images[0]}
        alt={p.name}
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full items-center justify-center font-display text-4xl text-kobo-500/40">
        {p.name?.[0]}
      </div>
    )}
  </div>
);

export function Shop() {
  const [f, setF] = useState({
      q: "",
      category: "",
    }),
    [items, setItems] = useState([]),
    [next, setNext] = useState(null),
    [l, setL] = useState(true);

  const fetchPage = async (c, reset = false) => {
    setL(true);

    try {
      const d = await api(
        "/product" +
          qs({
            search: f.q,
            category: f.category,
            page: c || 1,
            limit: 12,
          }),
      );

      const arr = list(d);

      setItems((x) => (reset ? arr : [...x, ...arr]));

      setNext(
        d.pagination?.hasNextPage
          ? d.pagination.page + 1
          : null,
      );
    } catch (e) {
      act(() => {
        throw e;
      });
    }

    setL(false);
  };

  useEffect(() => {
    const t = setTimeout(() => fetchPage(1, true), 300);

    return () => clearTimeout(t);
  }, [f]);

  const set = (k) => (e) =>
    setF((prev) => ({
      ...prev,
      [k]: e.target.value,
    }));

  return (
    <>
      <PageHead
        title="Find something good"
        sub="Every purchase is protected by escrow."
      />

      <Card className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Field
            label="Search"
            placeholder="Sneakers, ankara, phone…"
            value={f.q}
            onChange={set("q")}
          />
        </div>

        <Field
          label="Category"
          value={f.category}
          onChange={set("category")}
        />
      </Card>

      {!items.length && !l ? (
        <Empty
          title="No products match"
          hint="Try a different search or clear the filters."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <Link
              key={p._id}
              to={`/products/${p._id}`}
              className="group overflow-hidden rounded-2xl bg-white ring-1 ring-ink/10 transition hover:ring-kobo-500"
            >
              <Img p={p} className="aspect-square" />

              <div className="p-3">
                <p className="truncate font-medium">{p.name}</p>

                <div className="mt-1 flex items-center justify-between">
                  <span className="font-display font-bold text-kobo-600">
                    {naira(p.priceKobo)}
                  </span>

                  <Stars n={p.averageRating} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {l && <Loading />}

      {next && !l && (
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => fetchPage(next)}
          >
            Load more
          </Button>
        </div>
      )}
    </>
  );
}

export function Product() {
  const { slug } = useParams();
  const { user } = useAuth();

  const {
    data,
    loading,
  } = useFetch(`/product/${slug}`);

  const [q, setQ] = useState(1);

  const p = data?.product || data;

  if (loading) return <Loading />;

  if (!p) return <Empty title="Product not found" />;

  const add = () =>
    act(
      () =>
        api("/cart/add", {
          method: "POST",
          body: {
            productId: p._id,
            quantity: q,
          },
        }),
      "Added to cart",
    );

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Img
        p={p}
        className="aspect-square overflow-hidden rounded-2xl"
      />

      <div>
        <h1 className="text-3xl font-bold">{p.name}</h1>

        <p className="mt-4 font-display text-3xl font-extrabold text-kobo-600">
          {naira(p.priceKobo)}
        </p>

        <p className="mt-4 text-ink/70">
          {p.description}
        </p>

        <p className="mt-4 text-sm text-ink/60">
          {p.stockQuantity > 0
            ? `${p.stockQuantity} in stock`
            : "Out of stock"}
        </p>

        <div className="mt-5 flex gap-3">
          <input
            type="number"
            min="1"
            max={p.stockQuantity}
            value={q}
            onChange={(e) =>
              setQ(
                Math.max(
                  1,
                  Math.min(
                    Number(e.target.value) || 1,
                    p.stockQuantity,
                  ),
                ),
              )
            }
            className="w-20 rounded-lg px-3 ring-1 ring-ink/15"
            aria-label="Quantity"
          />

          <Button
            disabled={
              !user ||
              p.stockQuantity < 1 ||
              q > p.stockQuantity
            }
            onClick={add}
            className="flex-1"
          >
            {user ? "Add to cart" : "Log in to buy"}
          </Button>
        </div>
      </div>
    </div>
  );
}
