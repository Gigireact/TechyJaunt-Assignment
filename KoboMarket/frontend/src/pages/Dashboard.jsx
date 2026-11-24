
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, has } = useAuth();

  const firstName = user?.firstName || "there";

  const sections = [
    {
      title: "My Orders",
      description: "Track and manage your purchases.",
      link: "/orders",
      icon: "📦",
    },
    {
      title: "My Wallet",
      description: "View your wallet and transactions.",
      link: "/wallet",
      icon: "💳",
    },
    {
      title: "My Cart",
      description: "Continue shopping with items in your cart.",
      link: "/cart",
      icon: "🛒",
    },
    {
      title: "Shop Products",
      description: "Discover products from our vendors.",
      link: "/",
      icon: "🛍️",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-kobo-700 p-8 text-white">
        <p className="text-sm text-kobo-100">
          Your KoboMarket account
        </p>

        <h1 className="mt-3 text-3xl font-extrabold">
          Welcome back, {firstName}!
        </h1>

        <p className="mt-3 max-w-xl text-kobo-100">
          Manage your orders, explore products, and keep track of
          your shopping activities all in one place.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-kobo-700 hover:bg-kobo-100"
        >
          Explore products
        </Link>
      </section>

      <section>
        <h2 className="text-xl font-bold">Your account</h2>
        <p className="mt-1 text-sm text-ink/60">
          Everything you need to manage your KoboMarket experience.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.title}
              to={section.link}
              className="rounded-xl border border-ink/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-3xl">{section.icon}</span>

              <h3 className="mt-4 font-bold">
                {section.title}
              </h3>

              <p className="mt-2 text-sm text-ink/60">
                {section.description}
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-kobo-600">
                View details →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-ink/10 p-6">
        <h2 className="font-bold">Account information</h2>

        <div className="mt-4 space-y-2 text-sm">
          <p>
            <span className="font-semibold">Name:</span>{" "}
            {user?.firstName} {user?.lastName}
          </p>

          <p>
            <span className="font-semibold">Email:</span>{" "}
            {user?.email}
          </p>

          <p>
            <span className="font-semibold">Account status:</span>{" "}
            <span className="font-semibold text-green-600">
              Verified
            </span>
          </p>
        </div>
      </section>

      {has("vendor") && (
        <Link
          to="/vendor"
          className="block rounded-xl border border-ink/10 p-5 font-semibold hover:bg-kobo-50"
        >
          Manage your vendor account →
        </Link>
      )}

      {has("admin") && (
        <Link
          to="/admin"
          className="block rounded-xl border border-ink/10 p-5 font-semibold hover:bg-kobo-50"
        >
          Open admin dashboard →
        </Link>
      )}
    </div>
  );
}
