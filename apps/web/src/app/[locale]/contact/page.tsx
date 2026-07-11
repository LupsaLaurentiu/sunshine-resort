import { ContactCTA } from "@/components/contact/ContactCTA";
import { ContactDetails } from "@/components/contact/ContactDetails";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactIntro } from "@/components/contact/ContactIntro";
import { ContactLocation } from "@/components/contact/ContactLocation";

export default function ContactPage() {
  return (
    <main>
      <ContactHero />
      <ContactIntro />
      <ContactDetails />
      <ContactLocation />
      <ContactCTA />
    </main>
  );
}