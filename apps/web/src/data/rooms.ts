import type {
  PublicLocale,
} from "@/lib/public-routes";

export type LocalizedRoomContent = {
  title: string;
  units: string[];
  shortDescription: string;
  description: string;
  details: string[];
  amenities: string[];
};

export type PublicRoomContent = {
  slug: string;
  image: string;
  gallery: string[];

  content: Record<
    PublicLocale,
    LocalizedRoomContent
  >;
};

export const publicRooms: PublicRoomContent[] = [
  {
    slug: "signature-apartment",

    image:
      "/images/room-signature-1.jpg",

    gallery: [
      "/images/room-signature-1.jpg",
      "/images/room-signature-2.jpg",
      "/images/room-signature-3.jpg",
    ],

    content: {
      ro: {
        title:
          "Apartament Signature",

        units: [
          "Apartamentul 1",
        ],

        shortDescription:
          "Cel mai spațios apartament al resortului, dispus integral pe un singur nivel.",

        description:
          "Cel mai spațios apartament Sunshine Resort, creat pentru confort premium, intimitate și o experiență adults-only rafinată. Dispunerea pe un singur nivel oferă acces facil, spațiu generos și o atmosferă elegantă, potrivită pentru un sejur relaxant în doi.",

        details: [
          "Un singur nivel",
          "Cel mai spațios",
          "Maximum 2 adulți",
          "Baie premium",
        ],

        amenities: [
          "Pat king-size",
          "Smart TV",
          "Wi-Fi",
          "Stație pentru cafea",
          "Baie privată",
        ],
      },

      en: {
        title:
          "Signature Apartment",

        units: [
          "Apartment 1",
        ],

        shortDescription:
          "The resort’s most spacious apartment, arranged entirely on one level.",

        description:
          "The most spacious apartment at Sunshine Resort, created for premium comfort, privacy and a refined adults-only experience. Its single-level layout provides easy access, generous space and an elegant atmosphere designed for a relaxing stay for two.",

        details: [
          "Single level",
          "Most spacious",
          "Maximum 2 adults",
          "Premium bathroom",
        ],

        amenities: [
          "King-size bed",
          "Smart TV",
          "Wi-Fi",
          "Coffee station",
          "Private bathroom",
        ],
      },
    },
  },

  {
    slug: "intimate-apartment",

    image:
      "/images/room-intimate-1.jpg",

    gallery: [
      "/images/room-intimate-1.jpg",
      "/images/room-intimate-2.jpg",
      "/images/room-intimate-3.jpg",
    ],

    content: {
      ro: {
        title:
          "Apartament Intimate",

        units: [
          "Apartamentul 2",
        ],

        shortDescription:
          "Cel mai compact apartament al resortului, dispus pe un singur nivel.",

        description:
          "Un apartament intim și elegant, ideal pentru cuplurile care caută liniște, confort și o atmosferă boutique discretă. Spațiul este organizat pe un singur nivel și pune accent pe simplitate, funcționalitate și relaxare.",

        details: [
          "Un singur nivel",
          "Cel mai intim",
          "Maximum 2 adulți",
          "Ideal pentru cupluri",
        ],

        amenities: [
          "Pat king-size",
          "Smart TV",
          "Wi-Fi",
          "Stație pentru cafea",
          "Baie privată",
        ],
      },

      en: {
        title:
          "Intimate Apartment",

        units: [
          "Apartment 2",
        ],

        shortDescription:
          "The resort’s most compact apartment, arranged on a single level.",

        description:
          "An intimate and elegant apartment, ideal for couples seeking quiet moments, comfort and a discreet boutique atmosphere. The single-level layout focuses on simplicity, functionality and relaxation.",

        details: [
          "Single level",
          "Most intimate",
          "Maximum 2 adults",
          "Ideal for couples",
        ],

        amenities: [
          "King-size bed",
          "Smart TV",
          "Wi-Fi",
          "Coffee station",
          "Private bathroom",
        ],
      },
    },
  },

  {
    slug: "deluxe-apartment",

    image:
      "/images/room-deluxe-1.jpg",

    gallery: [
      "/images/room-deluxe-1.jpg",
      "/images/room-deluxe-2.jpg",
      "/images/room-deluxe-3.jpg",
    ],

    content: {
      ro: {
        title:
          "Apartament Deluxe",

        units: [
          "Apartamentul 3",
          "Apartamentul 6",
        ],

        shortDescription:
          "Apartament duplex generos, cu dormitor la etaj, bucătărie, două băi și bar integrat sub scară.",

        description:
          "Un apartament duplex spațios, cu zone generoase pentru relaxare și o compartimentare creată pentru confort. Dormitorul și baia principală se află la etaj, iar parterul include bucătăria, zona de zi, o baie de serviciu și un bar integrat sub scară.",

        details: [
          "Două niveluri",
          "Două băi",
          "Bar sub scară",
          "Maximum 2 adulți",
        ],

        amenities: [
          "Pat king-size",
          "Smart TV",
          "Wi-Fi",
          "Bucătărie",
          "Baie de serviciu",
          "Bar",
        ],
      },

      en: {
        title:
          "Deluxe Apartment",

        units: [
          "Apartment 3",
          "Apartment 6",
        ],

        shortDescription:
          "A generous duplex apartment with an upstairs bedroom, kitchen, two bathrooms and a built-in bar beneath the staircase.",

        description:
          "A spacious duplex apartment with generous relaxation areas and a layout designed for comfort. The bedroom and main bathroom are located upstairs, while the ground floor includes the kitchen, living area, service bathroom and a built-in bar beneath the staircase.",

        details: [
          "Two levels",
          "Two bathrooms",
          "Bar beneath the staircase",
          "Maximum 2 adults",
        ],

        amenities: [
          "King-size bed",
          "Smart TV",
          "Wi-Fi",
          "Kitchen",
          "Service bathroom",
          "Bar",
        ],
      },
    },
  },

  {
    slug: "premium-apartment",

    image:
      "/images/room-premium-1.jpg",

    gallery: [
      "/images/room-premium-1.jpg",
      "/images/room-premium-2.jpg",
      "/images/room-premium-3.jpg",
    ],

    content: {
      ro: {
        title:
          "Apartament Premium",

        units: [
          "Apartamentul 4",
          "Apartamentul 5",
          "Apartamentul 7",
          "Apartamentul 8",
        ],

        shortDescription:
          "Apartament duplex echilibrat, cu dormitor la etaj, salon, bucătărie, două băi și bar sub scară.",

        description:
          "Un apartament duplex bine echilibrat, cu zona de zi, bucătăria și salonul la parter, iar dormitorul principal la etaj. Cele două băi și barul integrat sub scară completează o experiență confortabilă și elegantă pentru două persoane.",

        details: [
          "Două niveluri",
          "Două băi",
          "Dormitor la etaj",
          "Maximum 2 adulți",
        ],

        amenities: [
          "Pat king-size",
          "Smart TV",
          "Wi-Fi",
          "Bucătărie",
          "Două băi",
          "Bar",
        ],
      },

      en: {
        title:
          "Premium Apartment",

        units: [
          "Apartment 4",
          "Apartment 5",
          "Apartment 7",
          "Apartment 8",
        ],

        shortDescription:
          "A balanced duplex apartment with an upstairs bedroom, lounge, kitchen, two bathrooms and a bar beneath the staircase.",

        description:
          "A well-balanced duplex apartment with the living area, kitchen and lounge on the ground floor and the main bedroom upstairs. Two bathrooms and a built-in bar beneath the staircase complete a comfortable and elegant experience for two guests.",

        details: [
          "Two levels",
          "Two bathrooms",
          "Upstairs bedroom",
          "Maximum 2 adults",
        ],

        amenities: [
          "King-size bed",
          "Smart TV",
          "Wi-Fi",
          "Kitchen",
          "Two bathrooms",
          "Bar",
        ],
      },
    },
  },
];

export function getPublicRoomContent(
  slug: string,
): PublicRoomContent | undefined {
  return publicRooms.find(
    (room) =>
      room.slug === slug,
  );
}

export function getLocalizedRoomContent(
  slug: string,
  locale: PublicLocale,
): LocalizedRoomContent | undefined {
  const room =
    getPublicRoomContent(
      slug,
    );

  return room?.content[locale];
}