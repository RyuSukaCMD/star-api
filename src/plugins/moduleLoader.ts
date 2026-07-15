// ==========================================
// StarNova API - Module/Loader System
// ==========================================

import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';
import { ApiModule } from '../types';

class ModuleLoader {
  private modules: Map<string, ApiModule> = new Map();
  private router: Router;

  constructor() {
    this.router = Router();
  }

  // Register a module
  register(module: ApiModule): void {
    if (this.modules.has(module.name)) {
      logger.warn(`Module "${module.name}" is already registered`);
      return;
    }

    if (!module.enabled) {
      logger.info(`Module "${module.name}" is disabled, skipping`);
      return;
    }

    this.modules.set(module.name, module);
    this.router.use(module.prefix, module.routes);

    logger.info(`Module registered: ${module.name} v${module.version} at ${module.prefix}`);
  }

  // Unregister a module
  unregister(name: string): void {
    this.modules.delete(name);
    logger.info(`Module unregistered: ${name}`);
  }

  // Load all modules from the modules directory
  async loadFromDirectory(modulesDir: string): Promise<void> {
    if (!fs.existsSync(modulesDir)) {
      logger.warn(`Modules directory not found: ${modulesDir}`);
      return;
    }

    const entries = fs.readdirSync(modulesDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          const modulePath = path.join(modulesDir, entry.name, 'index.ts');
          const moduleJsPath = path.join(modulesDir, entry.name, 'index.js');

          let moduleExports;
          if (fs.existsSync(modulePath)) {
            moduleExports = await import(modulePath);
          } else if (fs.existsSync(moduleJsPath)) {
            moduleExports = await import(moduleJsPath);
          } else {
            continue;
          }

          if (moduleExports.default && moduleExports.default.name) {
            this.register(moduleExports.default);
          }
        } catch (error) {
          logger.error(`Failed to load module "${entry.name}":`, error);
        }
      }
    }
  }

  // Get all registered modules
  getModules(): ApiModule[] {
    return Array.from(this.modules.values());
  }

  // Get module by name
  getModule(name: string): ApiModule | undefined {
    return this.modules.get(name);
  }

  // Get the combined router
  getRouter(): Router {
    return this.router;
  }

  // Module count
  get count(): number {
    return this.modules.size;
  }
}

export default new ModuleLoader();
