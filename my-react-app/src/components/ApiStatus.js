import React, { useEffect, useState } from "react";

export default function ApiStatus({ apiBase }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch(`${apiBase}/api/health`);
        const data = await res.json();
        if (data.ok) setStatus("online");
        else setStatus("offline");
      } catch {
        setStatus("offline");
      }
    };

    checkApi();

    // check every 30 seconds automatically
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, [apiBase]);

  const color = status === "online" ? "green" : status === "offline" ? "red" : "gray";
  const text =
    status === "online" ? "Connected to API" : status === "offline" ? "Offline" : "Checking...";

  return (
    <div
      style={{
        background: "#f9f9f9",
        padding: "6px 12px",
        borderRadius: "10px",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        fontSize: "14px",
        fontWeight: 500,
      }}
    >
      <div
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: color,
        }}
      ></div>
      {text}
    </div>
  );
}
