import { useState, type FormEvent, type ReactNode } from "react";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { clearAdminToken, hasAdminToken, loginAdmin } from "@/lib/adminAuth";

export default function AdminGate({ children }: { children: (logout: () => void) => ReactNode }) {
  const { toast } = useToast();
  const [authenticated, setAuthenticated] = useState(hasAdminToken);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const logout = () => {
    clearAdminToken();
    setAuthenticated(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (await loginAdmin(password)) {
        setPassword("");
        setAuthenticated(true);
      } else {
        toast({ variant: "destructive", title: "Contraseña incorrecta" });
      }
    } catch {
      toast({ variant: "destructive", title: "No se pudo iniciar sesión" });
    } finally {
      setSubmitting(false);
    }
  };

  if (authenticated) return <>{children(logout)}</>;

  return (
    <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-[#18181b] border-white/10 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-white text-xl">Panel de administración</CardTitle>
          <CardDescription className="text-white/50">Ingresa tu contraseña para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="Contraseña"
              aria-label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              autoFocus
            />
            <Button type="submit" className="w-full" disabled={submitting || !password}>
              {submitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
