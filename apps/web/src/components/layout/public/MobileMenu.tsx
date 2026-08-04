"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import Image from "next/image";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  ArrowRight,
  X,
} from "lucide-react";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

type MenuLink = {
  number: string;
  label: string;
  eyebrow: string;
  href: string;
  image: string;
};

type BodyStylesSnapshot = {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  overflow: string;
  paddingRight: string;
};

const links: MenuLink[] = [
  {
    number: "01",
    label: "Acasă",
    eyebrow: "Sunshine Resort",
    href: "/ro",
    image: "/hero-mockup.jpg",
  },
  {
    number: "02",
    label: "Camere",
    eyebrow: "Apartamente",
    href: "/ro/rooms",
    image: "/images/room-premium-1.jpg",
  },
  {
    number: "03",
    label: "Facilități",
    eyebrow: "Experiența resortului",
    href: "/ro/facilities",
    image: "/images/atractions-1.jpg",
  },
  {
    number: "04",
    label: "Piscină cu apă sărată",
    eyebrow: "Wellness",
    href: "/ro/salt-water-pool",
    image: "/images/pool-salt.jpg",
  },
  {
    number: "05",
    label: "Atracții turistice",
    eyebrow: "Descoperă împrejurimile",
    href: "/ro/attractions",
    image: "/images/atractions-2.jpg",
  },
  {
    number: "06",
    label: "Galerie",
    eyebrow: "Momente Sunshine",
    href: "/ro/gallery",
    image: "/images/room-deluxe-1.jpg",
  },
  {
    number: "07",
    label: "Despre noi",
    eyebrow: "Povestea resortului",
    href: "/ro/about",
    image: "/images/about-slow.webp",
  },
  {
    number: "08",
    label: "Contact",
    eyebrow: "Suntem aici pentru tine",
    href: "/ro/contact",
    image: "/images/ogna-sugatag-4.png",
  },
];

const easing = [
  0.22,
  1,
  0.36,
  1,
] as const;

const openPanelTransition = {
  duration: 0.6,
  ease: easing,
};

const closePanelTransition = {
  duration: 0.32,
  ease: easing,
};

export function MobileMenu({
  isOpen,
  onClose,
}: MobileMenuProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [
    activeLinkIndex,
    setActiveLinkIndex,
  ] = useState(0);

  const scrollPositionRef =
    useRef(0);

  const isScrollLockedRef =
    useRef(false);

  const pendingNavigationRef =
    useRef<string | null>(null);

  const bodyStylesRef =
    useRef<BodyStylesSnapshot>({
      position: "",
      top: "",
      left: "",
      right: "",
      width: "",
      overflow: "",
      paddingRight: "",
    });

  const htmlOverflowRef =
    useRef("");

  const htmlScrollBehaviorRef =
    useRef("");

  const activeLink =
    links[activeLinkIndex];

  const lockPageScroll =
    useCallback(() => {
      if (
        isScrollLockedRef.current
      ) {
        return;
      }

      const body =
        document.body;

      const html =
        document.documentElement;

      const scrollbarWidth =
        window.innerWidth -
        html.clientWidth;

      scrollPositionRef.current =
        window.scrollY;

      bodyStylesRef.current = {
        position:
          body.style.position,

        top:
          body.style.top,

        left:
          body.style.left,

        right:
          body.style.right,

        width:
          body.style.width,

        overflow:
          body.style.overflow,

        paddingRight:
          body.style.paddingRight,
      };

      htmlOverflowRef.current =
        html.style.overflow;

      htmlScrollBehaviorRef.current =
        html.style.scrollBehavior;

      body.style.position =
        "fixed";

      body.style.top =
        `-${scrollPositionRef.current}px`;

      body.style.left =
        "0";

      body.style.right =
        "0";

      body.style.width =
        "100%";

      body.style.overflow =
        "hidden";

      html.style.overflow =
        "hidden";

      if (scrollbarWidth > 0) {
        body.style.paddingRight =
          `${scrollbarWidth}px`;
      }

      isScrollLockedRef.current =
        true;
    }, []);

  const unlockPageScroll =
    useCallback(() => {
      if (
        !isScrollLockedRef.current
      ) {
        return;
      }

      const body =
        document.body;

      const html =
        document.documentElement;

      const previousBodyStyles =
        bodyStylesRef.current;

      const savedScrollPosition =
        scrollPositionRef.current;

      /*
       * Restaurarea poziției trebuie să fie instantanee,
       * ca să nu apară un salt între scoaterea lui
       * position: fixed și revenirea la scrollul anterior.
       */
      html.style.scrollBehavior =
        "auto";

      body.style.position =
        previousBodyStyles.position;

      body.style.top =
        previousBodyStyles.top;

      body.style.left =
        previousBodyStyles.left;

      body.style.right =
        previousBodyStyles.right;

      body.style.width =
        previousBodyStyles.width;

      body.style.overflow =
        previousBodyStyles.overflow;

      body.style.paddingRight =
        previousBodyStyles.paddingRight;

      html.style.overflow =
        htmlOverflowRef.current;

      isScrollLockedRef.current =
        false;

      window.scrollTo({
        top: savedScrollPosition,
        left: 0,
        behavior: "auto",
      });

      window.requestAnimationFrame(
        () => {
          window.requestAnimationFrame(
            () => {
              html.style.scrollBehavior =
                htmlScrollBehaviorRef.current;
            },
          );
        },
      );
    }, []);

  const handleExitComplete =
    useCallback(() => {
      unlockPageScroll();

      const pendingHref =
        pendingNavigationRef.current;

      pendingNavigationRef.current =
        null;

      if (!pendingHref) {
        return;
      }

      /*
       * Dacă utilizatorul selectează pagina pe care
       * se află deja, ruta nu se schimbă, deci
       * ScrollToTop nu ar mai primi un pathname nou.
       */
      if (
        pendingHref === pathname
      ) {
        window.requestAnimationFrame(
          () => {
            window.scrollTo({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
          },
        );

        return;
      }

      /*
       * Ruta este schimbată numai după ce meniul și-a
       * terminat animația și pagina a fost deblocată.
       */
      router.push(
        pendingHref,
        {
          scroll: false,
        },
      );
    }, [
      pathname,
      router,
      unlockPageScroll,
    ]);

  function handleNavigation(
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    /*
     * Păstrăm comportamentul normal pentru:
     * Ctrl + click, Cmd + click, Shift + click
     * și deschiderea într-un tab nou.
     */
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    pendingNavigationRef.current =
      href;

    onClose();
  }

  function handleClose() {
    pendingNavigationRef.current =
      null;

    onClose();
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    pendingNavigationRef.current =
      null;

    lockPageScroll();

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [
    isOpen,
    lockPageScroll,
  ]);

  useEffect(() => {
    if (isOpen) {
      setActiveLinkIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      unlockPageScroll();
    };
  }, [unlockPageScroll]);

  return (
    <AnimatePresence
      initial={false}
      onExitComplete={
        handleExitComplete
      }
    >
      {isOpen && (
        <motion.div
          key="mobile-menu"
          initial={{
            opacity: 0,
            pointerEvents:
              "none",
          }}
          animate={{
            opacity: 1,
            pointerEvents:
              "auto",
          }}
          exit={{
            opacity: 0,
            pointerEvents:
              "none",
          }}
          transition={{
            duration: 0.28,
            ease: easing,
          }}
          className="fixed inset-0 z-[999] overflow-hidden bg-[#050505] text-[#f5f2eb]"
        >
          <motion.button
            type="button"
            onClick={handleClose}
            aria-label="Închide meniul"
            initial={{
              opacity: 0,
              rotate: -35,
            }}
            animate={{
              opacity: 1,
              rotate: 0,
            }}
            exit={{
              opacity: 0,
              rotate: 25,

              transition: {
                duration: 0.16,
              },
            }}
            transition={{
              delay: 0.15,
              duration: 0.35,
              ease: easing,
            }}
            className="absolute left-5 top-5 z-50 flex h-11 w-11 items-center justify-center text-white/65 transition hover:text-gold md:left-7 md:top-7"
          >
            <X className="h-7 w-7 stroke-[1.15]" />
          </motion.button>

          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,

              transition: {
                duration: 0.15,
              },
            }}
            transition={{
              delay: 0.18,
              duration: 0.35,
              ease: easing,
            }}
            className="absolute right-6 top-8 z-50 flex items-center gap-5 text-[10px] uppercase tracking-[0.32em] md:right-8 md:top-9"
          >
            <Link
              href="/ro"
              onClick={(event) =>
                handleNavigation(
                  event,
                  "/ro",
                )
              }
              className="text-gold"
            >
              RO
            </Link>

            <span className="text-white/25">
              /
            </span>

            <Link
              href="/en"
              onClick={(event) =>
                handleNavigation(
                  event,
                  "/en",
                )
              }
              className="text-white/65 transition hover:text-gold"
            >
              EN
            </Link>

            <span className="h-5 w-px bg-white/20" />

            <Link
              href="/ro/book"
              onClick={(event) =>
                handleNavigation(
                  event,
                  "/ro/book",
                )
              }
              className="text-gold transition hover:text-white"
            >
              Book
            </Link>
          </motion.div>

          <div className="grid h-full lg:grid-cols-[36%_64%]">
            <motion.section
              initial={{
                x: "-100%",
              }}
              animate={{
                x: 0,

                transition:
                  openPanelTransition,
              }}
              exit={{
                x: "-100%",

                transition:
                  closePanelTransition,
              }}
              className="relative z-20 flex min-h-0 flex-col border-white/10 bg-[#070707] lg:border-r"
            >
              <div className="flex min-h-0 flex-1 flex-col px-7 pb-7 pt-24 sm:px-10 lg:px-12 lg:pb-8 lg:pt-10 xl:px-16">
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -14,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,

                    transition: {
                      duration: 0.15,
                    },
                  }}
                  transition={{
                    delay: 0.2,
                    duration: 0.42,
                    ease: easing,
                  }}
                  className="hidden flex-col items-center text-center lg:flex"
                >
                  <Image
                    src="/logo-sunshine.png"
                    alt="Sunshine Resort"
                    width={180}
                    height={120}
                    priority
                    style={{
                      width: "150px",
                      height: "auto",
                    }}
                    className="brightness-0 invert"
                  />

                  <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[9px] uppercase tracking-[0.36em]">
                    <span className="text-gold">
                      Sunshine Resort
                    </span>

                    <span className="h-4 w-px bg-white/25" />

                    <span className="text-white/70">
                      Adults Only
                    </span>

                    <span className="h-4 w-px bg-white/25" />

                    <span className="text-white/70">
                      Boutique Escape
                    </span>
                  </div>
                </motion.div>

                <nav className="flex min-h-0 flex-1 items-center py-7 lg:py-4">
                  <ul className="w-full space-y-2.5 sm:space-y-3 lg:space-y-2">
                    {links.map(
                      (
                        link,
                        index,
                      ) => {
                        const isActive =
                          activeLinkIndex ===
                          index;

                        return (
                          <motion.li
                            key={link.href}
                            initial={{
                              opacity: 0,
                              x: -24,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            exit={{
                              opacity: 0,
                              x: -16,

                              transition: {
                                duration: 0.12,

                                delay:
                                  index *
                                  0.01,
                              },
                            }}
                            transition={{
                              delay:
                                0.08 +
                                index *
                                  0.035,

                              duration: 0.42,
                              ease: easing,
                            }}
                          >
                            <Link
                              href={link.href}
                              onClick={(event) =>
                                handleNavigation(
                                  event,
                                  link.href,
                                )
                              }
                              onMouseEnter={() =>
                                setActiveLinkIndex(
                                  index,
                                )
                              }
                              onFocus={() =>
                                setActiveLinkIndex(
                                  index,
                                )
                              }
                              className="group grid grid-cols-[34px_1fr] items-center gap-3 py-1.5"
                            >
                              <span
                                className={`text-[8px] tracking-[0.3em] transition duration-300 ${
                                  isActive
                                    ? "text-gold"
                                    : "text-white/15"
                                }`}
                              >
                                {link.number}
                              </span>

                              <span className="flex min-w-0 items-center gap-4">
                                <span
                                  className={`h-px shrink-0 transition-all duration-500 ${
                                    isActive
                                      ? "w-7 bg-gold"
                                      : "w-0 bg-gold/40 group-hover:w-7"
                                  }`}
                                />

                                <span
                                  className={`heading min-w-0 font-light leading-none transition duration-500 ${
                                    isActive
                                      ? "translate-x-1 text-[2rem] text-gold xl:text-[2.15rem]"
                                      : "text-[1.8rem] text-white/68 group-hover:translate-x-1 group-hover:text-gold xl:text-[1.95rem]"
                                  }`}
                                >
                                  {link.label}
                                </span>
                              </span>
                            </Link>
                          </motion.li>
                        );
                      },
                    )}
                  </ul>
                </nav>

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 8,

                    transition: {
                      duration: 0.14,
                    },
                  }}
                  transition={{
                    delay: 0.3,
                    duration: 0.4,
                    ease: easing,
                  }}
                  className="flex items-end justify-between gap-6 border-t border-white/10 pt-6 text-[8px] uppercase tracking-[0.28em] text-white/25"
                >
                  <div>
                    <p className="text-gold">
                      Sunshine Resort
                    </p>

                    <p className="mt-2">
                      Adults Only
                    </p>
                  </div>

                  <div className="text-right">
                    <Link
                      href="#"
                      className="transition hover:text-gold"
                    >
                      Instagram
                    </Link>

                    <Link
                      href="#"
                      className="mt-2 block transition hover:text-gold"
                    >
                      Facebook
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.section>

            <motion.section
              initial={{
                opacity: 0,
                scale: 1.045,
              }}
              animate={{
                opacity: 1,
                scale: 1,

                transition: {
                  duration: 0.7,
                  ease: easing,
                },
              }}
              exit={{
                opacity: 0,
                scale: 1.015,

                transition: {
                  duration: 0.24,
                  ease: easing,
                },
              }}
              className="relative hidden overflow-hidden lg:block"
            >
              {links.map(
                (
                  link,
                  index,
                ) => (
                  <motion.div
                    key={link.href}
                    initial={false}
                    animate={{
                      opacity:
                        activeLinkIndex ===
                        index
                          ? 1
                          : 0,

                      scale:
                        activeLinkIndex ===
                        index
                          ? 1
                          : 1.035,
                    }}
                    transition={{
                      opacity: {
                        duration: 0.42,
                      },

                      scale: {
                        duration: 1.1,
                        ease: easing,
                      },
                    }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={link.image}
                      alt=""
                      fill
                      priority={
                        index === 0
                      }
                      sizes="64vw"
                      className="object-cover"
                    />
                  </motion.div>
                ),
              )}

              <div className="absolute inset-0 bg-black/22" />

              <div className="absolute inset-0 bg-gradient-to-r from-black/42 via-black/5 to-black/10" />

              <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/88 via-black/45 to-transparent" />

              <div className="absolute bottom-14 left-14 right-14 z-10 flex items-end justify-between gap-10 xl:bottom-16 xl:left-16 xl:right-16">
                <motion.div
                  key={activeLink.href}
                  initial={{
                    opacity: 0,
                    y: 18,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.42,
                    ease: easing,
                  }}
                >
                  <p className="text-[9px] uppercase tracking-[0.42em] text-gold">
                    {activeLink.eyebrow}
                  </p>

                  <h3 className="heading mt-4 max-w-3xl text-5xl font-light leading-none text-white xl:text-6xl">
                    {activeLink.label}
                  </h3>

                  <Link
                    href={activeLink.href}
                    onClick={(event) =>
                      handleNavigation(
                        event,
                        activeLink.href,
                      )
                    }
                    className="group mt-7 inline-flex items-center gap-4 text-[9px] uppercase tracking-[0.3em] text-white/55 transition hover:text-gold"
                  >
                    Descoperă

                    <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
                  </Link>
                </motion.div>

                <div className="shrink-0 text-right">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-white/35">
                    {String(
                      activeLinkIndex + 1,
                    ).padStart(
                      2,
                      "0",
                    )}
                    {" / "}
                    {String(
                      links.length,
                    ).padStart(
                      2,
                      "0",
                    )}
                  </p>

                  <div className="mt-5 text-[8px] uppercase tracking-[0.28em] text-white/38">
                    <p>
                      România
                    </p>

                    <p className="mt-2">
                      Boutique Escape
                    </p>

                    <p className="mt-2 text-gold">
                      Adults Only
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.div
              initial={{
                opacity: 0,
                scale: 1.04,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 1.01,

                transition: {
                  duration: 0.2,
                },
              }}
              transition={{
                duration: 0.6,
                ease: easing,
              }}
              className="pointer-events-none absolute inset-0 z-0 lg:hidden"
            >
              <Image
                src={activeLink.image}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-20"
              />

              <div className="absolute inset-0 bg-black/82" />

              <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-[#050505]/75 to-[#050505]" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}