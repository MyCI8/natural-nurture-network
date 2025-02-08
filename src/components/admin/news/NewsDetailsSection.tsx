
import { HeadingInput } from "./details/HeadingInput";
import { SlugInput } from "./details/SlugInput";
import { SummaryInput } from "./details/SummaryInput";

interface NewsDetailsSectionProps {
  heading: string;
  setHeading: (value: string) => void;
  slug: string;
  setSlug: (value: string) => void;
  summary: string;
  setSummary: (value: string) => void;
}

export const NewsDetailsSection = ({
  heading,
  setHeading,
  slug,
  setSlug,
  summary,
  setSummary,
}: NewsDetailsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">News Details</h3>
      <HeadingInput heading={heading} setHeading={setHeading} />
      <SlugInput slug={slug} setSlug={setSlug} />
      <SummaryInput summary={summary} setSummary={setSummary} />
    </div>
  );
};
