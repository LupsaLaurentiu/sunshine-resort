type PrivacyPolicyPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const content = {
  ro: {
    eyebrow: "Legal",
    title: "Politica de confidențialitate",
    intro:
      "Această politică explică modul în care Sunshine Resort colectează, utilizează și protejează datele cu caracter personal în contextul utilizării website-ului și al procesului de rezervare.",

    sections: [
      {
        title: "1. Operatorul datelor",
        body: [
          "Operatorul datelor cu caracter personal este Sunshine Resort.",
          "Datele complete de identificare juridică și de contact vor fi completate înainte de lansarea oficială a website-ului.",
        ],
      },
      {
        title: "2. Datele pe care le colectăm",
        body: [
          "În funcție de serviciile utilizate, putem colecta numele și prenumele, adresa de email, numărul de telefon, informații despre rezervare, perioada sejurului, numărul de oaspeți și mesajele sau solicitările transmise.",
          "Pentru administrarea plăților pot fi prelucrate informații privind statusul tranzacției, valoarea plății și identificatorii tehnici ai tranzacției. Sunshine Resort nu stochează datele complete ale cardului bancar.",
        ],
      },
      {
        title: "3. Scopurile prelucrării",
        body: [
          "Datele sunt utilizate pentru gestionarea rezervărilor, comunicarea cu oaspeții, procesarea și confirmarea plăților, transmiterea notificărilor legate de sejur, gestionarea solicitărilor și îndeplinirea obligațiilor legale.",
        ],
      },
      {
        title: "4. Temeiul juridic",
        body: [
          "Prelucrarea datelor poate avea la bază executarea sau pregătirea unui contract, îndeplinirea unei obligații legale, interesul legitim al operatorului sau consimțământul persoanei vizate, în funcție de situație.",
        ],
      },
      {
        title: "5. Furnizori și destinatari",
        body: [
          "Pentru furnizarea serviciilor, anumite date pot fi transmise furnizorilor tehnici utilizați pentru hosting, baze de date, procesarea plăților, transmiterea emailurilor și administrarea infrastructurii.",
          "Plățile online sunt procesate prin Stripe, iar mesajele email pot fi transmise prin servicii specializate precum Resend.",
        ],
      },
      {
        title: "6. Păstrarea datelor",
        body: [
          "Datele sunt păstrate doar pentru perioada necesară îndeplinirii scopurilor pentru care au fost colectate și pentru respectarea obligațiilor legale aplicabile.",
        ],
      },
      {
        title: "7. Drepturile persoanei vizate",
        body: [
          "În condițiile prevăzute de legislația aplicabilă, puteți solicita accesul la date, rectificarea, ștergerea, restricționarea prelucrării, portabilitatea datelor sau vă puteți opune anumitor prelucrări.",
          "Aveți, de asemenea, dreptul de a depune o plângere la autoritatea competentă pentru protecția datelor.",
        ],
      },
      {
        title: "8. Securitatea datelor",
        body: [
          "Sunshine Resort utilizează măsuri tehnice și organizatorice rezonabile pentru protejarea datelor împotriva accesului neautorizat, pierderii, modificării sau divulgării nepermise.",
        ],
      },
      {
        title: "9. Modificarea politicii",
        body: [
          "Prezenta politică poate fi actualizată periodic. Versiunea publicată pe website este versiunea aplicabilă la momentul consultării.",
        ],
      },
    ],
  },

  en: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    intro:
      "This policy explains how Sunshine Resort collects, uses and protects personal data when you use the website or make a reservation.",

    sections: [
      {
        title: "1. Data controller",
        body: [
          "The controller of personal data is Sunshine Resort.",
          "Complete legal identification and contact details will be added before the official launch of the website.",
        ],
      },
      {
        title: "2. Data we collect",
        body: [
          "Depending on the services used, we may collect your first and last name, email address, phone number, reservation details, stay dates, number of guests and any messages or requests you submit.",
          "For payment administration, we may process transaction status, payment amount and technical transaction identifiers. Sunshine Resort does not store complete bank card details.",
        ],
      },
      {
        title: "3. Purposes of processing",
        body: [
          "Personal data is used to manage reservations, communicate with guests, process and confirm payments, send stay-related notifications, handle requests and comply with legal obligations.",
        ],
      },
      {
        title: "4. Legal basis",
        body: [
          "Processing may be based on the performance or preparation of a contract, compliance with legal obligations, legitimate interests or consent, depending on the circumstances.",
        ],
      },
      {
        title: "5. Service providers and recipients",
        body: [
          "Certain data may be shared with technical providers used for hosting, databases, payment processing, email delivery and infrastructure management.",
          "Online payments are processed through Stripe, while email communications may be delivered using specialised providers such as Resend.",
        ],
      },
      {
        title: "6. Data retention",
        body: [
          "Personal data is retained only for as long as necessary for the purposes for which it was collected and to comply with applicable legal obligations.",
        ],
      },
      {
        title: "7. Your rights",
        body: [
          "Subject to applicable law, you may request access, rectification, deletion, restriction of processing, data portability or object to certain processing activities.",
          "You also have the right to lodge a complaint with the competent data protection authority.",
        ],
      },
      {
        title: "8. Data security",
        body: [
          "Sunshine Resort uses reasonable technical and organisational measures to protect personal data against unauthorised access, loss, alteration or disclosure.",
        ],
      },
      {
        title: "9. Changes to this policy",
        body: [
          "This policy may be updated periodically. The version published on the website is the version applicable at the time it is accessed.",
        ],
      },
    ],
  },
} as const;

export default async function PrivacyPolicyPage({
  params,
}: PrivacyPolicyPageProps) {
  const { locale } = await params;

  const currentLocale =
    locale === "en"
      ? "en"
      : "ro";

  const page =
    content[currentLocale];

  return (
    <main className="min-h-screen bg-[#050505] px-6 pb-24 pt-32 text-[#f5f2eb] sm:px-8 md:pb-32 md:pt-40">
      <section className="mx-auto max-w-5xl">
        <p className="text-[10px] uppercase tracking-[0.45em] text-gold">
          {page.eyebrow}
        </p>

        <h1 className="heading mt-6 max-w-4xl text-5xl font-light leading-tight md:text-7xl">
          {page.title}
        </h1>

        <div className="mt-8 h-px w-20 bg-gold/70" />

        <p className="mt-10 max-w-3xl text-sm leading-8 text-white/55 md:text-base md:leading-9">
          {page.intro}
        </p>

        <div className="mt-16 space-y-14 border-t border-white/10 pt-12">
          {page.sections.map((section) => (
            <section
              key={section.title}
              className="grid gap-5 md:grid-cols-[280px_1fr] md:gap-12"
            >
              <h2 className="heading text-2xl font-light text-white/90">
                {section.title}
              </h2>

              <div className="space-y-5">
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-8 text-white/50 md:text-[15px]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 border-t border-white/10 pt-8 text-xs leading-6 text-white/30">
          <p>
            {currentLocale === "en"
              ? "Last updated: August 2026"
              : "Ultima actualizare: august 2026"}
          </p>
        </div>
      </section>
    </main>
  );
}