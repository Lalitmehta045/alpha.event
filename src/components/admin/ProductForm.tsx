"use client";
import { useState } from "react";

export default function ProductForm({ initial }: { initial?: any }) {
  const [data, setData] = useState(
    initial ?? { name: "", price: 0, images: [] as string[] }
  );

  async function uploadToS3(file: File) {
    const presign = await fetch(
      "/api/upload/presign?filename=" + encodeURIComponent(file.name)
    );
    const { url, fields } = await presign.json();
    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => form.append(k, v as string));
    form.append("file", file);
    await fetch(url, { method: "POST", body: form });
    return `${url}/${fields.key}`;
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const method = initial ? "PUT" : "POST";
        const endpoint = initial
          ? "/api/admin/products/" + initial._id
          : "/api/admin/products";
        await fetch(endpoint, { method, body: JSON.stringify(data) });
        window.location.href = "/admin/products";
      }}
      className="space-y-4"
    >
      <div className="grid gap-1">
        <label className="text-sm">Name</label>
        <input
          className="border rounded-lg p-2"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          required
        />
      </div>

      <div className="grid gap-1">
        <label className="text-sm">Price</label>
        <input
          type="number"
          className="border rounded-lg p-2"
          value={data.price}
          onChange={(e) => setData({ ...data, price: Number(e.target.value) })}
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm">Images</label>
        <input
          type="file"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const url = await uploadToS3(f);
            setData((d: any) => ({ ...d, images: [...d.images, url] }));
          }}
        />
        <div className="flex gap-2 flex-wrap">
          {data.images.map((src: string) => (
            <img
              key={src}
              src={src}
              className="w-20 h-20 rounded object-cover border"
            />
          ))}
        </div>
      </div>

      <button className="px-4 py-2 rounded-lg bg-black text-white">
        {initial ? "Update" : "Create"}
      </button>
    </form>
  );
}
