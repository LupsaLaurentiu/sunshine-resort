type TermsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const TERMS_CONTENT = {
  ro: {
    eyebrow: "Legal",
    title: "Termeni și condiții",
    intro:
      "Prezentele termene și condiții reglementează utilizarea website-ului Sunshine Resort, procesul de rezervare, efectuarea plăților și principalele condiții aplicabile sejururilor rezervate direct prin platformă.",

    sections: [
      {
        title: "1. Informații generale",
        paragraphs: [
          "Sunshine Resort este un resort adults-only, destinat exclusiv oaspeților adulți și orientat către experiențe de relaxare, confort și ospitalitate premium.",
          "Datele complete de identificare juridică ale operatorului, sediul social, datele fiscale și informațiile oficiale de contact vor fi completate înainte de lansarea comercială a platformei.",
          "Prin utilizarea website-ului și transmiterea unei cereri de rezervare, utilizatorul confirmă că a citit și acceptă prezentele termene și condiții.",
        ],
      },
      {
        title: "2. Rezervări",
        paragraphs: [
          "Rezervările pot fi solicitate direct prin website-ul Sunshine Resort. O cerere transmisă prin website nu reprezintă confirmarea automată și definitivă a rezervării.",
          "După transmiterea cererii, aceasta este verificată de administrator. În cazul aprobării, clientul primește prin email confirmarea aprobării și un link securizat pentru efectuarea plății.",
          "Rezervarea devine confirmată după înregistrarea plății solicitate și procesarea acesteia de către sistem.",
          "Administratorul poate introduce și rezervări manuale. Aceste rezervări pot fi confirmate fără parcurgerea fluxului standard de plată online.",
        ],
      },
      {
        title: "3. Disponibilitate și alocarea apartamentului",
        paragraphs: [
          "Disponibilitatea afișată pe website este calculată pe baza informațiilor existente în sistem la momentul efectuării căutării.",
          "Rezervarea se efectuează pentru un anumit tip de apartament. Apartamentul fizic poate fi alocat ulterior de către sistem sau de către administrator, în funcție de disponibilitate și configurația rezervării.",
          "O cerere de rezervare aflată în procesul de aprobare poate bloca temporar disponibilitatea necesară pentru evitarea suprapunerilor și a rezervărilor multiple asupra aceleiași unități.",
        ],
      },
      {
        title: "4. Durata minimă a sejurului",
        paragraphs: [
          "Pentru rezervările cu check-in vineri sau sâmbătă se aplică o durată minimă de două nopți.",
          "Pentru rezervările cu check-in în celelalte zile ale săptămânii poate fi rezervată și o singură noapte, în limita disponibilității și a eventualelor condiții speciale afișate pentru perioada selectată.",
        ],
      },
      {
        title: "5. Adults Only",
        paragraphs: [
          "Sunshine Resort funcționează în regim adults-only.",
          "Rezervarea și cazarea sunt permise exclusiv persoanelor adulte, în conformitate cu politica resortului și cu legislația aplicabilă.",
        ],
      },
      {
        title: "6. Check-in și check-out",
        paragraphs: [
          "Ora standard de check-in este 14:00.",
          "Ora standard de check-out este 10:00.",
          "Solicitările privind sosirea anticipată sau plecarea întârziată pot fi acceptate numai în funcție de disponibilitate și pot implica costuri suplimentare.",
        ],
      },
      {
        title: "7. Prețuri",
        paragraphs: [
          "Prețurile sunt exprimate în RON și sunt calculate în funcție de tipul apartamentului, perioada selectată, zilele săptămânii, eventualele perioade tarifare speciale, promoții și servicii suplimentare aplicabile.",
          "Tarifele pentru nopțile din timpul săptămânii pot fi diferite de tarifele aplicabile nopților de weekend.",
          "Prețul final este recalculat și validat de sistem înainte de confirmarea rezervării.",
        ],
      },
      {
        title: "8. Plata rezervării",
        paragraphs: [
          "Pentru rezervările eligibile pentru plată online, clientul poate achita integral valoarea rezervării sau avansul minim indicat în procesul de plată.",
          "Avansul minim este de 50% din valoarea totală a rezervării.",
          "În cazul plății avansului, diferența poate fi achitată la locație, conform condițiilor comunicate pentru rezervarea respectivă.",
          "Plățile online sunt procesate prin Stripe. Sunshine Resort nu stochează datele complete ale cardului bancar.",
        ],
      },
      {
        title: "9. Termenul de plată",
        paragraphs: [
          "Linkul de plată este disponibil pentru perioada indicată în comunicarea transmisă clientului.",
          "Dacă plata nu este finalizată până la expirarea termenului comunicat, rezervarea poate expira automat, iar disponibilitatea apartamentului poate fi eliberată.",
          "Simpla deschidere a paginii de plată nu reprezintă efectuarea plății.",
        ],
      },
      {
        title: "10. Confirmarea plății",
        paragraphs: [
          "Confirmarea unei tranzacții este realizată pe baza notificării primite de sistem de la procesatorul de plăți.",
          "Pagina afișată clientului după revenirea din Stripe are rol informativ. Confirmarea efectivă a rezervării este realizată de sistem după validarea tranzacției.",
          "Clientul va primi prin email confirmarea rezervării după procesarea cu succes a plății.",
        ],
      },
      {
        title: "11. Anularea rezervării",
        paragraphs: [
          "Rezervarea poate fi anulată cu minimum 30 de zile înainte de data programată pentru check-in.",
          "În cazul anulării efectuate cu respectarea acestui termen, sumele achitate pentru rezervare sunt rambursate integral.",
          "Dacă până la data programată pentru check-in au rămas mai puțin de 30 de zile, rezervarea nu mai poate fi anulată.",
          "În cazul rezervărilor efectuate printr-o platformă terță, se pot aplica termenii și condițiile de anulare ale platformei respective.",
        ],
      },
      {
        title: "12. Modificarea rezervării",
        paragraphs: [
          "O cerere de modificare a rezervării trebuie transmisă cu minimum 15 zile înainte de data programată pentru check-in.",
          "Orice modificare este supusă aprobării administratorului și disponibilității pentru noua perioadă solicitată.",
          "Dacă noua rezervare are o valoare mai mare, diferența de preț trebuie achitată înainte de confirmarea modificării.",
          "Dacă noua perioadă are o valoare mai mică, diferența de preț nu se rambursează.",
          "Cu mai puțin de 15 zile înainte de data programată pentru check-in, rezervarea nu mai poate fi modificată.",
        ],
      },
      {
        title: "13. Rambursări",
        paragraphs: [
          "Eventualele rambursări sunt analizate și procesate în funcție de condițiile rezervării, momentul anulării, modalitatea de plată și politica aplicabilă.",
          "Durata efectivă până la apariția unei sume rambursate în contul clientului poate depinde și de procesatorul de plăți sau de banca emitentă a cardului.",
        ],
      },
      {
        title: "14. Facturare",
        paragraphs: [
          "Facturarea automată poate fi disponibilă pentru rezervările achitate integral online, în conformitate cu configurația sistemului și cu obligațiile legale aplicabile.",
          "Pentru alte tipuri de plată, documentele fiscale pot fi emise conform procedurilor administrative ale Sunshine Resort.",
        ],
      },
      {
        title: "15. Comunicări și notificări",
        paragraphs: [
          "Clientul poate primi emailuri referitoare la cererea de rezervare, aprobarea acesteia, plată, confirmarea rezervării, apropierea datei de check-in, informații înainte de check-out și comunicări ulterioare sejurului.",
          "Clientul este responsabil pentru furnizarea unei adrese de email și a unor date de contact corecte.",
        ],
      },
      {
        title: "16. Regulile resortului",
        paragraphs: [
          "Oaspeții au obligația să respecte regulile interne ale Sunshine Resort, indicațiile privind utilizarea facilităților și orice instrucțiuni comunicate înainte sau în timpul sejurului.",
          "Comportamentul care poate afecta siguranța, confortul sau intimitatea celorlalți oaspeți ori poate produce deteriorări proprietății poate conduce la întreruperea sejurului, conform legislației aplicabile.",
        ],
      },
      {
        title: "17. Răspundere",
        paragraphs: [
          "Sunshine Resort depune eforturi rezonabile pentru ca informațiile privind disponibilitatea, tarifele și serviciile afișate pe website să fie corecte și actualizate.",
          "Pot exista situații excepționale generate de erori tehnice, indisponibilitatea unor servicii externe, mentenanță sau alte circumstanțe care nu pot fi controlate în mod rezonabil.",
          "În asemenea situații, Sunshine Resort va încerca să remedieze problema și să informeze persoanele afectate într-un termen rezonabil.",
        ],
      },
      {
        title: "18. Servicii externe",
        paragraphs: [
          "Platforma poate utiliza servicii furnizate de terți pentru procesarea plăților, trimiterea emailurilor, hosting, baze de date și alte componente tehnice necesare funcționării sistemului.",
          "Utilizarea acestor servicii poate fi supusă și termenilor proprii ai furnizorilor respectivi.",
        ],
      },
      {
        title: "19. Protecția datelor",
        paragraphs: [
          "Prelucrarea datelor cu caracter personal este descrisă separat în Politica de confidențialitate Sunshine Resort.",
          "Prin utilizarea website-ului, clientul este încurajat să consulte această politică înainte de transmiterea unei rezervări.",
        ],
      },
      {
        title: "20. Modificarea termenilor",
        paragraphs: [
          "Sunshine Resort poate actualiza periodic prezentele termene și condiții pentru a reflecta modificări ale serviciilor, politicilor interne sau cerințelor legale.",
          "Versiunea publicată pe website este versiunea aplicabilă la momentul consultării.",
        ],
      },
    ],

    lastUpdated: "Ultima actualizare: august 2026",
  },

  en: {
    eyebrow: "Legal",
    title: "Terms & Conditions",
    intro:
      "These Terms and Conditions govern the use of the Sunshine Resort website, the reservation process, payments and the main conditions applicable to stays booked directly through the platform.",

    sections: [
      {
        title: "1. General information",
        paragraphs: [
          "Sunshine Resort is an adults-only resort dedicated exclusively to adult guests and focused on relaxation, comfort and premium hospitality experiences.",
          "The operator's full legal identification details, registered office, tax information and official contact details will be completed before the commercial launch of the platform.",
          "By using the website and submitting a reservation request, the user confirms that they have read and accepted these Terms and Conditions.",
        ],
      },
      {
        title: "2. Reservations",
        paragraphs: [
          "Reservations may be requested directly through the Sunshine Resort website. A request submitted through the website does not constitute an automatic and final reservation confirmation.",
          "After submission, the request is reviewed by the administrator. If approved, the guest receives an email confirming the approval together with a secure payment link.",
          "The reservation becomes confirmed after the required payment has been registered and successfully processed by the system.",
          "Administrators may also create manual reservations. Such reservations may be confirmed without following the standard online payment flow.",
        ],
      },
      {
        title: "3. Availability and apartment allocation",
        paragraphs: [
          "Availability displayed on the website is calculated using the information available in the system at the time of the search.",
          "Reservations are made for a specific apartment type. The physical apartment may subsequently be assigned by the system or by an administrator depending on availability and the reservation configuration.",
          "A reservation request undergoing approval may temporarily block the required availability in order to prevent overlapping reservations.",
        ],
      },
      {
        title: "4. Minimum stay",
        paragraphs: [
          "Reservations with check-in on Friday or Saturday require a minimum stay of two nights.",
          "For check-ins on the other days of the week, a one-night stay may be booked subject to availability and any special conditions displayed for the selected period.",
        ],
      },
      {
        title: "5. Adults Only",
        paragraphs: [
          "Sunshine Resort operates as an adults-only property.",
          "Reservations and accommodation are available exclusively to adult guests, subject to resort policy and applicable legislation.",
        ],
      },
      {
        title: "6. Check-in and check-out",
        paragraphs: [
          "Standard check-in time is 2:00 PM.",
          "Standard check-out time is 10:00 AM.",
          "Early arrival or late departure requests may only be accepted subject to availability and may incur additional charges.",
        ],
      },
      {
        title: "7. Prices",
        paragraphs: [
          "Prices are expressed in RON and are calculated according to apartment type, selected dates, day of the week, special rate periods, promotions and any applicable additional services.",
          "Weekday nightly rates may differ from weekend rates.",
          "The final price is recalculated and validated by the reservation system before confirmation.",
        ],
      },
      {
        title: "8. Reservation payment",
        paragraphs: [
          "For reservations eligible for online payment, guests may pay the full reservation amount or the minimum deposit displayed during checkout.",
          "The minimum deposit is 50% of the total reservation value.",
          "When only the deposit is paid online, the remaining balance may be paid at the property in accordance with the conditions communicated for the reservation.",
          "Online payments are processed by Stripe. Sunshine Resort does not store complete payment card details.",
        ],
      },
      {
        title: "9. Payment deadline",
        paragraphs: [
          "The payment link remains available for the period stated in the communication sent to the guest.",
          "If payment is not completed before the communicated deadline, the reservation may automatically expire and the apartment availability may be released.",
          "Opening the payment page does not constitute payment.",
        ],
      },
      {
        title: "10. Payment confirmation",
        paragraphs: [
          "Transaction confirmation is based on the payment notification received by the system from the payment processor.",
          "The page displayed after returning from Stripe is informational. Final reservation confirmation is performed by the system after the transaction has been validated.",
          "The guest will receive an email confirming the reservation after successful payment processing.",
        ],
      },
      {
        title: "11. Cancellation",
        paragraphs: [
          "A reservation may be cancelled at least 30 days before the scheduled check-in date.",
          "When the cancellation is made within this period, all amounts paid for the reservation will be refunded in full.",
          "If fewer than 30 days remain before the scheduled check-in date, the reservation can no longer be cancelled.",
          "Reservations made through third-party platforms may be subject to the cancellation terms and conditions of the respective platform.",
        ],
      },
      {
        title: "12. Reservation changes",
        paragraphs: [
          "A request to modify a reservation must be submitted at least 15 days before the scheduled check-in date.",
          "Any modification is subject to administrator approval and availability for the newly requested period.",
          "If the modified reservation has a higher value, the price difference must be paid before the modification is confirmed.",
          "If the new period has a lower value, the price difference will not be refunded.",
          "If fewer than 15 days remain before the scheduled check-in date, the reservation can no longer be modified.",
        ],
      },
      {
        title: "13. Refunds",
        paragraphs: [
          "Any refund is assessed and processed according to the reservation conditions, timing of the cancellation, payment method and applicable policy.",
          "The time required for a refunded amount to appear in the guest's account may also depend on the payment processor or issuing bank.",
        ],
      },
      {
        title: "14. Invoicing",
        paragraphs: [
          "Automatic invoicing may be available for reservations paid in full online, subject to system configuration and applicable legal requirements.",
          "For other payment methods, fiscal documents may be issued according to Sunshine Resort administrative procedures.",
        ],
      },
      {
        title: "15. Communications and notifications",
        paragraphs: [
          "Guests may receive emails concerning the reservation request, approval, payment, reservation confirmation, upcoming check-in, pre-check-out information and post-stay communications.",
          "Guests are responsible for providing a valid email address and accurate contact information.",
        ],
      },
      {
        title: "16. Resort rules",
        paragraphs: [
          "Guests must comply with Sunshine Resort's internal rules, instructions concerning the use of facilities and any information provided before or during the stay.",
          "Behaviour that may affect the safety, comfort or privacy of other guests or cause damage to the property may result in termination of the stay in accordance with applicable law.",
        ],
      },
      {
        title: "17. Liability",
        paragraphs: [
          "Sunshine Resort takes reasonable measures to ensure that information concerning availability, rates and services displayed on the website is accurate and up to date.",
          "Exceptional situations may arise due to technical errors, external service outages, maintenance or other circumstances that cannot reasonably be controlled.",
          "In such situations, Sunshine Resort will make reasonable efforts to resolve the issue and inform affected guests.",
        ],
      },
      {
        title: "18. Third-party services",
        paragraphs: [
          "The platform may use third-party services for payment processing, email delivery, hosting, databases and other technical components required for operation.",
          "Use of such services may also be subject to the respective providers' own terms and conditions.",
        ],
      },
      {
        title: "19. Data protection",
        paragraphs: [
          "The processing of personal data is described separately in the Sunshine Resort Privacy Policy.",
          "Guests are encouraged to review that policy before submitting a reservation.",
        ],
      },
      {
        title: "20. Changes to these terms",
        paragraphs: [
          "Sunshine Resort may periodically update these Terms and Conditions to reflect changes to services, internal policies or legal requirements.",
          "The version published on the website is the version applicable at the time of access.",
        ],
      },
    ],

    lastUpdated: "Last updated: August 2026",
  },
} as const;

export default async function TermsPage({
  params,
}: TermsPageProps) {
  const { locale } = await params;

  const currentLocale =
    locale === "en"
      ? "en"
      : "ro";

  const content =
    TERMS_CONTENT[currentLocale];

  return (
    <main className="min-h-screen bg-[#050505] px-6 pb-24 pt-32 text-[#f5f2eb] sm:px-8 md:pb-32 md:pt-40">
      <section className="mx-auto max-w-5xl">
        <p className="text-[10px] font-medium uppercase tracking-[0.45em] text-gold">
          {content.eyebrow}
        </p>

        <h1 className="heading mt-6 max-w-4xl text-5xl font-light leading-tight tracking-[-0.015em] md:text-7xl">
          {content.title}
        </h1>

        <div className="mt-8 h-px w-20 bg-gold/70" />

        <p className="mt-10 max-w-3xl text-sm leading-8 text-white/55 md:text-base md:leading-9">
          {content.intro}
        </p>

        <div className="mt-16 space-y-14 border-t border-white/10 pt-12 md:mt-20 md:space-y-16 md:pt-16">
          {content.sections.map(
            (section) => (
              <section
                key={section.title}
                className="grid gap-5 border-b border-white/[0.07] pb-12 last:border-b-0 md:grid-cols-[300px_minmax(0,1fr)] md:gap-14 md:pb-16"
              >
                <h2 className="heading text-2xl font-light leading-snug text-white/90 md:text-[28px]">
                  {section.title}
                </h2>

                <div className="space-y-5">
                  {section.paragraphs.map(
                    (
                      paragraph,
                      index,
                    ) => (
                      <p
                        key={`${section.title}-${index}`}
                        className="text-sm leading-8 text-white/50 md:text-[15px]"
                      >
                        {paragraph}
                      </p>
                    ),
                  )}
                </div>
              </section>
            ),
          )}
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 md:mt-20">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">
            {content.lastUpdated}
          </p>
        </div>
      </section>
    </main>
  );
}