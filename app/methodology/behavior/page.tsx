import { MethodologyArticle } from "@/components/common/MethodologyArticle";
import { createPageMetadata } from "@/lib/metadata";
export const metadata = createPageMetadata({ title: "Hunt behavior in context", description: "Establish roles, reconstruct sequences, and test alternative explanations.", path: "/methodology/behavior/" });
export default function Page() { return <MethodologyArticle slug="behavior" />; }
