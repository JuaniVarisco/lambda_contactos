"use client";

import { useState, useEffect } from "react";

// Interface representation for our TypeScript data structure
interface Contact {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState({ name: "", email: "" });
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL + "/contacts";

  const fetchContacts = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setContacts(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", email: "" };
    setApiError(""); // Limpiamos cualquier error previo de API

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio.";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "El formato del email no es válido.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError("");

    try {
      let res;
      if (editingId) {
        res = await fetch(`${API_URL}/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      // Si el status no es OK, leemos el error que lanzó el backend
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (res.status === 409) { // Atrapamos específicamente nuestro ConflictException (P2002)
          throw new Error("El correo electrónico ingresado ya pertenece a otro contacto.");
        }
        throw new Error(errorData?.message || "Ocurrió un error inesperado al guardar.");
      }

      await fetchContacts();
      setFormData({ name: "", email: "" });
      setEditingId(null);
      setErrors({ name: "", email: "" });
    } catch (err: any) {
      console.error(err);
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    setFormData({ name: contact.name, email: contact.email });
    setEditingId(contact.id);
    setErrors({ name: "", email: "" });
    setApiError("");
    
    // Hacemos scroll suave hacia el formulario al editar
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este contacto?")) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error Deleting Contact");
      await fetchContacts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setFormData({ name: "", email: "" });
    setEditingId(null);
    setErrors({ name: "", email: "" });
    setApiError("");
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br flex flex-col font-sans from-slate-950 via-slate-900 to-indigo-950 text-slate-200 selection:bg-indigo-500/40">
      <div className="max-w-4xl w-full mx-auto px-6 py-12 md:py-20 flex-grow space-y-12">
        
        {/* Header */}
        <header className="text-center space-y-3">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 drop-shadow-md animate-in slide-in-from-top-4 duration-700">
            Lambda Contactos
          </h1>
        </header>

        {/* Sección 1: Formulario (Ahora ocupa el ancho de max-w-4xl horizontalmente o grid en desktop) */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-7 md:p-10 shadow-2xl shadow-indigo-900/20">
          <h2 className="text-2xl font-semibold mb-8 text-white flex items-center gap-2">
            <span className="h-6 w-1 rounded-full bg-indigo-500"></span>
            {editingId ? "Actualizar Contacto Existente" : "Añadir Nuevo Contacto"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campo Nombre */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2" htmlFor="name">
                  Nombre Completo
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Juani Varisco"
                  className={`w-full bg-slate-950/80 border ${
                    errors.name ? 'border-rose-500/60 focus:ring-rose-500/40' : 'border-indigo-500/20 focus:border-indigo-400 focus:ring-indigo-400/30'
                  } rounded-2xl px-5 py-3.5 text-white placeholder-slate-600 outline-none transition-all duration-300 focus:ring-4`}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && (
                  <p className="text-rose-400 text-sm mt-2 ml-1 animate-pulse font-medium">{errors.name}</p>
                )}
              </div>

              {/* Campo Email */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2" htmlFor="email">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="juanivarisco@gmail.com"
                  className={`w-full bg-slate-950/80 border ${
                    errors.email ? 'border-rose-500/60 focus:ring-rose-500/40' : 'border-indigo-500/20 focus:border-indigo-400 focus:ring-indigo-400/30'
                  } rounded-2xl px-5 py-3.5 text-white placeholder-slate-600 outline-none transition-all duration-300 focus:ring-4`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && (
                  <p className="text-rose-400 text-sm mt-2 ml-1 animate-pulse font-medium">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Manejo de Error Global del Backend (el duplicado u otros) */}
            {apiError && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-center mt-4">
                <p className="text-rose-400 text-sm font-medium flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {apiError}
                </p>
              </div>
            )}

            <div className="pt-4 flex flex-col md:flex-row gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto md:flex-1 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-wait text-white font-bold tracking-wide py-4 px-8 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all duration-300 active:scale-[0.98]"
              >
                {isLoading ? "Procesando..." : editingId ? "Confirmar Actualización" : "Registrar Contacto"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="w-full md:w-auto bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium py-3 px-8 rounded-2xl transition-colors duration-200"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Separador Visual */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-12"></div>

        {/* Sección 2: Listado y Búsqueda */}
        <div className="space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-semibold text-white">Directorio ({contacts.length})</h2>
            
            {/* Buscador reactivo */}
            <div className="relative group w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                className="w-full bg-white/5 backdrop-blur-md border border-white/5 rounded-full pl-14 pr-5 py-3.5 text-white placeholder-slate-500 outline-none transition-all duration-300 focus:bg-white/10 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Grid de contactos (Mantenemos las grillas adaptables de Tailwind) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="group flex flex-col justify-between bg-white/5 backdrop-blur-sm border border-white/5 rounded-3xl p-6 hover:bg-slate-800/50 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                >
                  <div className="flex gap-4 items-start mb-6">
                    <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white text-lg shadow-inner shadow-white/20">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate flex-1">
                      <h3 className="text-xl font-bold text-white truncate drop-shadow-sm">{contact.name}</h3>
                      <p className="text-sm text-slate-400 truncate mt-1 group-hover:text-cyan-200/80 transition-colors">{contact.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="flex-1 bg-slate-800/60 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 text-sm font-semibold py-2.5 px-3 rounded-xl transition-colors border border-transparent hover:border-indigo-500/30"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="flex-1 bg-slate-800/60 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 text-sm font-semibold py-2.5 px-3 rounded-xl transition-colors border border-transparent hover:border-rose-500/30"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white/5 border border-white/5 rounded-3xl border-dashed">
                <div className="h-16 w-16 mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                   <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                </div>
                <h3 className="text-xl font-medium text-slate-300">Ningún contacto encontrado</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                  {searchQuery ? "Intenta con otros términos de búsqueda." : "Comienza agregando tu primer contacto."}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
