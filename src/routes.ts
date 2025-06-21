import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { agreementFormSchema } from "./shared/schema.js";
import { generateRentalAgreement } from "./openai";
import { generatePDF } from "./pdf";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate rental agreement
  app.post("/api/generateAgreement", async (req, res) => {
    try {
      const validatedData = agreementFormSchema.parse(req.body);
      
      // Save email first
      await storage.saveEmail({ email: validatedData.email });
      
      // Generate agreement using OpenAI
      const generatedContent = await generateRentalAgreement(validatedData);
      
      // Save agreement
      const agreement = await storage.saveAgreement({
        ...validatedData,
        generated_content: generatedContent
      });
      
      res.json({
        success: true,
        agreement: {
          id: agreement.id,
          content: generatedContent
        }
      });
    } catch (error) {
      console.error("Generate Agreement Error:", error);
      
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid form data",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : "Failed to generate agreement"
        });
      }
    }
  });

  // Save email endpoint
  app.post("/api/saveEmail", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Valid email is required"
        });
      }

      const savedEmail = await storage.saveEmail({ email });
      
      res.json({
        success: true,
        email: savedEmail
      });
    } catch (error) {
      console.error("Save Email Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save email"
      });
    }
  });

  // Generate PDF endpoint
  app.post("/api/generatePDF", async (req, res) => {
    try {
      const { content, filename = "rental-agreement.pdf" } = req.body;
      
      if (!content) {
        return res.status(400).json({
          success: false,
          message: "Content is required"
        });
      }

      const pdfBuffer = generatePDF(content, filename);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Generate PDF Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate PDF"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
