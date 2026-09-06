import { MethodologyArticle } from "@/components/common/MethodologyArticle";
import { createPageMetadata } from "@/lib/metadata";
export const metadata = createPageMetadata({ title: "Reason about velocity", description: "Compare temporal windows and linked stages without turning speed into AI attribution.", path: "/methodology/velocity/" });
export default function Page() { return <MethodologyArticle slug="velocity" />; }
