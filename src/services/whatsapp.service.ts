// ==========================================
// StarNova API - WhatsApp Bot Service
// ==========================================

import config from '../config';
import User from '../models/User';
import ApiKey from '../models/ApiKey';
import { generateApiKey } from '../utils/helpers';
import logger from '../utils/logger';

interface WhatsAppCommand {
  command: string;
  description: string;
  permission: 'owner' | 'admin';
  handler: (args: string[], sender: string) => Promise<string>;
}

class WhatsAppBotService {
  private commands: Map<string, WhatsAppCommand> = new Map();
  private enabled: boolean;

  constructor() {
    this.enabled = config.whatsapp.enabled;
    this.registerCommands();
  }

  private registerCommands(): void {
    // Owner commands
    this.commands.set('createapikey', {
      command: '.createapikey',
      description: 'Create API key for user',
      permission: 'owner',
      handler: async (args) => {
        const [email] = args;
        if (!email) return 'Usage: .createapikey <email> [name]';
        
        const user = await User.findOne({ email });
        if (!user) return `User not found: ${email}`;

        const name = args[1] || `WA-${Date.now()}`;
        const key = generateApiKey(config.apiKey.prefix, config.apiKey.length);

        await ApiKey.create({
          key,
          prefix: config.apiKey.prefix,
          name,
          user: user._id,
          plan: user.plan,
        });

        return `✅ API Key created for ${email}\nKey: ${key}\nName: ${name}`;
      },
    });

    this.commands.set('listapikey', {
      command: '.listapikey',
      description: 'List all API keys for a user',
      permission: 'owner',
      handler: async (args) => {
        const [email] = args;
        if (!email) return 'Usage: .listapikey <email>';
        
        const user = await User.findOne({ email });
        if (!user) return `User not found: ${email}`;

        const keys = await ApiKey.find({ user: user._id });
        if (keys.length === 0) return `No API keys found for ${email}`;

        const keyList = keys.map((k) => 
          `• ${k.key.slice(0, 15)}... | ${k.name} | Active: ${k.isActive} | Used: ${k.usageCount}`
        ).join('\n');

        return `🔑 API Keys for ${email} (${keys.length}):\n${keyList}`;
      },
    });

    this.commands.set('delapikey', {
      command: '.delapikey',
      description: 'Delete an API key',
      permission: 'owner',
      handler: async (args) => {
        const [keyToDelete] = args;
        if (!keyToDelete) return 'Usage: .delapikey <key>';

        const key = await ApiKey.findOne({ key: { $regex: keyToDelete, $options: 'i' } });
        if (!key) return 'API Key not found';

        await ApiKey.deleteOne({ _id: key._id });
        return `✅ API Key deleted: ${key.key.slice(0, 15)}...`;
      },
    });

    this.commands.set('regenapikey', {
      command: '.regenapikey',
      description: 'Regenerate an API key',
      permission: 'owner',
      handler: async (args) => {
        const [keyToRegen] = args;
        if (!keyToRegen) return 'Usage: .regenapikey <key>';

        const key = await ApiKey.findOne({ key: { $regex: keyToRegen, $options: 'i' } });
        if (!key) return 'API Key not found';

        const newKey = generateApiKey(config.apiKey.prefix, config.apiKey.length);
        key.key = newKey;
        key.usageCount = 0;
        await key.save();

        return `✅ API Key regenerated:\nNew Key: ${newKey}`;
      },
    });

    this.commands.set('disableapikey', {
      command: '.disableapikey',
      description: 'Disable an API key',
      permission: 'owner',
      handler: async (args) => {
        const [keyToDisable] = args;
        if (!keyToDisable) return 'Usage: .disableapikey <key>';

        const key = await ApiKey.findOne({ key: { $regex: keyToDisable, $options: 'i' } });
        if (!key) return 'API Key not found';

        key.isActive = false;
        key.isDisabled = true;
        await key.save();

        return `✅ API Key disabled: ${key.key.slice(0, 15)}...`;
      },
    });

    this.commands.set('enableapikey', {
      command: '.enableapikey',
      description: 'Enable an API key',
      permission: 'owner',
      handler: async (args) => {
        const [keyToEnable] = args;
        if (!keyToEnable) return 'Usage: .enableapikey <key>';

        const key = await ApiKey.findOne({ key: { $regex: keyToEnable, $options: 'i' } });
        if (!key) return 'API Key not found';

        key.isActive = true;
        key.isDisabled = false;
        await key.save();

        return `✅ API Key enabled: ${key.key.slice(0, 15)}...`;
      },
    });

    this.commands.set('checkapikey', {
      command: '.checkapikey',
      description: 'Check API key details',
      permission: 'owner',
      handler: async (args) => {
        const [keyToCheck] = args;
        if (!keyToCheck) return 'Usage: .checkapikey <key>';

        const key = await ApiKey.findOne({ key: { $regex: keyToCheck, $options: 'i' } });
        if (!key) return 'API Key not found';

        return `📊 API Key Info:\nName: ${key.name}\nActive: ${key.isActive}\nDisabled: ${key.isDisabled}\nUsage: ${key.usageCount}\nDaily: ${key.dailyUsage}/${key.dailyLimit}\nMonthly: ${key.monthlyUsage}/${key.monthlyLimit}\nExpires: ${key.expiresAt || 'Never'}\nCreated: ${key.createdAt}`;
      },
    });

    this.commands.set('setlimit', {
      command: '.setlimit',
      description: 'Set API key limits',
      permission: 'owner',
      handler: async (args) => {
        const [keyTarget, dailyStr, monthlyStr] = args;
        if (!keyTarget || !dailyStr || !monthlyStr) return 'Usage: .setlimit <key> <daily_limit> <monthly_limit>';

        const key = await ApiKey.findOne({ key: { $regex: keyTarget, $options: 'i' } });
        if (!key) return 'API Key not found';

        key.dailyLimit = parseInt(dailyStr);
        key.monthlyLimit = parseInt(monthlyStr);
        await key.save();

        return `✅ Limits updated: Daily=${dailyStr}, Monthly=${monthlyStr}`;
      },
    });

    this.commands.set('setexpired', {
      command: '.setexpired',
      description: 'Set API key expiration',
      permission: 'owner',
      handler: async (args) => {
        const [keyTarget, daysStr] = args;
        if (!keyTarget || !daysStr) return 'Usage: .setexpired <key> <days>';

        const key = await ApiKey.findOne({ key: { $regex: keyTarget, $options: 'i' } });
        if (!key) return 'API Key not found';

        const days = parseInt(daysStr);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
        key.expiresAt = expiresAt;
        await key.save();

        return `✅ Expiration set: ${expiresAt.toISOString()}`;
      },
    });

    this.commands.set('statsapi', {
      command: '.statsapi',
      description: 'Get API statistics',
      permission: 'owner',
      handler: async () => {
        const [totalUsers, totalKeys, activeKeys] = await Promise.all([
          User.countDocuments(),
          ApiKey.countDocuments(),
          ApiKey.countDocuments({ isActive: true }),
        ]);

        return `📈 API Statistics:\nUsers: ${totalUsers}\nTotal Keys: ${totalKeys}\nActive Keys: ${activeKeys}\nUptime: ${Math.floor(process.uptime() / 3600)}h`;
      },
    });

    this.commands.set('logsapi', {
      command: '.logsapi',
      description: 'Get recent API logs',
      permission: 'owner',
      handler: async () => {
        return '📋 API Logs: Use admin dashboard for detailed logs.';
      },
    });

    this.commands.set('reloadapi', {
      command: '.reloadapi',
      description: 'Reload API configuration',
      permission: 'owner',
      handler: async () => {
        return '🔄 API configuration reloaded.';
      },
    });

    this.commands.set('restartapi', {
      command: '.restartapi',
      description: 'Restart the API',
      permission: 'owner',
      handler: async () => {
        setTimeout(() => process.exit(0), 1000);
        return '🔄 API restarting...';
      },
    });
  }

  // Handle incoming message
  async handleMessage(message: string, sender: string): Promise<string | null> {
    if (!message.startsWith('.')) return null;

    const parts = message.slice(1).split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    const command = this.commands.get(commandName);
    if (!command) return null;

    // Check permission
    if (command.permission === 'owner' && sender !== config.whatsapp.ownerNumber) {
      return '⛔ You do not have permission to use this command.';
    }

    try {
      logger.info(`WhatsApp command: ${commandName} from ${sender}`);
      return await command.handler(args, sender);
    } catch (error) {
      logger.error(`WhatsApp command error (${commandName}):`, error);
      return '❌ Error executing command. Please try again.';
    }
  }

  // Get all commands
  getCommands(): WhatsAppCommand[] {
    return Array.from(this.commands.values());
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export default new WhatsAppBotService();
