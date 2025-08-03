import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { serveStaticFiles } from "./static";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Validate critical environment variables for production
    if (process.env.NODE_ENV === "production") {
      const requiredEnvVars = ["DATABASE_URL"];
      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          throw new Error(`Missing required environment variable: ${envVar}`);
        }
      }
    }

    const server = await registerRoutes(app);

    // Enhanced error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Log error details
      log(`Error ${status}: ${message}`);
      if (process.env.NODE_ENV === "development") {
        console.error(err.stack);
      }

      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      try {
        serveStaticFiles(app);
      } catch (staticError) {
        const errorMessage = staticError instanceof Error ? staticError.message : String(staticError);
        log(`Static file serving error: ${errorMessage}`);
        // Graceful fallback - serve a basic error page instead of crashing
        app.get("*", (_req, res) => {
          res.status(503).json({ 
            error: "Service temporarily unavailable", 
            message: "Application is starting up. Please try again in a moment." 
          });
        });
      }
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`✓ Server listening on 0.0.0.0:${port} (${process.env.NODE_ENV || 'development'})`);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        log('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      log('SIGINT received, shutting down gracefully');
      server.close(() => {
        log('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Fatal server startup error: ${errorMessage}`);
    console.error(error);
    process.exit(1);
  }
})().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  log(`Unhandled server error: ${errorMessage}`);
  console.error(error);
  process.exit(1);
});
