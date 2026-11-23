import { useState } from "react";
import { api, qs } from "../api/client";
import {
  Badge,
  Button,
  Card,
  Empty,
  Field,
  Loading,
  Modal,
  PageHead,
  Select,
  naira,
  act,
  useFetch,
  list,
} from "../components/ui";

const Tabs = ({ tabs, v, set }) => (
  <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-ink/5 p-1">
    {tabs.map((t) => (
      <button
        key={t}
        onClick={() => set(t)}
        className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${v === t ? "bg-white shadow-sm" : "text-ink/60"}`}
      >
        {t}
      </button>
    ))}
  </div>
);


function VendorApplications() {
  const { data, loading, reload } = useFetch("/admin/vendors/pending");
  const [busy, setBusy] = useState({});
  const [rejectionReasons, setRejectionReasons] = useState({});

  const applications = data?.applications || [];

  const approve = async (application) => {
    const id = application._id;

    setBusy((prev) => ({ ...prev, [id]: true }));

    const result = await act(
      () =>
        api(`/admin/vendors/${id}/approve`, {
          method: "PATCH",
        }),
      "Vendor application approved"
    );

    setBusy((prev) => ({ ...prev, [id]: false }));

    if (result) reload();
  };

  const reject = async (application) => {
    const id = application._id;
    const rejectionReason = rejectionReasons[id]?.trim();

    if (!rejectionReason) {
      return act(
        () => Promise.reject(new Error("Please provide a rejection reason"))
      );
    }

    setBusy((prev) => ({ ...prev, [id]: true }));

    const result = await act(
      () =>
        api(`/admin/vendors/${id}/reject`, {
          method: "PATCH",
          body: { rejectionReason },
        }),
      "Vendor application rejected"
    );

    setBusy((prev) => ({ ...prev, [id]: false }));

    if (result) reload();
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Vendor applications</h2>
          <p className="text-sm text-ink/60">
            Review and manage applications from prospective vendors.
          </p>
        </div>

        <Badge>{applications.length} pending</Badge>
      </div>

      {!applications.length ? (
        <Empty
          title="No pending applications"
          hint="New vendor applications will appear here."
        />
      ) : (
        <div className="space-y-3">
          {applications.map((application) => {
            const applicant = application.user;
            const id = application._id;

            return (
              <Card key={id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg">
                      {application.storeName}
                    </h3>

                    <p className="text-sm text-ink/60">
                      {applicant?.firstName} {applicant?.lastName}
                    </p>

                    <p className="text-sm text-ink/60">
                      {applicant?.email}
                    </p>

                    <p className="mt-3 text-sm">
                      {application.description}
                    </p>

                    <p className="mt-2 text-xs text-ink/50">
                      Applied:{" "}
                      {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Badge>Pending</Badge>
                </div>

                <div className="mt-5 space-y-3">
                  <Field
                    label="Reason for rejection (required to reject)"
                    value={rejectionReasons[id] || ""}
                    onChange={(e) =>
                      setRejectionReasons((prev) => ({
                        ...prev,
                        [id]: e.target.value,
                      }))
                    }
                    placeholder="Explain why this application is being rejected"
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={!!busy[id]}
                      onClick={() => approve(application)}
                    >
                      {busy[id] ? "Processing..." : "Approve application"}
                    </Button>

                    <Button
                      variant="danger"
                      disabled={!!busy[id] || !rejectionReasons[id]?.trim()}
                      onClick={() => reject(application)}
                    >
                      Reject application
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Ledger({ id, close }) {
  const { data, loading } = useFetch(
    id ? `/admin/wallets/${id}/ledger` : "/admin/wallets/none/ledger",
    [id],
  );
  return (
    <Modal open={!!id} onClose={close} title="Wallet ledger">
      {loading ? (
        <Loading />
      ) : (
        <div className="max-h-80 divide-y divide-ink/10 overflow-y-auto">
          {list(data).map((e) => (
            <div key={e.id} className="flex justify-between py-2 text-sm">
              <span>
                {e.direction} ·{" "}
                {new Date(e.createdAt || e.created_at).toLocaleDateString()}
              </span>
              <b>{naira(e.amountKobo ?? e.amount_kobo)}</b>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
function Disputes() {
  const { data, loading, reload } = useFetch("/disputes"),
    [d, setD] = useState(null),
    [f, setF] = useState({
      resolution: "FULL_REFUND",
      buyerAmount: "",
      note: "",
    });
  const go = async (e) => {
    e.preventDefault();
    const body = {
      resolution: f.resolution,
      note: f.note,
      ...(f.resolution === "PARTIAL_REFUND" && {
        buyerAmountKobo: Math.round(f.buyerAmount * 100),
      }),
    };
    (await act(
      () =>
        api(`/disputes/${d.id}/resolve`, { method: "PATCH", body }).then(
          () => true,
        ),
      "Dispute resolved",
    )) && (setD(null), reload());
  };
  if (loading) return <Loading />;
  return (
    <>
      {!list(data).length ? (
        <Empty title="No disputes" />
      ) : (
        <div className="space-y-3">
          {list(data).map((x) => (
            <Card key={x.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{x.reason}</p>
                  <p className="text-sm text-ink/60">
                    Escrow held: {naira(x.amountKobo ?? x.amount_kobo)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge s={x.status} />
                  {x.status === "OPEN" && (
                    <Button onClick={() => setD(x)}>Resolve</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={!!d} onClose={() => setD(null)} title="Resolve dispute">
        <form onSubmit={go} className="space-y-3">
          <Select
            label="Outcome"
            value={f.resolution}
            onChange={(e) => setF({ ...f, resolution: e.target.value })}
          >
            <option value="FULL_REFUND">Full refund to buyer</option>
            <option value="PARTIAL_REFUND">Partial refund</option>
            <option value="REJECT">Reject (release to vendor)</option>
          </Select>
          {f.resolution === "PARTIAL_REFUND" && (
            <Field
              label="Amount to buyer (₦)"
              type="number"
              min="1"
              required
              value={f.buyerAmount}
              onChange={(e) => setF({ ...f, buyerAmount: e.target.value })}
            />
          )}
          <Field
            label="Resolution note"
            required
            value={f.note}
            onChange={(e) => setF({ ...f, note: e.target.value })}
          />
          <Button className="w-full">Confirm resolution</Button>
        </form>
      </Modal>
    </>
  );
}
function Reports() {
  const [r, setR] = useState({
    from: new Date(Date.now() - 6048e5).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
  });
  const rev = useFetch("/admin/reports/revenue" + qs(r)),
    top = useFetch("/admin/reports/top-vendors"),
    esc = useFetch("/admin/reports/escrow"),
    rec = useFetch("/admin/reports/reconciliation");
  const mism = list(rec.data),
    max = Math.max(
      1,
      ...list(rev.data).map((x) => x.revenueKobo ?? x.revenue_kobo ?? 0),
    );
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <p className="text-ink/60">Money held in escrow</p>
        <p className="font-display text-3xl font-extrabold">
          {naira(esc.data?.totalKobo ?? esc.data?.total_kobo)}
        </p>
      </Card>
      <Card className={mism.length ? "ring-red-500" : ""}>
        <p className="text-ink/60">Ledger reconciliation</p>
        <p
          className={`font-display text-3xl font-extrabold ${mism.length ? "text-red-600" : "text-kobo-600"}`}
        >
          {mism.length ? `${mism.length} mismatched` : "All balanced"}
        </p>
      </Card>
      <Card>
        <div className="mb-4 flex items-end gap-2">
          <h3 className="mr-auto font-bold">Revenue by day</h3>
          <Field
            label="From"
            type="date"
            value={r.from}
            onChange={(e) => setR({ ...r, from: e.target.value })}
          />
          <Field
            label="To"
            type="date"
            value={r.to}
            onChange={(e) => setR({ ...r, to: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          {list(rev.data).map((x) => {
            const v = x.revenueKobo ?? x.revenue_kobo ?? 0;
            return (
              <div key={x.day} className="flex items-center gap-2 text-sm">
                <span className="w-20 text-ink/60">
                  {String(x.day).slice(5, 10)}
                </span>
                <div className="h-3 flex-1 rounded bg-ink/5">
                  <div
                    className="h-3 rounded bg-kobo-500"
                    style={{ width: `${(v / max) * 100}%` }}
                  />
                </div>
                <b className="w-24 text-right">{naira(v)}</b>
              </div>
            );
          })}
        </div>
      </Card>
      <Card>
        <h3 className="mb-3 font-bold">Top vendors this month</h3>
        {list(top.data).map((v, i) => (
          <div
            key={i}
            className="flex justify-between border-b border-ink/10 py-2 text-sm last:border-0"
          >
            <span>
              {i + 1}. {v.name || v.vendorId}
            </span>
            <b>{naira(v.salesKobo ?? v.sales_kobo)}</b>
          </div>
        ))}
      </Card>
    </div>
  );
}
function Settings() {
  const { data } = useFetch("/admin/settings/commission"),
    [v, setV] = useState("");
  return (
    <Card className="max-w-sm">
      <h3 className="mb-3 font-bold">Platform commission</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          act(
            () =>
              api("/admin/settings/commission", {
                method: "PATCH",
                body: { rate: +v },
              }),
            "Commission updated",
          );
        }}
        className="space-y-3"
      >
        <Field
          label={`Rate in % (current: ${data?.rate ?? "—"})`}
          type="number"
          min="0"
          max="50"
          step="0.1"
          required
          value={v}
          onChange={(e) => setV(e.target.value)}
        />
        <Button>Save rate</Button>
      </form>
    </Card>
  );
}

export default function Admin() {
  const [t, setT] = useState("vendors");

  const P = {
    vendors: VendorApplications,
  }[t];

  return (
    <>
      <PageHead
        title="Admin"
        sub="Manage vendor applications and platform operations."
      />

      <Tabs
        tabs={["vendors"]}
        v={t}
        set={setT}
      />

      <P />
    </>
  );
}
