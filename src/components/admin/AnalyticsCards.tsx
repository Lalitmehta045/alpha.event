export default function Cards() {
  const stats = [
    { label: "Revenue", value: "₹1,24,500" },
    { label: "Orders", value: "342" },
    { label: "Users", value: "1,238" },
    { label: "Conversion", value: "3.8%" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border bg-white p-4">
          <div className="text-sm text-gray-500">{s.label}</div>
          <div className="text-xl font-semibold">{s.value}</div>
        </div>
      ))}
    </div>
  );
}
