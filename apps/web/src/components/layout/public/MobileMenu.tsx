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

import {
  PUBLIC_ROUTES,
  getEquivalentLocaleHref,
  getLocaleFromPathname,
  getPublicHref,
  type PublicRouteKey,
} from "@/lib/public-routes";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

type MenuLink = {
  number: string;
  routeKey: PublicRouteKey;
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
    routeKey: "home",
    image: "/hero-mockup.jpg",
  },
  {
    number: "02",
    routeKey: "book",
    image:
      "/images/room-premium-2.jpg",
  },
  {
    number: "03",
    routeKey: "rooms",
    image:
      "/images/room-premium-1.jpg",
  },
  {
    number: "04",
    routeKey:
      "facilities",
    image:
      "/images/atractions-1.jpg",
  },
  {
    number: "05",
    routeKey:
      "saltWaterPool",
    image:
      "/images/pool-salt.jpg",
  },
  {
    number: "06",
    routeKey:
      "attractions",
    image:
      "/images/atractions-2.jpg",
  },
  {
    number: "07",
    routeKey: "gallery",
    image:
      "/images/room-deluxe-1.jpg",
  },
  {
    number: "08",
    routeKey: "about",
    image:
      "/images/about-slow.webp",
  },
  {
    number: "09",
    routeKey: "contact",
    image:
      "/images/ogna-sugatag-4.png",
  }
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

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const [
    activeLinkIndex,
    setActiveLinkIndex,
  ] = useState(0);

  const [
    isCompactLandscape,
    setIsCompactLandscape,
  ] = useState(false);

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

  const activeRoute =
    PUBLIC_ROUTES[
      activeLink.routeKey
    ];

  const activeLabel =
    activeRoute.labels[locale];

  const activeEyebrow =
    activeRoute.eyebrow[locale];

  const activeHref =
    getPublicHref(
      activeLink.routeKey,
      locale,
    );

  const romanianHref =
    getEquivalentLocaleHref(
      pathname,
      "ro",
    );

  const englishHref =
    getEquivalentLocaleHref(
      pathname,
      "en",
    );

  const bookingHref =
    getPublicHref(
      "book",
      locale,
    );

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

      if (
        !pendingHref ||
        pendingHref === pathname
      ) {
        return;
      }

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
    const compactLandscapeQuery =
      window.matchMedia(
        "(min-width: 768px) and (max-width: 1100px) and (max-height: 850px) and (orientation: landscape)",
      );

    function updateCompactLandscape() {
      setIsCompactLandscape(
        compactLandscapeQuery.matches,
      );
    }

    updateCompactLandscape();

    compactLandscapeQuery.addEventListener(
      "change",
      updateCompactLandscape,
    );

    return () => {
      compactLandscapeQuery.removeEventListener(
        "change",
        updateCompactLandscape,
      );
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      const currentRouteIndex =
        links.findIndex(
          (link) =>
            getPublicHref(
              link.routeKey,
              locale,
            ) === pathname ||
            `/${locale}${
              PUBLIC_ROUTES[
                link.routeKey
              ].internalPath
            }` === pathname,
        );

      setActiveLinkIndex(
        currentRouteIndex >= 0
          ? currentRouteIndex
          : 0,
      );
    }
  }, [
    isOpen,
    locale,
    pathname,
  ]);

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
            aria-label={
              locale === "ro"
                ? "Închide meniul"
                : "Close menu"
            }
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
            className={`absolute z-50 flex h-11 w-11 items-center justify-center text-white/65 transition hover:text-gold ${
              isCompactLandscape
                ? "left-4 top-4"
                : "left-5 top-5 md:left-7 md:top-7"
            }`}
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
            className={`absolute z-50 flex items-center uppercase ${
              isCompactLandscape
                ? "right-5 top-5 gap-4 text-[9px] tracking-[0.28em]"
                : "right-6 top-8 gap-5 text-[10px] tracking-[0.32em] md:right-8 md:top-9"
            }`}
          >
            <Link
              href={romanianHref}
              scroll={false}
              onClick={(event) =>
                handleNavigation(
                  event,
                  romanianHref,
                )
              }
              aria-current={
                locale === "ro"
                  ? "page"
                  : undefined
              }
              className={
                locale === "ro"
                  ? "text-gold"
                  : "text-white/65 transition hover:text-gold"
              }
            >
              RO
            </Link>

            <span className="text-white/25">
              /
            </span>

            <Link
              href={englishHref}
              scroll={false}
              onClick={(event) =>
                handleNavigation(
                  event,
                  englishHref,
                )
              }
              aria-current={
                locale === "en"
                  ? "page"
                  : undefined
              }
              className={
                locale === "en"
                  ? "text-gold"
                  : "text-white/65 transition hover:text-gold"
              }
            >
              EN
            </Link>

            <span className="h-5 w-px bg-white/20" />

            <Link
              href={bookingHref}
              onClick={(event) =>
                handleNavigation(
                  event,
                  bookingHref,
                )
              }
              className="text-gold transition hover:text-white"
            >
              {
                PUBLIC_ROUTES.book
                  .labels[locale]
              }
            </Link>
          </motion.div>

          <div className="grid h-full lg:grid-cols-[42%_58%]">
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
              <div
                className={
                  isCompactLandscape
                    ? "flex min-h-0 flex-1 flex-col px-7 pb-4 pt-16 sm:px-8 lg:px-8 lg:pb-4 lg:pt-5 xl:px-10"
                    : "flex min-h-0 flex-1 flex-col px-7 pb-7 pt-24 sm:px-10 lg:px-10 lg:pb-6 lg:pt-6 xl:px-12"
                }
              >
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
                      width: isCompactLandscape
                        ? "92px"
                        : "170px",
                      height: "auto",
                    }}
                    className="brightness-0 invert"
                  />

                  <div
                    className={
                      isCompactLandscape
                        ? "mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[7px] uppercase tracking-[0.28em]"
                        : "mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.34em] 2xl:text-[11px]"
                    }
                  >
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

                <nav
                  className={
                    isCompactLandscape
                      ? "flex min-h-0 flex-1 items-center py-1"
                      : "flex min-h-0 flex-1 items-center py-5 lg:py-2"
                  }
                >
                  <ul
                    className={
                      isCompactLandscape
                        ? "w-full space-y-0.5"
                        : "w-full space-y-1.5 sm:space-y-2 lg:space-y-1.5"
                    }
                  >
                    {links.map(
                      (
                        link,
                        index,
                      ) => {
                        const route =
                          PUBLIC_ROUTES[
                            link.routeKey
                          ];

                        const href =
                          getPublicHref(
                            link.routeKey,
                            locale,
                          );

                        const label =
                          route.labels[
                            locale
                          ];

                        const isActive =
                          activeLinkIndex ===
                          index;

                        return (
                          <motion.li
                            key={
                              link.routeKey
                            }
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
                              href={href}
                              onClick={(event) =>
                                handleNavigation(
                                  event,
                                  href,
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
                              className={
                                isCompactLandscape
                                  ? "group grid grid-cols-[28px_1fr] items-center gap-2 py-0.5"
                                  : "group grid grid-cols-[30px_1fr] items-center gap-2 py-0.5"
                              }
                            >
                              <span
                                className={`${
                                  isCompactLandscape
                                    ? "text-[7px] tracking-[0.24em]"
                                    : "text-[9px] tracking-[0.3em]"
                                } transition duration-300 ${
                                  isActive
                                    ? "text-gold"
                                    : "text-white/15"
                                }`}
                              >
                                {
                                  link.number
                                }
                              </span>

                              <span
                                className={
                                  isCompactLandscape
                                    ? "flex min-w-0 items-center gap-3"
                                    : "flex min-w-0 items-center gap-3"
                                }
                              >
                                <span
                                  className={`h-px shrink-0 transition-all duration-500 ${
                                    isActive
                                      ? isCompactLandscape
                                        ? "w-5 bg-gold"
                                        : "w-6 bg-gold"
                                      : isCompactLandscape
                                        ? "w-0 bg-gold/40 group-hover:w-5"
                                        : "w-0 bg-gold/40 group-hover:w-6"
                                  }`}
                                />

                                <span
                                  className={`heading min-w-0 font-light leading-none transition duration-500 ${
                                    isActive
                                      ? isCompactLandscape
                                        ? "translate-x-1 text-[1.5rem] text-gold xl:text-[1.62rem]"
                                        : "translate-x-1 text-[2rem] text-gold xl:text-[2.15rem] 2xl:text-[2.3rem]"
                                      : isCompactLandscape
                                        ? "text-[1.36rem] text-white/68 group-hover:translate-x-1 group-hover:text-gold xl:text-[1.48rem]"
                                        : "text-[1.82rem] text-white/68 group-hover:translate-x-1 group-hover:text-gold xl:text-[1.98rem] 2xl:text-[2.1rem]"
                                  }`}
                                >
                                  {label}
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
                  className={
                    isCompactLandscape
                      ? "flex items-end justify-between gap-4 border-t border-white/10 pt-3 text-[7px] uppercase tracking-[0.22em] text-white/25"
                      : "flex items-end justify-between gap-6 border-t border-white/10 pt-4 text-[7px] uppercase tracking-[0.26em] text-white/25"
                  }
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
                    key={
                      link.routeKey
                    }
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
                      sizes={
                        isCompactLandscape
                          ? "58vw"
                          : "58vw"
                      }
                      className="object-cover"
                    />
                  </motion.div>
                ),
              )}

              <div className="absolute inset-0 bg-black/22" />

              <div className="absolute inset-0 bg-gradient-to-r from-black/42 via-black/5 to-black/10" />

              <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/88 via-black/45 to-transparent" />

              <div
                className={
                  isCompactLandscape
                    ? "absolute bottom-7 left-8 right-8 z-10 flex items-end justify-between gap-6"
                    : "absolute bottom-10 left-8 right-8 z-10 flex items-end justify-between gap-8 xl:bottom-12 xl:left-10 xl:right-10"
                }
              >
                <motion.div
                  key={activeHref}
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
                    {activeEyebrow}
                  </p>

                  <h3
                    className={
                      isCompactLandscape
                        ? "heading mt-3 max-w-3xl text-4xl font-light leading-none text-white xl:text-[2.75rem]"
                        : "heading mt-3 max-w-3xl text-4xl font-light leading-none text-white xl:text-[2.75rem]"
                    }
                  >
                    {activeLabel}
                  </h3>

                  <Link
                    href={activeHref}
                    onClick={(event) =>
                      handleNavigation(
                        event,
                        activeHref,
                      )
                    }
                    className={
                      isCompactLandscape
                        ? "group mt-4 inline-flex items-center gap-3 text-[8px] uppercase tracking-[0.26em] text-white/55 transition hover:text-gold"
                        : "group mt-5 inline-flex items-center gap-3 text-[8px] uppercase tracking-[0.28em] text-white/55 transition hover:text-gold"
                    }
                  >
                    {locale === "ro"
                      ? "Descoperă"
                      : "Discover"}

                    <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
                  </Link>
                </motion.div>

                <div className="shrink-0 text-right">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-white/35">
                    {String(
                      activeLinkIndex +
                        1,
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
                      {locale === "ro"
                        ? "România"
                        : "Romania"}
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