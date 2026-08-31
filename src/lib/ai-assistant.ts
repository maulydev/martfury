import { GoogleGenerativeAI, SchemaType, type Content } from '@google/generative-ai';

import { geminiApiKey } from './env';
import {
  getProducts,
  getProduct,
  getProductPricing,
  getProductImage,
  getDefaultVariant,
  getProductInStock,
  ApiRequestError,
  type ApiProduct,
  type ProductSort,
} from './catalog';
import { useCartStore } from '@/stores/cart.store';
import { REFUND_POLICY, PRIVACY_POLICY, TERMS_OF_SERVICE, RETURN_POLICY } from './policies';

/**
 * AI Shopping Assistant — the mobile counterpart to the web app's
 * FloatingAssistant / AssistantChatDialog, which run Gemini function-calling
 * server-side (src/server/ai/ai.actions.ts on the backend) with tools that
 * touch Prisma directly, Pinecone vector search, and admin-only product
 * mutations.
 *
 * This app has no server of its own to host that safely — the backend is
 * read-only reference and never gets a mobile-facing route added to it — so
 * the Gemini SDK is called directly from the client instead (see env.ts for
 * the API-key tradeoff that comes with that). The tool set is trimmed to
 * match: no Prisma/Pinecone access and no admin tools (this app is
 * customer-only, same scope as the rest of the mobile catalog), and
 * checkout is a hand-off to the app's own existing, already-secure
 * checkout screen (src/app/checkout/index.tsx) rather than a duplicated
 * in-chat payment-link flow.
 */

export type AssistantMessage = {
  role: 'user' | 'model';
  parts: { text: string }[];
  products?: ApiProduct[];
  wantsCheckout?: boolean;
  isError?: boolean;
};

export type AssistantReply =
  | { text: string; products?: ApiProduct[]; wantsCheckout?: boolean }
  | { error: string };

export const ASSISTANT_QUICK_PROMPTS = [
  { label: 'Latest products', value: 'Show me the latest products' },
  { label: 'Gift ideas', value: 'Help me find a gift for my mom' },
] as const;

export function isAssistantConfigured(): boolean {
  return Boolean(geminiApiKey);
}

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!geminiApiKey) {
    throw new Error('NOT_CONFIGURED');
  }
  if (!client) {
    client = new GoogleGenerativeAI(geminiApiKey);
  }
  return client;
}

const tools = [
  {
    functionDeclarations: [
      {
        name: 'searchProducts',
        description:
          "Search and list products from the store catalog by keyword, category, or sort order. This is a keyword match on product name/description, not semantic search — if a query comes back empty, try a simpler or different keyword before telling the user nothing is available.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: { type: SchemaType.STRING, description: 'Keyword(s) to search for in the product name or description' },
            category: { type: SchemaType.STRING, description: "Category slug to filter by (e.g. 'fashion', 'groceries', 'electronics')" },
            sort: {
              type: SchemaType.STRING,
              format: 'enum',
              enum: ['newest', 'oldest', 'price_asc', 'price_desc'],
              description: "Sort order. Use 'newest' to get the latest products.",
            },
            limit: { type: SchemaType.NUMBER, description: 'Number of products to return (default 6, max 12)' },
          },
        },
      },
      {
        name: 'getStorePolicy',
        description:
          'Retrieve MartFury store policy details (refund policy, privacy policy, terms of service, or return policy) to answer customer questions.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            policyType: {
              type: SchemaType.STRING,
              format: 'enum',
              enum: ['refund', 'privacy', 'terms', 'return'],
              description: 'The specific policy to retrieve.',
            },
          },
          required: ['policyType'],
        },
      },
      {
        name: 'addToCart',
        description:
          "Add a specific product to the shopper's cart so they can review it at checkout. Call searchProducts first if you don't already know the product's id.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            productId: { type: SchemaType.STRING, description: "The product's id, from a previous searchProducts result" },
            quantity: { type: SchemaType.NUMBER, description: 'How many to add (default 1)' },
          },
          required: ['productId'],
        },
      },
      {
        name: 'goToCheckout',
        description:
          "Signal that the shopper is ready to check out their cart. Call this when they say things like 'checkout', 'buy this', or 'I'm ready to pay'. It does not take payment itself — it hands them off to the app's own secure checkout screen, where they enter shipping and payment details.",
        parameters: { type: SchemaType.OBJECT, properties: {} },
      },
    ],
  },
];

const SYSTEM_INSTRUCTION = `
You are a friendly, professional AI shopping assistant for MartFury, embedded in the MartFury mobile app.

RULES:
1. All products come from the store's real catalog — never invent or hallucinate a product, price, or id.
2. To find products, call "searchProducts". It's a keyword match, not semantic search — if nothing comes back, try a different or simpler keyword before telling the user nothing is available.
3. To add something to their cart, call "addToCart" with the product's id from a previous searchProducts result.
4. When the user wants to pay or check out — their cart, or a specific item you just added — call "goToCheckout". You cannot take payment or collect shipping details yourself; that happens on the app's own checkout screen right after this tool hands them off.
5. If asked about store policies (refunds, returns, privacy, terms of service), call "getStorePolicy" and summarize the real policy text accurately. Never make up policy rules.
6. Be conversational but concise.
7. Always give a friendly, helpful final response explaining what you found or did (e.g. "I found these for you:" or "Added it to your cart — ready to check out?"). Never return an empty reply.
`;

type ToolResult = { output: unknown; products?: ApiProduct[]; wantsCheckout?: boolean };

async function runTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
  switch (name) {
    case 'searchProducts': {
      try {
        const result = await getProducts({
          q: typeof args.query === 'string' ? args.query : undefined,
          category: typeof args.category === 'string' ? args.category : undefined,
          sort: (typeof args.sort === 'string' ? args.sort : 'newest') as ProductSort,
          limit: Math.min(Math.max(Number(args.limit) || 6, 1), 12),
        });
        return {
          output: {
            products: result.products.map((p) => ({
              id: p.id,
              name: p.name,
              description: p.description ? `${p.description.slice(0, 100)}...` : '',
              price: getProductPricing(p).price,
            })),
          },
          products: result.products,
        };
      } catch {
        return { output: { error: 'Could not search products right now.' } };
      }
    }

    case 'getStorePolicy': {
      const policies: Record<string, string> = {
        refund: REFUND_POLICY,
        privacy: PRIVACY_POLICY,
        terms: TERMS_OF_SERVICE,
        return: RETURN_POLICY,
      };
      const content = typeof args.policyType === 'string' ? policies[args.policyType] : undefined;
      return { output: content ? { policyContent: content } : { error: 'Unknown policy type requested.' } };
    }

    case 'addToCart': {
      const productId = String(args.productId ?? '');
      if (!productId) return { output: { error: 'No product id given.' } };
      try {
        const product = await getProduct(productId);
        if (!getProductInStock(product)) {
          return { output: { error: `${product.name} is currently out of stock.` } };
        }
        const variant = getDefaultVariant(product);
        const { price } = getProductPricing(product);
        const qty = Math.min(Math.max(Number(args.quantity) || 1, 1), 99);
        useCartStore.getState().addItemWithQty(
          { id: variant?.id ?? product.id, name: product.name, price, image: getProductImage(product) ?? '' },
          qty,
        );
        return {
          output: { success: true, name: product.name, quantity: qty, price },
          products: [product],
        };
      } catch (e) {
        const notFound = e instanceof ApiRequestError && e.status === 404;
        return { output: { error: notFound ? 'Product not found.' : 'Could not add that to the cart.' } };
      }
    }

    case 'goToCheckout': {
      const items = useCartStore.getState().items;
      if (!items.length) {
        return { output: { error: 'The cart is empty — add something first, then ask to check out.' } };
      }
      return {
        output: {
          success: true,
          itemCount: items.reduce((sum, i) => sum + i.qty, 0),
          total: useCartStore.getState().getTotal(),
        },
        wantsCheckout: true,
      };
    }

    default:
      return { output: { error: `Unknown tool: ${name}` } };
  }
}

export async function sendAssistantMessage(history: AssistantMessage[], message: string): Promise<AssistantReply> {
  try {
    const model = getClient().getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools: tools as never,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const chat = model.startChat({
      history: history.map((m) => ({ role: m.role, parts: m.parts })) as Content[],
      generationConfig: { maxOutputTokens: 1000 },
    });

    let result = await chat.sendMessage(message);
    let response = result.response;
    let functionCalls = response.functionCalls();

    let products: ApiProduct[] = [];
    let wantsCheckout = false;
    let round = 0;

    while (functionCalls && functionCalls.length > 0 && round < 5) {
      round++;
      const toolResponses = [];

      for (const call of functionCalls) {
        const toolResult = await runTool(call.name, (call.args ?? {}) as Record<string, unknown>);
        if (toolResult.products?.length) products = toolResult.products;
        if (toolResult.wantsCheckout) wantsCheckout = true;
        toolResponses.push({ functionResponse: { name: call.name, response: toolResult.output as object } });
      }

      result = await chat.sendMessage(toolResponses as never);
      response = result.response;
      functionCalls = response.functionCalls();
    }

    let text = '';
    try {
      text = response.text();
    } catch {
      // fall through to the default below
    }
    if (!text.trim()) {
      text = products.length
        ? 'Here are the products I found for you:'
        : "I'm here — let me know what you're looking for!";
    }

    return { text, products: products.length ? products : undefined, wantsCheckout: wantsCheckout || undefined };
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';

    if (msg === 'NOT_CONFIGURED') {
      return { error: "The AI assistant isn't set up on this device yet." };
    }
    if (/429|quota|too many requests/i.test(msg)) {
      return { error: 'The AI assistant is experiencing high traffic right now. Please wait a moment and try again.' };
    }
    return { error: "Sorry, I'm having trouble connecting right now. Please check your connection and try again." };
  }
}
