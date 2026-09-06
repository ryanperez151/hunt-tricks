import { MethodologyArticle } from "@/components/common/MethodologyArticle";
import { createPageMetadata } from "@/lib/metadata";
export const metadata = createPageMetadata({ title: "Investigate AI and autonomy", description: "Separate automation, adaptation, corroborated AI involvement, and malicious intent.", path: "/methodology/ai-autonomy/" });
export default function Page() { return <MethodologyArticle slug="ai-autonomy" />; }
