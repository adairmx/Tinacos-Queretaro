import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBlogPostSchema, 
  insertAuthorSchema, 
  insertSiteSettingsSchema,
  insertLeadSchema,
  insertProviderSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Sitemap dinámico con soporte para Ciudades y Blog
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      const baseUrl = "https://lavadotinacos.com";
      const cities = [
        "cdmx",
        "edomex",
        "guadalajara",
        "monterrey",
        "puebla",
        "toluca",
        "cuernavaca",
        "leon",
        "merida",
        "san-luis-potosi",
        "aguascalientes",
        "cancun"
      ];

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  ${cities
    .map((city) => `
  <url>
    <loc>${baseUrl}/${city}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/ciudades/${city}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
    .join("")}
  ${posts
    .map((post) => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)
    .join("")}
</urlset>`;

      res.setHeader("Content-Type", "text/xml");
      res.send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });
  
  // Blog API routes
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog", async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating blog post:", error);
      res.status(500).json({ error: "Failed to create blog post" });
    }
  });

  app.patch("/api/blog/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      const post = await storage.updateBlogPost(id, validatedData);
      if (!post) {
        return res.status(404).json({ 
          error: "Post not found", 
          message: `No se encontró el artículo con ID: [${id}]. Verifica si el artículo aún existe.` 
        });
      }
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      console.error("Error updating blog post:", error);
      res.status(500).json({ error: "Error interno al actualizar el artículo" });
    }
  });

  app.delete("/api/blog/:id", async (req, res) => {
    try {
      await storage.deleteBlogPost(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  // Author endpoints
  app.get("/api/author", async (req, res) => {
    try {
      const author = await storage.getAuthor(1);
      res.json(author || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch author" });
    }
  });

  app.get("/api/admin/author", async (req, res) => {
    try {
      const author = await storage.getAuthor(1); // Single author for now
      res.json(author || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch author" });
    }
  });

  // Solo desarrollo local: en producción responde api/admin/login.ts.
  app.post("/api/admin/login", (req, res) => {
    const password = process.env.ADMIN_PASSWORD;
    if (!password || req.body?.password !== password) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }
    res.json({ token: "local-dev" });
  });

  app.patch("/api/admin/author", async (req, res) => {
    try {
      const validatedData = insertAuthorSchema.partial().parse(req.body);
      const author = await storage.updateAuthor(1, validatedData);
      res.json(author);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update author" });
    }
  });

  // Settings endpoints
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/admin/settings", async (req, res) => {
    try {
      const validatedData = insertSiteSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSiteSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Leads API (Soporte para Webhook de Phonica, Bot de WhatsApp o Cotizador Web)
  app.post("/api/leads", async (req, res) => {
    try {
      const body = req.body;
      
      // Auto-calcular precio y comisiones si no se especifican
      let estimatedPrice = body.estimatedPrice;
      let providerPayout = body.providerPayout;
      let commissionAmount = body.commissionAmount;

      const serviceType = (body.serviceType || "tinaco").toLowerCase();

      if (!estimatedPrice) {
        if (serviceType.includes("ambos") || serviceType.includes("paquete")) {
          estimatedPrice = 2200;
          providerPayout = 1500;
          commissionAmount = 700;
        } else if (serviceType.includes("cisterna")) {
          estimatedPrice = 1350;
          providerPayout = 950;
          commissionAmount = 400;
        } else {
          // Tinaco por defecto
          estimatedPrice = 1050;
          providerPayout = 750;
          commissionAmount = 300;
        }
      }

      const leadData = {
        clientName: body.clientName || body.name || "Cliente por clasificar",
        clientPhone: body.clientPhone || body.phone || "",
        city: body.city || "Querétaro",
        addressColonia: body.addressColonia || body.address || "",
        serviceType: serviceType,
        capacityLiters: body.capacityLiters ? Number(body.capacityLiters) : null,
        estimatedPrice,
        providerPayout,
        commissionAmount,
        preferredDate: body.preferredDate || "",
        source: body.source || "web_cotizador",
        status: body.status || "nuevo",
        assignedProviderId: body.assignedProviderId ? Number(body.assignedProviderId) : null,
        notes: body.notes || "",
      };

      const validatedLead = insertLeadSchema.parse(leadData);
      const created = await storage.createLead(validatedLead);

      res.status(201).json({
        success: true,
        message: "Lead registrado exitosamente",
        lead: created,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid lead data", details: error.errors });
      }
      console.error("Error creating lead:", error);
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  app.get("/api/leads", async (req, res) => {
    try {
      const allLeads = await storage.getAllLeads();
      res.json(allLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.patch("/api/leads/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      const updated = await storage.updateLead(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  // Providers API (Red de Técnicos Afiliados)
  app.post("/api/providers", async (req, res) => {
    try {
      const body = req.body;
      const providerData = {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        city: body.city || "Querétaro",
        state: body.state || "Querétaro",
        coverageAreas: body.coverageAreas || "",
        status: body.status || "prospecto",
        experienceYears: body.experienceYears ? Number(body.experienceYears) : 1,
        hasOwnEquipment: body.hasOwnEquipment !== undefined ? Number(body.hasOwnEquipment) : 1,
        commissionAgreedPct: body.commissionAgreedPct ? Number(body.commissionAgreedPct) : 30,
        notes: body.notes || "",
      };

      const validated = insertProviderSchema.parse(providerData);
      const created = await storage.createProvider(validated);
      res.status(201).json({
        success: true,
        message: "Proveedor registrado con éxito",
        provider: created,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid provider data", details: error.errors });
      }
      console.error("Error creating provider:", error);
      res.status(500).json({ error: "Failed to create provider" });
    }
  });

  app.get("/api/providers", async (req, res) => {
    try {
      const city = req.query.city as string | undefined;
      const list = city ? await storage.getProvidersByCity(city) : await storage.getAllProviders();
      res.json(list);
    } catch (error) {
      console.error("Error fetching providers:", error);
      res.status(500).json({ error: "Failed to fetch providers" });
    }
  });

  app.patch("/api/providers/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      const updated = await storage.updateProvider(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Provider not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating provider:", error);
      res.status(500).json({ error: "Failed to update provider" });
    }
  });

  return httpServer;
}
