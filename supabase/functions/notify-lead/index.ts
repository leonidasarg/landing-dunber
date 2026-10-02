// Edge Function: avisa por WhatsApp cada vez que entra un lead nuevo.
// Se dispara desde un Database Webhook (INSERT en public.leads).
// Usa CallMeBot (gratis): https://www.callmebot.com/blog/free-api-whatsapp-messages/
//
// Secrets requeridos (supabase secrets set ...):
//   CALLMEBOT_PHONE   -> 5493516201626
//   CALLMEBOT_APIKEY  -> apikey que te devuelve CallMeBot al activarlo
//   WEBHOOK_SECRET    -> texto largo aleatorio; el mismo va en el header del webhook

Deno.serve(async (req) => {
  const secret = Deno.env.get("WEBHOOK_SECRET");
  if (!secret || req.headers.get("x-webhook-secret") !== secret) {
    return new Response("unauthorized", { status: 401 });
  }

  const payload = await req.json().catch(() => null);
  const l = payload?.record;
  if (!l) return new Response("sin registro", { status: 400 });

  const texto = [
    "🥤 *Nuevo cliente potencial - Web Dunber*",
    `Nombre: ${l.nombre}`,
    `Comercio: ${l.comercio}`,
    `Teléfono: ${l.telefono}`,
    `Localidad: ${l.localidad}`,
    l.tipo_comercio ? `Tipo: ${l.tipo_comercio}` : null,
    l.mensaje ? `Mensaje: ${l.mensaje}` : null,
  ].filter(Boolean).join("\n");

  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", Deno.env.get("CALLMEBOT_PHONE") ?? "");
  url.searchParams.set("text", texto);
  url.searchParams.set("apikey", Deno.env.get("CALLMEBOT_APIKEY") ?? "");

  const res = await fetch(url);
  return new Response(await res.text(), { status: res.ok ? 200 : 502 });
});
