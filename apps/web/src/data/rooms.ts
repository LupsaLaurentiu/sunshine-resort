export type PublicRoomContent = {
  slug: string;
  title: string;
  units: string[];
  shortDescription: string;
  description: string;
  image: string;
  gallery: string[];
  details: string[];
  amenities: string[];
};

export const publicRooms: PublicRoomContent[] = [
  {
    slug: "signature-apartment",
    title: "Signature Apartment",
    units: ["Apartment 1"],
    shortDescription:
      "Cel mai mare apartament, dispus pe un singur nivel.",
    description:
      "Cel mai spațios apartament Sunshine Resort, creat pentru confort premium, intimitate și o experiență adults-only rafinată pe un singur nivel.",
    image: "/images/room-signature-1.jpg",
    gallery: [
      "/images/room-signature-1.jpg",
      "/images/room-signature-2.jpg",
      "/images/room-signature-3.jpg",
    ],
    details: [
      "Un singur nivel",
      "Cel mai spațios",
      "2 adulți",
      "Baie premium",
    ],
    amenities: [
      "King Bed",
      "Smart TV",
      "Wi-Fi",
      "Coffee Station",
      "Private Bathroom",
    ],
  },
  {
    slug: "intimate-apartment",
    title: "Intimate Apartment",
    units: ["Apartment 2"],
    shortDescription:
      "Cel mai compact apartament, dispus pe un singur nivel.",
    description:
      "Un apartament intim și elegant, ideal pentru cupluri care caută liniște, confort și o atmosferă boutique discretă.",
    image: "/images/room-intimate-1.jpg",
    gallery: [
      "/images/room-intimate-1.jpg",
      "/images/room-intimate-2.jpg",
      "/images/room-intimate-3.jpg",
    ],
    details: [
      "Un singur nivel",
      "Cel mai intim",
      "2 adulți",
      "Ideal pentru cupluri",
    ],
    amenities: [
      "King Bed",
      "Smart TV",
      "Wi-Fi",
      "Coffee Station",
      "Private Bathroom",
    ],
  },
  {
    slug: "deluxe-apartment",
    title: "Deluxe Apartment",
    units: ["Apartment 3", "Apartment 6"],
    shortDescription:
      "Apartament duplex generos, cu baie principală, baie de serviciu, bucătărie și bar sub scară.",
    description:
      "Un apartament duplex spațios, cu zone generoase pentru relaxare, dormitor confortabil, bucătărie, baie principală, baie de serviciu și bar integrat sub scară.",
    image: "/images/room-deluxe-1.jpg",
    gallery: [
      "/images/room-deluxe-1.jpg",
      "/images/room-deluxe-2.jpg",
      "/images/room-deluxe-3.jpg",
    ],
    details: [
      "Două nivele",
      "Baie de serviciu",
      "Bar sub scară",
      "2 adulți",
    ],
    amenities: [
      "King Bed",
      "Smart TV",
      "Wi-Fi",
      "Kitchen",
      "Service Bathroom",
      "Bar",
    ],
  },
  {
    slug: "premium-apartment",
    title: "Premium Apartment",
    units: [
      "Apartment 4",
      "Apartment 5",
      "Apartment 7",
      "Apartment 8",
    ],
    shortDescription:
      "Apartament duplex mediu, cu dormitor la etaj, salon și bucătărie jos, două băi și bar sub scară.",
    description:
      "Un apartament duplex echilibrat, cu zonă de zi la parter, dormitor la etaj, două băi, bucătărie, salon și bar sub scară.",
    image: "/images/room-premium-1.jpg",
    gallery: [
      "/images/room-premium-1.jpg",
      "/images/room-premium-2.jpg",
      "/images/room-premium-3.jpg",
    ],
    details: [
      "Două nivele",
      "Două băi",
      "Dormitor la etaj",
      "2 adulți",
    ],
    amenities: [
      "King Bed",
      "Smart TV",
      "Wi-Fi",
      "Kitchen",
      "Two Bathrooms",
      "Bar",
    ],
  },
];

export function getPublicRoomContent(
  slug: string,
): PublicRoomContent | undefined {
  return publicRooms.find((room) => room.slug === slug);
}