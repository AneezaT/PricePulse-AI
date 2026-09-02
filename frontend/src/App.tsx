import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TrendingUp,
  Package,
  Clock,
  RefreshCw,
  PlusCircle,
  Activity,
  Sparkles,
  ArrowUpRight,
  Download,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

interface Product {
  id: number;
  name: string;
  base_price: number;
  current_price: number;
  competitor_price: number | null;
  inventory_age_days: number;
  suggested_price: number | null;
}
const API_BASE_URL = "https://pricepulse-ai-3b32.onrender.com";
export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [ageDays, setAgeDays] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  const [ageThreshold, setAgeThreshold] = useState(30);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<any>(null);

  // Dynamic Chart Data State
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchAnalyticsTrends();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/products/");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching products", err);
      setProducts([]);
    }
  };

  const fetchAnalyticsTrends = async () => {
    try {
      const res = await axios.get("${API_BASE_URL}/analytics/trends/");
      if (res.data && res.data.length > 0) {
        setChartData(res.data);
      } else {
        setChartData([{ name: "No Data", BasePrice: 0, AIPrice: 0, Competitor: 0 }]);
      }
    } catch (err) {
      console.error("Error fetching analytics trends", err);
    }
  };

  const handleBulkReprice = async () => {
    try {
      setLoading(true);
      const res = await axios.post("${API_BASE_URL}/bulk-reprice/?threshold_days=30");
      showToast(res?.data?.message || "Bulk reprice executed successfully");
      fetchProducts();
      fetchAnalyticsTrends();
    } catch (err) {
      console.error("Error during bulk reprice", err);
      alert("Failed to execute bulk repricing.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchAiInsights = async (productId: number) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai-insights/${productId}`);
      setAiInsight(response.data);
      showToast("AI Strategic Insights generated successfully!");
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      alert("Failed to fetch AI insights.");
    }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !basePrice || !ageDays) return;

    try {
      setLoading(true);
      const res = await axios.post("${API_BASE_URL}/products/", {
        name: name,
        base_price: parseFloat(basePrice),
        inventory_age_days: parseInt(ageDays, 10),
      });
      
      const newProduct = res.data?.product || res.data;
      if (newProduct) {
        setProducts((prev) => [...(Array.isArray(prev) ? prev : []), newProduct]);
      }
      setName("");
      setBasePrice("");
      setAgeDays("");
      showToast(`Successfully added SKU: ${name}`);
      fetchAnalyticsTrends();
    } catch (err) {
      console.error("Error adding product", err);
      alert("Failed to add product. Check FastAPI terminal logs.");
    } finally {
      setLoading(false);
    }
  };

  const calculateDynamicPrice = async (id: number) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/calculate-price/${id}`);
      setProducts((prev) =>
        (Array.isArray(prev) ? prev : []).map((item) =>
          item.id === id
            ? {
                ...item,
                competitor_price: res.data?.competitor_price ?? item.competitor_price,
                suggested_price: res.data?.ai_suggested_price ?? item.suggested_price,
              }
            : item
        )
      );
      showToast(`AI Pricing completed for SKU #${id}!`);
      fetchAnalyticsTrends();
    } catch (err) {
      console.error("Error calculating dynamic price", err);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "pricepulse_report.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Analytics Report Exported Successfully!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8 px-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h1 className="font-bold text-lg tracking-wide">PricePulse AI</h1>
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Activity className="w-4 h-4" /> Live Dashboard
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "inventory"
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Package className="w-4 h-4" /> Catalog & Rules
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "analytics"
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Market Analytics
            </button>
          </nav>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs text-slate-400">Engine Status</span>
          </div>
          <p className="text-xs font-semibold text-slate-200">FastAPI Backend Active</p>
          <button
            onClick={exportReport}
            className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-1.5 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" /> Export Report
          </button>
          <button
            onClick={handleBulkReprice}
            className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-1.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Run Bulk Reprice
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Pricing Automation Console</h2>
            <p className="text-xs text-slate-400">Independent e-commerce store optimization & AI markdown engine</p>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-indigo-400">
              <CheckCircle2 className="w-5 h-5 text-indigo-200" />
              <span className="text-sm font-medium">{toastMessage}</span>
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                  <p className="text-xs font-medium text-slate-400">Total SKUs Tracked</p>
                  <h3 className="text-2xl font-bold mt-2 text-slate-100">{products.length}</h3>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                  <p className="text-xs font-medium text-slate-400">Aging Stock Alert</p>
                  <h3 className="text-2xl font-bold mt-2 text-slate-100">
                    {products.filter((p) => p.inventory_age_days > ageThreshold).length}
                  </h3>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                  <p className="text-xs font-medium text-slate-400">AI Margin Optimized</p>
                  <h3 className="text-2xl font-bold mt-2 text-slate-100">
                    {products.filter((p) => p.suggested_price !== null).length} SKUs
                  </h3>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                  <p className="text-xs font-medium text-slate-400">Engine Efficiency</p>
                  <h3 className="text-2xl font-bold mt-2 text-slate-100">99.4%</h3>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-base font-semibold text-slate-100 mb-4">Price Adaptation Curve (Live Database Trend)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }} />
                      <Area type="monotone" dataKey="Competitor" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                      <Area type="monotone" dataKey="AIPrice" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-base font-semibold text-slate-100 mb-4">Register New Product SKU</h3>
                <form onSubmit={addProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Base Price (Rs.)"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Inventory Age (Days)"
                    value={ageDays}
                    onChange={(e) => setAgeDays(e.target.value)}
                    className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Product
                  </button>
                </form>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                  <h3 className="text-base font-semibold text-slate-100">Catalog Inventory & Dynamic Pricing</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                        <th className="px-6 py-3.5 font-medium">SKU ID</th>
                        <th className="px-6 py-3.5 font-medium">Product Name</th>
                        <th className="px-6 py-3.5 font-medium">Base Price</th>
                        <th className="px-6 py-3.5 font-medium">Competitor Price</th>
                        <th className="px-6 py-3.5 font-medium">Inventory Age</th>
                        <th className="px-6 py-3.5 font-medium">AI Suggested Price</th>
                        <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                            No active SKUs found or backend is syncing...
                          </td>
                        </tr>
                      ) : (
                        products.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-800/30 transition">
                            <td className="px-6 py-4 font-mono text-slate-400">#{item.id}</td>
                            <td className="px-6 py-4 font-medium text-slate-200">{item.name}</td>
                            <td className="px-6 py-4 text-slate-300">Rs. {item.base_price}</td>
                            <td className="px-6 py-4">
                              {item.competitor_price ? (
                                <span className="text-amber-400 font-medium">Rs. {item.competitor_price}</span>
                              ) : (
                                <span className="text-slate-600">Pending</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.inventory_age_days > ageThreshold ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {item.inventory_age_days} Days
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {item.suggested_price ? (
                                <span className="text-indigo-400 font-bold">Rs. {item.suggested_price}</span>
                              ) : (
                                <span className="text-slate-600">Not Calculated</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => calculateDynamicPrice(item.id)}
                                className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 px-3 py-1.5 rounded-lg text-xs font-medium transition border border-indigo-500/30"
                              >
                                Re-price
                              </button>
                              <button
                                onClick={() => fetchAiInsights(item.id)}
                                className="bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 px-3 py-1.5 rounded-lg text-xs font-medium transition border border-purple-500/30"
                              >
                                AI Insight
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {aiInsight && (
                <div className="bg-slate-900 border border-purple-500/30 p-6 rounded-2xl shadow-lg relative">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold text-purple-300 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" /> AI Strategic Insights for SKU #{aiInsight.product_id} ({aiInsight.product_name})
                    </h3>
                    <button onClick={() => setAiInsight(null)} className="text-slate-400 hover:text-white text-sm">✕ Close</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <p className="text-slate-400 text-xs">Market Trend</p>
                      <p className="font-semibold text-slate-200 mt-1">{aiInsight.market_trend}</p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <p className="text-slate-400 text-xs">Recommended Action</p>
                      <p className="font-semibold text-emerald-400 mt-1">{aiInsight.recommended_action}</p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <p className="text-slate-400 text-xs">Projected Revenue Boost</p>
                      <p className="font-semibold text-indigo-400 mt-1">{aiInsight.projected_revenue_boost}</p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <p className="text-slate-400 text-xs">Confidence Score</p>
                      <p className="font-semibold text-purple-400 mt-1">{aiInsight.confidence_score}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-base font-semibold text-slate-100 mb-2">Market Competitor Benchmark</h3>
                <p className="text-xs text-slate-400 mb-6">Real-time comparison across active product lines</p>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }} />
                      <Bar dataKey="BasePrice" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="AIPrice" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Competitor" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}