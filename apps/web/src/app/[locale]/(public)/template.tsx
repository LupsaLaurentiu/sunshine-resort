import type {
  ReactNode,
} from "react";

import { PageTransition } from "@/components/layout/public/PageTransition";

type PublicTemplateProps = {
  children: ReactNode;
};

export default function PublicTemplate({
  children,
}: PublicTemplateProps) {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  );
}