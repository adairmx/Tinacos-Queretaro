import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  Users, 
  PhoneCall, 
  MessageSquare, 
  MapPin, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Send, 
  Plus,
  RefreshCw,
  ArrowLeft,
  Search,
  ExternalLink,
  FlaskConical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AdminGate from "@/components/AdminGate";
import ExperimentResults from "@/components/ExperimentResults";
import { adminFetch } from "@/lib/adminAuth";
import type { Lead, Provider } from "@shared/schema";

function AdminLeadsDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"leads" | "providers" | "experiment">("leads");
  const [cityFilter, setCityFilter] = useState<string>("todas");
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const { data: leads = [], isLoading: loadingLeads } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const res = await adminFetch("/api/leads");
      if (!res.ok) throw new Error("Error fetching leads");
      return res.json();
    },
  });

  const { data: providers = [], isLoading: loadingProviders } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
    queryFn: async () => {
      const res = await adminFetch("/api/providers");
      if (!res.ok) throw new Error("Error fetching providers");
      return res.json();
    },
  });

  // Mutations
  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Lead> }) => {
      const res = await adminFetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Error al actualizar lead");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Lead actualizado" });
    },
  });

  const updateProviderMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Provider> }) => {
      const res = await adminFetch(`/api/providers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Error al actualizar proveedor");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({ title: "Proveedor actualizado" });
    },
  });

  // Métricas rápidas
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "nuevo").length;
  const completedLeads = leads.filter((l) => l.status === "completado").length;
  const estimatedRevenue = leads
    .filter((l) => l.status !== "cancelado")
    .reduce((acc, l) => acc + (l.estimatedPrice || 0), 0);
  const estimatedMargin = leads
    .filter((l) => l.status !== "cancelado")
    .reduce((acc, l) => acc + (l.commissionAmount || 0), 0);

  // Filtrado de leads
  const filteredLeads = leads.filter((l) => {
    const matchesCity = cityFilter === "todas" || l.city.toLowerCase().includes(cityFilter.toLowerCase());
    const matchesSearch = 
      l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.clientPhone.includes(searchQuery) ||
      (l.addressColonia || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  // Filtrado de proveedores
  const filteredProviders = providers.filter((p) => {
    const matchesCity = cityFilter === "todas" || p.city.toLowerCase().includes(cityFilter.toLowerCase());
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      (p.coverageAreas || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  // Enviar orden de trabajo al técnico por WhatsApp
  const handleSendToProviderWhatsApp = (lead: Lead, provider: Provider) => {
    const cleanPhone = provider.phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("52") ? cleanPhone : `52${cleanPhone}`;

    const text = encodeURIComponent(
      `🔔 *NUEVA ORDEN DE SERVICIO ASIGNADA*\n\n` +
      `Hola *${provider.name}*, te pasamos un nuevo servicio listo para agendar:\n\n` +
      `👤 *Cliente:* ${lead.clientName}\n` +
      `📞 *Teléfono Cliente:* ${lead.clientPhone}\n` +
      `📍 *Ciudad:* ${lead.city}\n` +
      `🏡 *Colonia/Dirección:* ${lead.addressColonia || "Por coordinar con el cliente"}\n` +
      `💧 *Servicio:* ${lead.serviceType.toUpperCase()}\n` +
      `💵 *Total a cobrar al cliente:* $${lead.estimatedPrice} MXN\n` +
      `💰 *Tu mano de obra acordada:* $${lead.providerPayout || Math.round((lead.estimatedPrice || 0) * 0.7)} MXN\n` +
      `🏢 *Comisión plataforma:* $${lead.commissionAmount || Math.round((lead.estimatedPrice || 0) * 0.3)} MXN\n\n` +
      `Por favor comunícate de inmediato con el cliente para confirmar la cita y avísanos cuando quede agendada. ¡Mucho éxito!`
    );

    window.open(`https://wa.me/${formattedPhone}?text=${text}`, "_blank");

    // Marcar como asignado automáticamente
    updateLeadMutation.mutate({
      id: lead.id,
      updates: {
        status: "asignado",
        assignedProviderId: provider.id,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Volver al sitio
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-black text-slate-900">
              Panel de Control de Leads y Red Nacional
            </h1>
            <p className="text-sm text-slate-500">
              Gestión operativa de llamadas, WhatsApp y técnicos asignados
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
                queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
                toast({ title: "Datos actualizados" });
              }}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Refrescar
            </Button>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Link to="/unete" target="_blank">
                <Plus className="h-4 w-4" /> Link Afiliación Técnicos
              </Link>
            </Button>
          </div>
        </div>

        {/* Métricas Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prospectos Totales</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{totalLeads}</div>
            <span className="text-xs text-blue-600 font-semibold">{newLeads} nuevos por atender</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Técnicos en Red</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{providers.length}</div>
            <span className="text-xs text-green-600 font-semibold">Querétaro, CDMX, GDL</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Facturación Bruta Est.</span>
            <div className="text-3xl font-black text-primary mt-1">
              ${estimatedRevenue.toLocaleString("es-MX")}
            </div>
            <span className="text-xs text-slate-500">De servicios gestionados</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comisión Neta Est. (30%)</span>
            <div className="text-3xl font-black text-green-600 mt-1">
              ${estimatedMargin.toLocaleString("es-MX")}
            </div>
            <span className="text-xs text-green-600 font-semibold">Margen pasivo de plataforma</span>
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border shadow-xs">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("experiment")}
              className={`order-last px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "experiment"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FlaskConical className="h-4 w-4" />
              Prueba A/B
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "leads"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <PhoneCall className="h-4 w-4" />
              Prospectos ({leads.length})
            </button>
            <button
              onClick={() => setActiveTab("providers")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "providers"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Users className="h-4 w-4" />
              Técnicos y Cuadrillas ({providers.length})
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
            </div>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus-visible:outline-none"
            >
              <option value="todas">Todas las Ciudades</option>
              <option value="querétaro">Querétaro</option>
              <option value="ciudad de méxico">CDMX</option>
              <option value="guadalajara">Guadalajara / Zapopan</option>
            </select>
          </div>
        </div>

        {activeTab === "experiment" && <ExperimentResults />}

        {/* CONTENIDO TAB 1: LEADS */}
        {activeTab === "leads" && (
          <div className="bg-white rounded-2xl border shadow-xs overflow-hidden">
            <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">
                Lista de Prospectos Recibidos (Voz Phonica / WhatsApp / Web)
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Mostrando {filteredLeads.length} leads
              </span>
            </div>

            {loadingLeads ? (
              <div className="p-12 text-center text-slate-500">Cargando leads...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <p className="font-bold text-lg">No hay prospectos con los filtros actuales</p>
                <p className="text-sm">Los leads de Phonica, bot de WhatsApp y la web aparecerán aquí en tiempo real.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-500 border-b">
                    <tr>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Ubicación</th>
                      <th className="p-4">Servicio / Tarifa</th>
                      <th className="p-4">Origen</th>
                      <th className="p-4">Estatus</th>
                      <th className="p-4">Técnico Asignado</th>
                      <th className="p-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.map((lead) => {
                      const assignedProv = providers.find((p) => p.id === lead.assignedProviderId);
                      const cityProvs = providers.filter((p) => 
                        p.city.toLowerCase().includes(lead.city.toLowerCase()) ||
                        lead.city.toLowerCase().includes(p.city.toLowerCase())
                      );

                      return (
                        <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{lead.clientName}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <a
                                href={`tel:${lead.clientPhone}`}
                                className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                              >
                                <PhoneCall className="h-3 w-3" /> {lead.clientPhone}
                              </a>
                              <a
                                href={`https://wa.me/52${lead.clientPhone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-green-600 hover:underline flex items-center gap-1"
                              >
                                <MessageSquare className="h-3 w-3" /> WhatsApp
                              </a>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="font-medium text-slate-800 flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-accent" /> {lead.city}
                            </div>
                            <div className="text-xs text-slate-500">
                              {lead.addressColonia || "Colonia pendiente"}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-slate-900 capitalize">{lead.serviceType}</div>
                            <div className="text-xs text-slate-500 font-medium">
                              Cobro: <span className="text-primary font-bold">${lead.estimatedPrice}</span> | 
                              Comisión: <span className="text-green-600 font-bold">${lead.commissionAmount}</span>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                              {lead.source}
                            </span>
                          </td>

                          <td className="p-4">
                            <select
                              value={lead.status}
                              onChange={(e) =>
                                updateLeadMutation.mutate({
                                  id: lead.id,
                                  updates: { status: e.target.value },
                                })
                              }
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                                lead.status === "nuevo"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : lead.status === "asignado"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : lead.status === "completado"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              <option value="nuevo">Nuevo</option>
                              <option value="asignado">Asignado</option>
                              <option value="agendado">Agendado</option>
                              <option value="completado">Completado</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          </td>

                          <td className="p-4">
                            <select
                              value={lead.assignedProviderId || ""}
                              onChange={(e) => {
                                const provId = e.target.value ? Number(e.target.value) : null;
                                updateLeadMutation.mutate({
                                  id: lead.id,
                                  updates: { assignedProviderId: provId },
                                });
                              }}
                              className="text-xs p-1.5 rounded-lg border border-slate-200 bg-white max-w-[180px] font-medium"
                            >
                              <option value="">-- Sin Asignar --</option>
                              {(cityProvs.length > 0 ? cityProvs : providers).map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.city})
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-4 text-right">
                            {assignedProv ? (
                              <Button
                                size="sm"
                                onClick={() => handleSendToProviderWhatsApp(lead, assignedProv)}
                                className="bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold gap-1.5 h-8"
                              >
                                <Send className="h-3 w-3" /> Mandar a Técnico
                              </Button>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Asigna técnico para mandar</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO TAB 2: PROVEEDORES */}
        {activeTab === "providers" && (
          <div className="bg-white rounded-2xl border shadow-xs overflow-hidden">
            <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">
                Red de Técnicos y Prospectos por Ciudad (Para llamarles y afiliar)
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {filteredProviders.length} proveedores registrados
              </span>
            </div>

            {loadingProviders ? (
              <div className="p-12 text-center text-slate-500">Cargando técnicos...</div>
            ) : filteredProviders.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No hay proveedores encontrados</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredProviders.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-card hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-slate-900 text-base leading-snug">{p.name}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            p.status === "activo"
                              ? "bg-green-100 text-green-700"
                              : p.status === "contactado"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-1 mb-2 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-accent" />
                        {p.city}, {p.state}
                      </div>

                      <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                        <strong>Zonas:</strong> {p.coverageAreas || "Toda la ciudad"}
                      </p>

                      {p.notes && (
                        <p className="text-xs bg-slate-50 p-2 rounded-lg text-slate-500 mb-4 border italic">
                          {p.notes}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 pt-3 border-t">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                        <span>Comisión pactada:</span>
                        <strong className="text-primary">{p.commissionAgreedPct}% retenido</strong>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full text-xs font-bold border-slate-300"
                        >
                          <a href={`tel:${p.phone}`}>
                            <PhoneCall className="h-3 w-3 mr-1" /> Llamar
                          </a>
                        </Button>

                        <Button
                          size="sm"
                          asChild
                          className="w-full text-xs font-bold bg-[#25D366] hover:bg-[#128C7E] text-white"
                        >
                          <a
                            href={`https://wa.me/52${p.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                              `Hola ${p.name}, me pongo en contacto de la plataforma de lavado de tinacos y cisternas. Tenemos clientes en tu zona y queremos pasarte órdenes de trabajo cotizadas. ¿Tendrás unos minutos para platicar?`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <MessageSquare className="h-3 w-3 mr-1" /> WhatsApp
                          </a>
                        </Button>
                      </div>

                      <div className="pt-2">
                        <select
                          value={p.status}
                          onChange={(e) =>
                            updateProviderMutation.mutate({
                              id: p.id,
                              updates: { status: e.target.value },
                            })
                          }
                          className="w-full text-xs h-8 px-2 rounded-lg border border-slate-200 bg-white font-medium"
                        >
                          <option value="prospecto">Estatus: Prospecto (Llamar)</option>
                          <option value="contactado">Estatus: Contactado (En pláticas)</option>
                          <option value="activo">Estatus: Activo (Asignando trabajos)</option>
                          <option value="inactivo">Estatus: Inactivo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminLeads() {
  return <AdminGate>{() => <AdminLeadsDashboard />}</AdminGate>;
}
