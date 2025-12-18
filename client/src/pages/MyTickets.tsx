import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tickets, Ticket } from "../data/tickets";

export default function MyTickets() {
  const [activeTab, setActiveTab] = useState<"all" | "new" | "ongoing" | "resolved">("all");
  const [selectedPriority, setSelectedPriority] = useState("All priorities");
  const [selectedTimeframe, setSelectedTimeframe] = useState("This week");
  const [searchQuery, setSearchQuery] = useState("");
  const nav = useNavigate();

  const totals = useMemo(() => {
    const all = tickets.length;
    const New = tickets.filter((t) => t.status === "new").length;
    const ongoing = tickets.filter((t) => t.status === "ongoing").length;
    const resolved = tickets.filter((t) => t.status === "resolved").length;
    return { all, New, ongoing, resolved };
  }, []);

  const filteredTickets = useMemo(() => {
    let list = [...tickets];

    if (activeTab !== "all") {
      list = list.filter((t) => t.status === activeTab);
    }

    if (selectedPriority !== "All priorities") {
      const p = selectedPriority.toLowerCase();
      list = list.filter((t) => (t.priority || "normal").toLowerCase().includes(p));
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    // Timeframe is a placeholder for now (no createdAt on mock data)
    return list;
  }, [activeTab, selectedPriority, searchQuery]);

  const getStatusPillClasses = (status: Ticket["status"]) => {
    switch (status) {
      case "new":
        return "bg-[#EBF5FF] text-[#1D4ED8]";
      case "ongoing":
        return "bg-[#FFF4E5] text-[#D97706]";
      case "resolved":
        return "bg-[#ECFDF5] text-[#15803D]";
      default:
        return "bg-[#F3F4F6] text-[#4B5563]";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-[#414042] font-['Ooredoo-Beta',Arial,sans-serif] font-bold text-2xl">
            My Tickets
          </h1>
          <p className="text-[#808285] font-['Futura',Arial,sans-serif] text-sm">
            View, filter, and manage all tickets assigned to you or your team.
          </p>
        </div>

        <button
          type="button"
          className="px-5 py-2 rounded-full bg-[#ED1C24] hover:bg-[#C41A20] text-white text-sm font-['Ooredoo-Beta',Arial,sans-serif] font-bold shadow-sm flex items-center gap-2"
        >
          <span className="text-lg leading-none">＋</span>
          New Ticket
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-[#E6E7E8] p-4">
          <div className="text-xs uppercase tracking-wide text-[#A6A9AC] mb-1">All</div>
          <div className="text-2xl font-bold text-[#414042]">{totals.all}</div>
        </div>
        <div className="bg-white rounded-lg border border-[#E6E7E8] p-4">
          <div className="text-xs uppercase tracking-wide text-[#A6A9AC] mb-1">New</div>
          <div className="text-2xl font-bold text-[#414042]">{totals.New}</div>
        </div>
        <div className="bg-white rounded-lg border border-[#E6E7E8] p-4">
          <div className="text-xs uppercase tracking-wide text-[#A6A9AC] mb-1">On‑Going</div>
          <div className="text-2xl font-bold text-[#414042]">{totals.ongoing}</div>
        </div>
        <div className="bg-white rounded-lg border border-[#E6E7E8] p-4">
          <div className="text-xs uppercase tracking-wide text-[#A6A9AC] mb-1">Resolved</div>
          <div className="text-2xl font-bold text-[#414042]">{totals.resolved}</div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A6A9AC]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by ticket ID, title, or description"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E6E7E8] rounded-md font-['Futura',Arial,sans-serif] text-sm text-[#414042] placeholder:text-[#A6A9AC] focus:outline-none focus:border-[#ED1C24]"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-[#E6E7E8] rounded-md font-['Futura',Arial,sans-serif] text-sm text-[#414042] focus:outline-none focus:border-[#ED1C24] cursor-pointer bg-white"
          >
            <option>All priorities</option>
            <option>High</option>
            <option>Normal</option>
          </select>

          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-[#E6E7E8] rounded-md font-['Futura',Arial,sans-serif] text-sm text-[#414042] focus:outline-none focus:border-[#ED1C24] cursor-pointer bg-white"
          >
            <option>This week</option>
            <option>This month</option>
            <option>Last 3 months</option>
          </select>
        </div>
      </div>

      {/* Tabs + list */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Tabs */}
        <div className="border-b border-[#E6E7E8] flex items-center px-4 overflow-x-auto">
          {[
            { id: "all", label: "All" },
            { id: "new", label: "New" },
            { id: "ongoing", label: "On‑Going" },
            { id: "resolved", label: "Resolved" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 font-['Futura',Arial,sans-serif] font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-[#ED1C24] text-[#ED1C24]"
                  : "border-transparent text-[#808285] hover:text-[#414042]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tickets grid */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTickets.length === 0 && (
            <div className="col-span-full text-center text-[#808285] text-sm py-10 border border-dashed border-[#E6E7E8] rounded-lg">
              No tickets match your filters.
            </div>
          )}

          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border border-[#E6E7E8] rounded-lg p-4 hover:shadow-sm hover:border-[#ED1C24] transition-colors cursor-pointer bg-white flex flex-col justify-between"
              onClick={() => nav(`/tickets/${ticket.id}`)}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-xs text-[#A6A9AC] font-['Futura',Arial,sans-serif] mb-1">
                      Ticket #{ticket.id}
                    </div>
                    <h3 className="font-['Ooredoo-Beta',Arial,sans-serif] font-bold text-sm text-[#414042]">
                      {ticket.title}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-1 rounded-full text-[11px] font-['Futura',Arial,sans-serif] font-bold ${getStatusPillClasses(
                        ticket.status
                      )}`}
                    >
                      {ticket.status.toUpperCase()}
                    </span>
                    {ticket.priority === "high" && (
                      <span className="px-2 py-1 rounded-full bg-[#FFF0F0] text-[#ED1C24] text-[11px] font-['Futura',Arial,sans-serif] font-bold">
                        HIGH PRIORITY
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[#808285] font-['Futura',Arial,sans-serif] text-xs leading-relaxed mb-3 line-clamp-3">
                  {ticket.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#F1F2F2] mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#ED1C24] flex items-center justify-center text-white text-xs font-['Futura',Arial,sans-serif] font-medium">
                    {ticket.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="text-[#414042] font-['Futura',Arial,sans-serif] text-xs">
                    {ticket.author.name}
                  </div>
                </div>

                <div className="text-[#A6A9AC] font-['Futura',Arial,sans-serif] text-xs">
                  {ticket.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
