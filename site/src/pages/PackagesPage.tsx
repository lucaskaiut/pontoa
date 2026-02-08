import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Header } from "../components/Header";
import { useCartDrawer } from "../contexts/CartDrawerContext";
import { PackageService } from "../services/PackageService";
import type { Package } from "../services/PackageService";
import { CartService } from "../services/CartService";

export default function PackagesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openDrawer } = useCartDrawer();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  async function loadPackages() {
    try {
      setLoading(true);
      const response = await PackageService.listAvailable();
      setPackages(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar pacotes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart(packageItem: Package) {
    try {
      setAddingToCart(packageItem.id);
      await CartService.addItem({
        item_type: "package",
        item_id: packageItem.id,
        quantity: 1,
      });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      openDrawer();
      toast.success("Pacote adicionado ao carrinho!");
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      toast.error("Erro ao adicionar pacote ao carrinho. Tente novamente.");
    } finally {
      setAddingToCart(null);
    }
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
        <Header showBackButton />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-text-secondary">Carregando pacotes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
      <Header showBackButton />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Pacotes Disponíveis</h1>
          <button
            onClick={() => navigate("/carrinho")}
            className="px-4 py-2 bg-surface hover:bg-white/10 text-text-primary font-medium rounded-xl transition-all border border-white/10"
          >
            Ver Carrinho
          </button>
        </div>

        {packages.length === 0 ? (
          <div className="bg-surface rounded-2xl p-8 text-center">
            <p className="text-text-secondary">Nenhum pacote disponível no momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((packageItem) => (
              <div key={packageItem.id} className="bg-surface rounded-2xl p-6 border border-white/10 hover:border-primary/50 transition-all">
                <h3 className="text-xl font-bold text-text-primary mb-2">{packageItem.name}</h3>
                {packageItem.description && (
                  <p className="text-text-secondary text-sm mb-4">{packageItem.description}</p>
                )}

                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Sessões:</span>
                    <span className="text-text-primary font-semibold">
                      {packageItem.total_sessions}
                      {packageItem.bonus_sessions > 0 && (
                        <span className="text-primary"> + {packageItem.bonus_sessions} bônus</span>
                      )}
                    </span>
                  </div>
                  {packageItem.expires_in_days && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary text-sm">Validade:</span>
                      <span className="text-text-primary text-sm">{packageItem.expires_in_days} dias</span>
                    </div>
                  )}
                </div>

                {packageItem.price !== undefined && packageItem.price > 0 && (
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-primary">{formatPrice(packageItem.price)}</p>
                  </div>
                )}

                <button
                  onClick={() => handleAddToCart(packageItem)}
                  disabled={addingToCart === packageItem.id || !packageItem.is_active}
                  className="w-full py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart === packageItem.id ? "Adicionando..." : "Adicionar ao Carrinho"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

