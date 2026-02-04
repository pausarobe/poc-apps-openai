import { App, PostMessageTransport } from '@modelcontextprotocol/ext-apps';
import type { ToolOutput } from './types.js';

/**
 * MCP Apps API wrapper
 * Provides a standardized interface for MCP app communication
 */
class McpAppWrapper {
  private app: App;
  private toolOutput: ToolOutput | undefined;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.app = new App(
      { name: 'NTT Flights App', version: '1.0.0' },
      {}, // capabilities - can be extended as needed
      { autoResize: true }
    );
    this.initialize();
  }

  private async initialize() {
    try {
      // For iframe-based apps, communicate with parent window
      const transport = new PostMessageTransport(window.parent, window.parent);
      await this.app.connect(transport);
      console.log('✅ MCP App connected successfully');

      // Listen for tool results from the host
      this.app.ontoolresult = (params) => {
        console.log('🔔 Tool result received:', params);
        
        // Extract the structured content from the result
        const result = params as any;
        if (result?.structuredContent) {
          this.toolOutput = result.structuredContent as ToolOutput;
        } else if (result?.content) {
          // Try to find structured content in the content array
          const structuredItem = result.content.find((c: any) => c.type === 'resource');
          if (structuredItem) {
            this.toolOutput = structuredItem as any;
          } else {
            // Fallback: store the result as-is
            this.toolOutput = result as any;
          }
        }
        
        // Notify all listeners
        this.notifyListeners();
      };
    } catch (error) {
      console.error('❌ Failed to connect MCP App:', error);
    }
  }

  /**
   * Get the current tool output
   */
  getToolOutput(): ToolOutput | undefined {
    return this.toolOutput;
  }

  /**
   * Subscribe to tool output changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all subscribers of changes
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Call a server tool
   */
  async callServerTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    try {
      const response = await this.app.callServerTool({
        name,
        arguments: args,
      });
      console.log('✅ Server tool call successful:', name, response);
      return response;
    } catch (error) {
      console.error('❌ Server tool call failed:', name, error);
      throw error;
    }
  }

  /**
   * Update the model context (add context for future turns)
   */
  async updateModelContext(text: string): Promise<void> {
    try {
      await this.app.updateModelContext({
        content: [{ type: 'text', text }],
      });
      console.log('✅ Model context updated');
    } catch (error) {
      console.error('❌ Failed to update model context:', error);
      throw error;
    }
  }

  /**
   * Send a message to the chat interface
   */
  async sendMessage(text: string): Promise<void> {
    try {
      const result = await this.app.sendMessage({
        role: 'user',
        content: [{ type: 'text', text }],
      });
      if (result.isError) {
        throw new Error('Host rejected the message');
      }
      console.log('✅ Message sent');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Open a URL in the user's browser
   */
  async openUrl(url: string): Promise<void> {
    try {
      const result = await this.app.openLink({ url });
      if (result.isError) {
        throw new Error('Host rejected the link request');
      }
      console.log('✅ URL opened:', url);
    } catch (error) {
      console.error('❌ Failed to open URL:', error);
      throw error;
    }
  }

  /**
   * Log a message (for debugging)
   */
  log(level: 'debug' | 'info' | 'warning' | 'error', message: string, data?: unknown): void {
    this.app.sendLog({
      level,
      data: data ? JSON.stringify(data) : message,
      logger: 'NTT Flights App',
    }).catch(err => console.error('Failed to send log:', err));
  }
}

// Create a singleton instance
export const mcpApp = new McpAppWrapper();
