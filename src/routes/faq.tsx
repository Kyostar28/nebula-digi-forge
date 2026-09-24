import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — NebulaMine Cloud Mining" },
      {
        name: "description",
        content: "Answers about cloud hashpower, coin allocation, payouts and rewards on NebulaMine.",
      },
      { property: "og:title", content: "FAQ — NebulaMine Cloud Mining" },
      {
        property: "og:description",
        content: "Answers about cloud hashpower, coin allocation, payouts and rewards.",
      },
    ],
  }),
  component: Faq,
});

const faqs = [
  {
    q: "¿Qué es la minería virtual-cloud?",
    a: "Tu poder de minado se ejecuta en nuestros nodos en la nube. No necesitas hardware: asignas hashpower a las monedas y el balance crece en tiempo real.",
  },
  {
    q: "¿Cuánto poder recibo al registrarme?",
    a: "Cada cuenta nueva recibe 100 h/s gratis de forma permanente. Puedes sumar más en Earn Power.",
  },
  {
    q: "¿Cómo se reparte el poder entre monedas?",
    a: "El 100% de tu hashpower se divide según el valor de cada barra. Si mueves dos barras iguales, cada moneda recibe el 50%.",
  },
  {
    q: "¿Por qué mi balance sube tan rápido en SHIB y lento en BTC?",
    a: "Cada moneda tiene una dificultad distinta. El mismo hashpower produce muchas más unidades de monedas de bajo valor.",
  },
  {
    q: "¿Cuál es el retiro mínimo?",
    a: "El retiro mínimo depende de la red de cada moneda y se muestra al solicitar el pago desde tu balance.",
  },
  {
    q: "¿Faucet, lottery y games afectan mi minería?",
    a: "No la interrumpen: suman balance o hashpower extra a tu cuenta mientras la minería sigue activa.",
  },
];

function Faq() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold glow-text">FAQ</h1>
      <p className="mt-2 text-muted-foreground">Todo sobre tu minería en la nube.</p>
      <div className="mt-8 space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="panel group p-4">
            <summary className="cursor-pointer font-display text-sm font-bold tracking-wide text-foreground marker:content-none">
              {f.q}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
