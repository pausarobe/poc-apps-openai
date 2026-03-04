export async function searchDetail(category: string, sku: string) {
  if (!window.openai?.sendFollowUpMessage) {
    console.error("OpenAI SDK not available or sendFollowUpMessage method missing.");
    return;
  }
  
  console.log("Searching detail for SKU:", sku, "in category:", category);
  
  await window.openai.sendFollowUpMessage({
    prompt: `Dame detalle completo del look presentado en la lista que tiene SKU ${sku} utilizando la herramienta "retail-detail".`,
  });
}