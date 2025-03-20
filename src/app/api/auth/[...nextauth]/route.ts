import { handlers } from "@/server/auth";
import { ProxyAgent, setGlobalDispatcher } from "undici";

if (process.env.HTTP_PROXY && process.env.NODE_ENV !== 'test') {
  const proxyAgent = new ProxyAgent(process.env.HTTP_PROXY);
  setGlobalDispatcher(proxyAgent);
}

export const { GET, POST } = handlers;
